import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./repository");
vi.mock("@/modules/notification/service", () => ({ notifyInquiryReceived: vi.fn() }));

import * as repo from "./repository";
import { notifyInquiryReceived } from "@/modules/notification/service";
import { submitInquiryAction } from "./actions";

function formData(overrides: Record<string, string> = {}) {
  const f = new FormData();
  f.set("requestId", "550e8400-e29b-41d4-a716-446655440000");
  f.set("companyName", "ACME");
  f.set("contactName", "홍길동");
  f.set("email", "a@b.com");
  f.set("phone", "");
  f.set("message", "충분히 긴 문의 메시지입니다. 프로젝트 유형과 일정.");
  f.set("honeypot", "");
  for (const [k, v] of Object.entries(overrides)) f.set(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("submitInquiryAction — 이메일 알림 트리거", () => {
  it("신규 접수 시 OWNER 에게 알림을 트리거한다", async () => {
    vi.mocked(repo.resolveSlug).mockResolvedValue({ id: "t1", name: "T" } as never);
    vi.mocked(repo.submitInquiry).mockResolvedValue({ id: "inq1", created: true } as never);

    const r = await submitInquiryAction("demo-agency", { status: "idle" }, formData());

    expect(r.status).toBe("success");
    expect(notifyInquiryReceived).toHaveBeenCalledWith(
      "t1",
      expect.objectContaining({ inquiryId: "inq1", email: "a@b.com", companyName: "ACME" })
    );
  });

  it("중복 접수(created=false)면 재알림하지 않는다", async () => {
    vi.mocked(repo.resolveSlug).mockResolvedValue({ id: "t1" } as never);
    vi.mocked(repo.submitInquiry).mockResolvedValue({ id: "inq1", created: false } as never);

    await submitInquiryAction("demo-agency", { status: "idle" }, formData());

    expect(notifyInquiryReceived).not.toHaveBeenCalled();
  });

  it("알림 실패가 접수 성공을 막지 않는다 (비차단)", async () => {
    vi.mocked(repo.resolveSlug).mockResolvedValue({ id: "t1" } as never);
    vi.mocked(repo.submitInquiry).mockResolvedValue({ id: "inq1", created: true } as never);
    vi.mocked(notifyInquiryReceived).mockRejectedValue(new Error("resend down"));

    const r = await submitInquiryAction("demo-agency", { status: "idle" }, formData());

    expect(r.status).toBe("success");
  });

  it("honeypot 이 채워지면 접수를 거부하고 알림하지 않는다", async () => {
    const r = await submitInquiryAction("demo-agency", { status: "idle" }, formData({ honeypot: "bot" }));

    expect(r.status).toBe("error");
    expect(repo.submitInquiry).not.toHaveBeenCalled();
    expect(notifyInquiryReceived).not.toHaveBeenCalled();
  });

  it("존재하지 않는 slug 는 접수·알림하지 않는다", async () => {
    vi.mocked(repo.resolveSlug).mockResolvedValue(null);

    const r = await submitInquiryAction("nope", { status: "idle" }, formData());

    expect(r.status).toBe("error");
    expect(notifyInquiryReceived).not.toHaveBeenCalled();
  });
});
