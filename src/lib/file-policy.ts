/**
 * 파일 업로드 정책 — 순수 모듈.
 * IO·server-only 의존이 없어 단위 테스트에서 직접 import 가능하다.
 * S3 클라이언트(IO)는 `s3.ts`에 두고, 정책·검증·key 생성만 여기서 관리한다.
 */

export const FILE_POLICY = {
  /** 파일당 최대 크기 (100 MiB) */
  maxBytes: 100 * 1024 * 1024,
  /** 허용 MIME 유형 */
  allowedMime: new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
  ]),
  /** 실행 파일·스크립트·HTML은 항상 거부 */
  blockedExtensions: new Set([
    ".exe", ".msi", ".bat", ".cmd", ".sh", ".ps1",
    ".html", ".htm", ".js", ".ts", ".php", ".py",
  ]),
} as const;

/** 허용 확장자 → 기대 MIME. MIME/확장자 불일치 거부에 사용한다. */
const EXTENSION_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip",
};

/** 파일명에서 소문자 확장자(점 포함)를 추출한다. 없으면 빈 문자열. */
export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export type FilePolicyError =
  | "EMPTY_NAME"
  | "BLOCKED_EXTENSION"
  | "MIME_NOT_ALLOWED"
  | "EXTENSION_MISMATCH"
  | "SIZE_INVALID"
  | "SIZE_EXCEEDED";

export const FILE_POLICY_MESSAGE: Record<FilePolicyError, string> = {
  EMPTY_NAME: "파일명이 비어 있습니다",
  BLOCKED_EXTENSION: "허용되지 않는 파일 형식입니다",
  MIME_NOT_ALLOWED: "허용되지 않는 파일 형식입니다",
  EXTENSION_MISMATCH: "파일 확장자와 형식이 일치하지 않습니다",
  SIZE_INVALID: "파일 크기가 올바르지 않습니다",
  SIZE_EXCEEDED: "파일 크기가 최대 허용치를 초과했습니다",
};

/** 정책 검증 (순수). 통과 시 null, 위반 시 사유 코드를 반환한다. */
export function validateFilePolicy(input: {
  displayName: string;
  mimeType: string;
  size: number;
}): FilePolicyError | null {
  const name = input.displayName.trim();
  if (!name) return "EMPTY_NAME";

  const ext = fileExtension(name);
  if (FILE_POLICY.blockedExtensions.has(ext)) return "BLOCKED_EXTENSION";

  if (!FILE_POLICY.allowedMime.has(input.mimeType)) return "MIME_NOT_ALLOWED";

  const expected = EXTENSION_MIME[ext];
  if (!expected || expected !== input.mimeType) return "EXTENSION_MISMATCH";

  if (!Number.isInteger(input.size) || input.size <= 0) return "SIZE_INVALID";
  if (input.size > FILE_POLICY.maxBytes) return "SIZE_EXCEEDED";

  return null;
}

/**
 * S3 object key 생성: `{tenantId}/customers/{customerId}/{yyyy}/{mm}/{uploadId}`
 * `now`는 테스트 주입용이며 기본값은 현재 시각(UTC)이다.
 */
export function buildS3Key(
  tenantId: string,
  customerId: string,
  uploadId: string,
  now: Date = new Date()
): string {
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${tenantId}/customers/${customerId}/${yyyy}/${mm}/${uploadId}`;
}
