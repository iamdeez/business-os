import { describe, it, expect } from "vitest";
import { customerSchema } from "./schema";

const valid = {
  companyName: "ACME",
  contactName: "홍길동",
  email: "a@b.com",
  phone: "",
  memo: "",
  status: "ACTIVE" as const,
};

describe("customerSchema", () => {
  it("유효한 입력을 통과시킨다", () => {
    expect(customerSchema.safeParse(valid).success).toBe(true);
  });

  it("status 미지정 시 ACTIVE 기본값", () => {
    const r = customerSchema.safeParse({
      companyName: "ACME",
      contactName: "홍길동",
      email: "a@b.com",
      phone: "",
      memo: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.status).toBe("ACTIVE");
  });

  it("회사명·담당자명은 필수", () => {
    expect(customerSchema.safeParse({ ...valid, companyName: "" }).success).toBe(false);
    expect(customerSchema.safeParse({ ...valid, contactName: "" }).success).toBe(false);
  });

  it("이메일 형식을 검증한다", () => {
    expect(customerSchema.safeParse({ ...valid, email: "notanemail" }).success).toBe(false);
  });

  it("phone·memo 는 빈 문자열/미지정 모두 허용", () => {
    expect(customerSchema.safeParse({ ...valid, phone: "", memo: "" }).success).toBe(true);
    expect(
      customerSchema.safeParse({
        companyName: "ACME",
        contactName: "홍길동",
        email: "a@b.com",
        status: "ACTIVE",
      }).success
    ).toBe(true);
  });

  it("status enum 외 값을 거부한다", () => {
    expect(customerSchema.safeParse({ ...valid, status: "UNKNOWN" }).success).toBe(false);
  });

  it("길이 상한(회사명 100·담당자 50·메모 1000)을 초과하면 거부", () => {
    expect(customerSchema.safeParse({ ...valid, companyName: "a".repeat(101) }).success).toBe(false);
    expect(customerSchema.safeParse({ ...valid, contactName: "a".repeat(51) }).success).toBe(false);
    expect(customerSchema.safeParse({ ...valid, memo: "a".repeat(1001) }).success).toBe(false);
  });
});
