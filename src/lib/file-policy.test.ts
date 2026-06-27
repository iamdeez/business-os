import { describe, it, expect } from "vitest";
import {
  validateFilePolicy,
  buildS3Key,
  fileExtension,
  FILE_POLICY,
} from "./file-policy";

describe("validateFilePolicy", () => {
  const ok = { displayName: "report.pdf", mimeType: "application/pdf", size: 1024 };

  it("허용 유형·크기·확장자 일치 시 통과한다", () => {
    expect(validateFilePolicy(ok)).toBeNull();
  });

  it("빈 파일명을 거부한다", () => {
    expect(validateFilePolicy({ ...ok, displayName: "   " })).toBe("EMPTY_NAME");
  });

  it("차단 확장자(실행·스크립트·HTML)를 거부한다", () => {
    expect(
      validateFilePolicy({ displayName: "evil.exe", mimeType: "application/pdf", size: 10 })
    ).toBe("BLOCKED_EXTENSION");
    expect(
      validateFilePolicy({ displayName: "x.html", mimeType: "application/pdf", size: 10 })
    ).toBe("BLOCKED_EXTENSION");
  });

  it("허용되지 않는 MIME 을 거부한다", () => {
    expect(
      validateFilePolicy({ displayName: "a.pdf", mimeType: "application/x-evil", size: 10 })
    ).toBe("MIME_NOT_ALLOWED");
  });

  it("확장자와 MIME 불일치를 거부한다", () => {
    expect(
      validateFilePolicy({ displayName: "report.pdf", mimeType: "image/png", size: 10 })
    ).toBe("EXTENSION_MISMATCH");
  });

  it("0 이하·비정수 크기를 거부한다", () => {
    expect(validateFilePolicy({ ...ok, size: 0 })).toBe("SIZE_INVALID");
    expect(validateFilePolicy({ ...ok, size: -1 })).toBe("SIZE_INVALID");
    expect(validateFilePolicy({ ...ok, size: 1.5 })).toBe("SIZE_INVALID");
  });

  it("최대 크기 경계값을 처리한다", () => {
    expect(validateFilePolicy({ ...ok, size: FILE_POLICY.maxBytes })).toBeNull();
    expect(validateFilePolicy({ ...ok, size: FILE_POLICY.maxBytes + 1 })).toBe("SIZE_EXCEEDED");
  });

  it("대문자 확장자도 정상 인식한다", () => {
    expect(
      validateFilePolicy({ displayName: "PHOTO.PNG", mimeType: "image/png", size: 10 })
    ).toBeNull();
  });
});

describe("fileExtension", () => {
  it("점 이후 소문자 확장자를 반환한다", () => {
    expect(fileExtension("a.PDF")).toBe(".pdf");
    expect(fileExtension("archive.tar.gz")).toBe(".gz");
  });
  it("확장자가 없으면 빈 문자열을 반환한다", () => {
    expect(fileExtension("noext")).toBe("");
  });
});

describe("buildS3Key", () => {
  it("tenant/customer/연/월/uploadId 형식으로 생성한다", () => {
    const now = new Date("2026-03-09T00:00:00Z");
    expect(buildS3Key("t1", "c1", "u1", now)).toBe("t1/customers/c1/2026/03/u1");
  });
});
