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
      // S3 호환 스토리지(R2 등) 사용 시 커스텀 엔드포인트 + path-style.
      ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT, forcePathStyle: true } : {}),
      // 최신 aws-sdk 기본 checksum 헤더는 R2/MinIO presigned PUT 서명을 깨뜨리므로 필요 시에만 계산.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return _client;
}

export const S3_BUCKET = env.AWS_S3_BUCKET;

// 파일 정책은 순수 모듈로 분리해 단위 테스트가 가능하도록 한다.
export { FILE_POLICY } from "./file-policy";
