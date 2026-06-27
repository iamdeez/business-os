import { randomBytes, createHash } from "node:crypto";

/**
 * 공유 링크 토큰 — 원문은 1회만 반환하고 저장은 해시만 한다.
 * URL-safe(base64url) 32바이트 토큰을 사용한다.
 */
export function generateShareToken(): string {
  return randomBytes(32).toString("base64url");
}

/** 토큰 원문 → sha256 hex 해시. 저장·조회 시 동일 함수를 사용한다. */
export function hashShareToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
