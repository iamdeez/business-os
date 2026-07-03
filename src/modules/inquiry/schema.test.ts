import { describe, it, expect } from "vitest";
import { inquiryFormSchema, inquiryStatusSchema, connectCustomerSchema } from "./schema";

const validForm = {
  requestId: "550e8400-e29b-41d4-a716-446655440000",
  companyName: "ACME",
  contactName: "홍길동",
  email: "a@b.com",
  phone: "",
  message: "충분히 긴 문의 메시지입니다. 프로젝트 유형과 일정.",
  honeypot: "",
};

describe("inquiryFormSchema", () => {
  it("유효한 공개 문의를 통과시킨다", () => {
    expect(inquiryFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("requestId 는 UUID 여야 한다 (멱등 키)", () => {
    expect(inquiryFormSchema.safeParse({ ...validForm, requestId: "not-uuid" }).success).toBe(false);
  });

  it("message 는 10자 이상이어야 한다", () => {
    expect(inquiryFormSchema.safeParse({ ...validForm, message: "짧음" }).success).toBe(false);
  });

  it("honeypot 이 채워지면 거부한다 (봇 차단)", () => {
    expect(inquiryFormSchema.safeParse({ ...validForm, honeypot: "bot" }).success).toBe(false);
  });

  it("이메일 형식을 검증한다", () => {
    expect(inquiryFormSchema.safeParse({ ...validForm, email: "bad" }).success).toBe(false);
  });
});

describe("inquiryStatusSchema", () => {
  it("허용 상태(NEW/IN_PROGRESS/RESOLVED)만 통과", () => {
    expect(inquiryStatusSchema.safeParse({ status: "NEW" }).success).toBe(true);
    expect(inquiryStatusSchema.safeParse({ status: "IN_PROGRESS" }).success).toBe(true);
    expect(inquiryStatusSchema.safeParse({ status: "RESOLVED" }).success).toBe(true);
    expect(inquiryStatusSchema.safeParse({ status: "DONE" }).success).toBe(false);
  });
});

describe("connectCustomerSchema", () => {
  it("customerId 는 필수", () => {
    expect(connectCustomerSchema.safeParse({ customerId: "c1" }).success).toBe(true);
    expect(connectCustomerSchema.safeParse({ customerId: "" }).success).toBe(false);
  });
});
