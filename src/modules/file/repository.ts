import "server-only";
import { db } from "@/lib/db";

// uploadId 로 tenant 범위 내 업로드 예약을 조회한다.
export async function findUploadById(tenantId: string, uploadId: string) {
  return db.fileUpload.findFirst({ where: { tenantId, uploadId } });
}

export async function createUpload(data: {
  uploadId: string;
  tenantId: string;
  customerId: string;
  s3Key: string;
  displayName: string;
  mimeType: string;
  size: number;
}) {
  return db.fileUpload.create({ data });
}

export async function markUploadFailed(uploadId: string) {
  return db.fileUpload.update({
    where: { uploadId },
    data: { status: "FAILED" },
  });
}

// uploadId 로 확정된 FileItem 을 조회한다 (complete 멱등성).
export async function findFileItemByUploadId(tenantId: string, uploadId: string) {
  return db.fileItem.findFirst({ where: { tenantId, uploadId } });
}

// FileItem 생성과 FileUpload 상태 전이를 단일 transaction 으로 확정한다.
export async function confirmUpload(data: {
  tenantId: string;
  customerId: string;
  uploadId: string;
  displayName: string;
  s3Key: string;
  size: number;
  mimeType: string;
}) {
  return db.$transaction(async (tx) => {
    const fileItem = await tx.fileItem.create({
      data: {
        tenantId: data.tenantId,
        customerId: data.customerId,
        uploadId: data.uploadId,
        displayName: data.displayName,
        s3Key: data.s3Key,
        size: data.size,
        mimeType: data.mimeType,
      },
    });
    await tx.fileUpload.update({
      where: { uploadId: data.uploadId },
      data: { status: "COMPLETED" },
    });
    return fileItem;
  });
}

// tenant·customer 범위의 확정된 파일 목록 (공유 대상 선택용).
export async function listFileItems(tenantId: string, customerId: string) {
  return db.fileItem.findMany({
    where: { tenantId, customerId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * 공유 링크 생성. transaction 안에서 fileItemId 전체를 tenant·customer 조건으로
 * 재조회하고 개수가 일치할 때만 연결한다 (교차 tenant·타 고객 파일 혼입 차단).
 */
export async function createShareLink(params: {
  tenantId: string;
  customerId: string;
  fileItemIds: string[];
  tokenHash: string;
  expiresAt: Date;
}) {
  return db.$transaction(async (tx) => {
    const items = await tx.fileItem.findMany({
      where: {
        tenantId: params.tenantId,
        customerId: params.customerId,
        id: { in: params.fileItemIds },
      },
      select: { id: true },
    });
    if (items.length !== params.fileItemIds.length) {
      return { ok: false as const };
    }
    const link = await tx.shareLink.create({
      data: {
        tenantId: params.tenantId,
        customerId: params.customerId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
        files: { create: items.map((i) => ({ fileItemId: i.id })) },
      },
    });
    return { ok: true as const, link };
  });
}

// tokenHash 로 공유 링크와 연결 파일을 조회한다 (공개 화면·다운로드 검증용).
export async function findShareLinkByTokenHash(tokenHash: string) {
  return db.shareLink.findUnique({
    where: { tokenHash },
    include: { files: { include: { fileItem: true } } },
  });
}

// tenant 범위에서 미폐기 공유 링크를 폐기한다. 성공 시 true.
export async function revokeShareLink(tenantId: string, id: string) {
  const result = await db.shareLink.updateMany({
    where: { id, tenantId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count > 0;
}

// tenant·customer 범위의 공유 링크 목록 (폐기·만료 상태 포함).
export async function listShareLinks(tenantId: string, customerId: string) {
  return db.shareLink.findMany({
    where: { tenantId, customerId },
    orderBy: { createdAt: "desc" },
    include: { files: { include: { fileItem: true } } },
  });
}
