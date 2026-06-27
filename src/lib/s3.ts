import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

let _client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return _client;
}

export const S3_BUCKET = env.AWS_S3_BUCKET;

/** 허용 MIME 유형과 최대 크기 (100 MiB) */
export const FILE_POLICY = {
  maxBytes: 100 * 1024 * 1024,
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
