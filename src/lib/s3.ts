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

// 파일 정책은 순수 모듈로 분리해 단위 테스트가 가능하도록 한다.
export { FILE_POLICY } from "./file-policy";
