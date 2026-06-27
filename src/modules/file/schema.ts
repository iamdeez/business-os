import { z } from "zod";

// uploadId 는 클라이언트가 생성하는 멱등 토큰이다.
// crypto.randomUUID() 는 비-secure context(HTTP+비localhost)에서 실패하므로
// 엄격한 RFC UUID 대신 S3 key 에 안전한 토큰 형식으로 검증한다.
// (UUID(대시 포함/제거), 폴백 토큰 모두 허용)
const uploadIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{16,64}$/, "올바른 uploadId 형식이 아닙니다");

export const presignInputSchema = z.object({
  customerId: z.string().min(1, "고객사를 선택하세요"),
  uploadId: uploadIdSchema,
  displayName: z.string().min(1, "파일명을 입력하세요").max(255),
  mimeType: z.string().min(1, "파일 형식이 필요합니다"),
  size: z.number().int().positive("파일 크기가 올바르지 않습니다"),
});
export type PresignInput = z.infer<typeof presignInputSchema>;

export const completeInputSchema = z.object({
  uploadId: uploadIdSchema,
});
export type CompleteInput = z.infer<typeof completeInputSchema>;
