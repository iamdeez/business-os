import { describe, it, expect } from "vitest";
import { generateShareToken, hashShareToken } from "./share-token";

describe("generateShareToken", () => {
  it("URL-safe 문자만 포함한다 (base64url)", () => {
    const token = generateShareToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("매 호출마다 다른 토큰을 생성한다", () => {
    const a = generateShareToken();
    const b = generateShareToken();
    expect(a).not.toBe(b);
  });

  it("충분한 길이(32바이트≈43자)를 가진다", () => {
    expect(generateShareToken().length).toBeGreaterThanOrEqual(43);
  });
});

describe("hashShareToken", () => {
  it("동일 입력에 동일 sha256 hex(64자)를 반환한다", () => {
    const h1 = hashShareToken("abc");
    const h2 = hashShareToken("abc");
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("다른 입력은 다른 해시를 반환한다", () => {
    expect(hashShareToken("abc")).not.toBe(hashShareToken("abd"));
  });
});
