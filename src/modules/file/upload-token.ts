/**
 * 업로드 멱등 토큰 생성 (클라이언트).
 * `crypto.randomUUID()` 는 비-secure context(HTTP+비localhost)에서 실패하므로
 * 사용하지 않는다. 백엔드 검증 정규식 `^[A-Za-z0-9_-]{16,64}$` 를 충족하는
 * URL-safe 토큰을 생성한다.
 */
export function generateUploadId(): string {
  const rand = () => Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}-${rand()}${rand()}`.slice(0, 40);
}
