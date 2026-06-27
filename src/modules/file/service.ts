import "server-only";
import { PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, S3_BUCKET } from "@/lib/s3";
import {
  validateFilePolicy,
  buildS3Key,
  FILE_POLICY_MESSAGE,
} from "@/lib/file-policy";
import { generateShareToken, hashShareToken } from "@/lib/share-token";
import { getCustomer } from "@/modules/crm/repository";
import type { PresignInput, CompleteInput } from "./schema";
import {
  findUploadById,
  createUpload,
  markUploadFailed,
  findFileItemByUploadId,
  confirmUpload,
  createShareLink,
  findShareLinkByTokenHash,
  revokeShareLink,
} from "./repository";

/** presigned PUT 수명 (5분) */
export const UPLOAD_URL_TTL = 5 * 60;

type ReserveError =
  | "CUSTOMER_NOT_FOUND"
  | "ALREADY_COMPLETED"
  | "UPLOAD_CONFLICT"
  | Awaited<ReturnType<typeof validateFilePolicy>>;

export type ReserveResult =
  | { ok: true; uploadId: string; uploadUrl: string; s3Key: string; expiresIn: number }
  | { ok: false; code: NonNullable<ReserveError>; message: string };

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

/**
 * 업로드 예약 + presigned PUT 발급.
 * 멱등성: 동일 uploadId 재요청 시 같은 s3Key 로 URL 을 재발급한다.
 * 이미 COMPLETED 된 uploadId 는 재업로드를 거부한다.
 */
export async function reserveUpload(
  tenantId: string,
  input: PresignInput
): Promise<ReserveResult> {
  // 1. 고객사 tenant 소유 검증
  const customer = await getCustomer(tenantId, input.customerId);
  if (!customer) {
    return { ok: false, code: "CUSTOMER_NOT_FOUND", message: "고객사를 찾을 수 없습니다" };
  }

  // 2. 파일 정책 검증
  const policyError = validateFilePolicy(input);
  if (policyError) {
    return { ok: false, code: policyError, message: FILE_POLICY_MESSAGE[policyError] };
  }

  // 3. 멱등성 — 기존 예약 확인
  let s3Key: string;
  const existing = await findUploadById(tenantId, input.uploadId);
  if (existing) {
    if (existing.status === "COMPLETED") {
      return { ok: false, code: "ALREADY_COMPLETED", message: "이미 업로드가 완료된 항목입니다" };
    }
    if (existing.customerId !== input.customerId) {
      return { ok: false, code: "UPLOAD_CONFLICT", message: "uploadId 가 다른 요청에 사용되었습니다" };
    }
    s3Key = existing.s3Key;
  } else {
    s3Key = buildS3Key(tenantId, input.customerId, input.uploadId);
    try {
      await createUpload({
        uploadId: input.uploadId,
        tenantId,
        customerId: input.customerId,
        s3Key,
        displayName: input.displayName,
        mimeType: input.mimeType,
        size: input.size,
      });
    } catch (error) {
      // 동시 요청으로 같은 uploadId 가 먼저 생성된 경우: 기존 예약을 재사용한다.
      if (!isUniqueViolation(error)) throw error;
      const raced = await findUploadById(tenantId, input.uploadId);
      if (!raced) throw error;
      if (raced.status === "COMPLETED") {
        return { ok: false, code: "ALREADY_COMPLETED", message: "이미 업로드가 완료된 항목입니다" };
      }
      s3Key = raced.s3Key;
    }
  }

  // 4. presigned PUT 발급
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    ContentType: input.mimeType,
  });
  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: UPLOAD_URL_TTL });

  return { ok: true, uploadId: input.uploadId, uploadUrl, s3Key, expiresIn: UPLOAD_URL_TTL };
}

export type CompleteResult =
  | { ok: true; fileItem: Awaited<ReturnType<typeof confirmUpload>> }
  | { ok: false; code: "UPLOAD_NOT_FOUND" | "OBJECT_NOT_FOUND" | "SIZE_MISMATCH"; message: string };

/**
 * 업로드 확정. S3 객체 존재·크기를 확인한 뒤 FileItem 을 생성한다.
 * 멱등성: 이미 확정된 uploadId 는 기존 FileItem 을 반환한다.
 */
export async function completeUpload(
  tenantId: string,
  input: CompleteInput
): Promise<CompleteResult> {
  const upload = await findUploadById(tenantId, input.uploadId);
  if (!upload) {
    return { ok: false, code: "UPLOAD_NOT_FOUND", message: "업로드 예약을 찾을 수 없습니다" };
  }

  // 멱등성 — 이미 확정된 경우 기존 FileItem 반환
  const existingItem = await findFileItemByUploadId(tenantId, input.uploadId);
  if (existingItem) {
    return { ok: true, fileItem: existingItem };
  }

  // S3 객체 확인
  let head;
  try {
    head = await getS3Client().send(
      new HeadObjectCommand({ Bucket: S3_BUCKET, Key: upload.s3Key })
    );
  } catch {
    await markUploadFailed(upload.uploadId);
    return { ok: false, code: "OBJECT_NOT_FOUND", message: "업로드된 파일을 확인할 수 없습니다" };
  }

  if (head.ContentLength != null && head.ContentLength !== upload.size) {
    await markUploadFailed(upload.uploadId);
    return { ok: false, code: "SIZE_MISMATCH", message: "업로드된 파일 크기가 일치하지 않습니다" };
  }

  try {
    const fileItem = await confirmUpload({
      tenantId,
      customerId: upload.customerId,
      uploadId: upload.uploadId,
      displayName: upload.displayName,
      s3Key: upload.s3Key,
      size: upload.size,
      mimeType: upload.mimeType,
    });
    return { ok: true, fileItem };
  } catch (error) {
    // 동시 confirm 으로 FileItem 이 먼저 생성된 경우: 기존 항목을 반환한다.
    if (!isUniqueViolation(error)) throw error;
    const raced = await findFileItemByUploadId(tenantId, input.uploadId);
    if (!raced) throw error;
    return { ok: true, fileItem: raced };
  }
}

/** 다운로드 presigned GET 수명 (15분) */
export const DOWNLOAD_URL_TTL = 15 * 60;
/** 공유 링크 기본 만료 (7일) */
export const SHARE_LINK_TTL_DAYS = 7;

export type CreateShareResult =
  | { ok: true; token: string; shareLinkId: string; expiresAt: Date }
  | { ok: false; code: "NO_FILES" | "CUSTOMER_NOT_FOUND" | "FILE_MISMATCH"; message: string };

/**
 * 선택 FileItem 으로 공유 링크를 생성한다.
 * token 원문은 1회만 반환하고 저장은 해시만 한다. 기본 만료 7일.
 */
export async function createShare(
  tenantId: string,
  customerId: string,
  fileItemIds: string[]
): Promise<CreateShareResult> {
  const unique = [...new Set(fileItemIds)];
  if (unique.length === 0) {
    return { ok: false, code: "NO_FILES", message: "공유할 파일을 선택하세요" };
  }

  const customer = await getCustomer(tenantId, customerId);
  if (!customer) {
    return { ok: false, code: "CUSTOMER_NOT_FOUND", message: "고객사를 찾을 수 없습니다" };
  }

  const token = generateShareToken();
  const tokenHash = hashShareToken(token);
  const expiresAt = new Date(Date.now() + SHARE_LINK_TTL_DAYS * 24 * 60 * 60 * 1000);

  const result = await createShareLink({ tenantId, customerId, fileItemIds: unique, tokenHash, expiresAt });
  if (!result.ok) {
    return { ok: false, code: "FILE_MISMATCH", message: "선택한 파일을 찾을 수 없습니다" };
  }

  return { ok: true, token, shareLinkId: result.link.id, expiresAt };
}

export async function revokeShare(tenantId: string, shareLinkId: string) {
  const ok = await revokeShareLink(tenantId, shareLinkId);
  return ok
    ? ({ ok: true } as const)
    : ({ ok: false, code: "NOT_FOUND", message: "공유 링크를 찾을 수 없습니다" } as const);
}

type ShareInvalid = "NOT_FOUND" | "EXPIRED" | "REVOKED";

export type ResolveShareResult =
  | { ok: true; link: NonNullable<Awaited<ReturnType<typeof findShareLinkByTokenHash>>> }
  | { ok: false; code: ShareInvalid };

/** 공개 토큰을 해석한다. hash·폐기·만료를 검증한다. */
export async function resolveShare(token: string): Promise<ResolveShareResult> {
  const link = await findShareLinkByTokenHash(hashShareToken(token));
  if (!link) return { ok: false, code: "NOT_FOUND" };
  if (link.revokedAt) return { ok: false, code: "REVOKED" };
  if (link.expiresAt.getTime() <= Date.now()) return { ok: false, code: "EXPIRED" };
  return { ok: true, link };
}

export type DownloadResult =
  | { ok: true; url: string }
  | { ok: false; code: ShareInvalid | "FILE_NOT_IN_LINK" };

/** 공유 토큰·파일을 검증하고 15분 presigned GET URL 을 발급한다. */
export async function getDownloadUrl(token: string, fileItemId: string): Promise<DownloadResult> {
  const resolved = await resolveShare(token);
  if (!resolved.ok) return { ok: false, code: resolved.code };

  const match = resolved.link.files.find((f) => f.fileItemId === fileItemId);
  if (!match) return { ok: false, code: "FILE_NOT_IN_LINK" };

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: match.fileItem.s3Key,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(match.fileItem.displayName)}"`,
  });
  const url = await getSignedUrl(getS3Client(), command, { expiresIn: DOWNLOAD_URL_TTL });
  return { ok: true, url };
}
