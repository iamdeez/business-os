import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMock = vi.fn();
vi.mock("@/lib/resend", () => ({
  getResendClient: () => ({ emails: { send: sendMock } }),
  EMAIL_FROM: "noreply@test.com",
}));
vi.mock("./repository");

import * as repo from "./repository";
import { notifyInquiryReceived, notifyFilesShared } from "./service";

const tenantId = "t1";
const inquiryData = {
  inquiryId: "inq1",
  companyName: "ACME",
  contactName: "홍길동",
  email: "a@b.com",
  inquiryUrl: "https://app.test/inquiries/inq1",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("notifyInquiryReceived", () => {
  it("OWNER 가 없으면 NO_RECIPIENT", async () => {
    vi.mocked(repo.getTenantOwnerEmail).mockResolvedValue(null);
    const r = await notifyInquiryReceived(tenantId, inquiryData);
    expect(r).toMatchObject({ ok: false, code: "NO_RECIPIENT" });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("이미 SENT 면 재발송하지 않고 dedup", async () => {
    vi.mocked(repo.getTenantOwnerEmail).mockResolvedValue("owner@test.com");
    vi.mocked(repo.findByIdempotencyKey).mockResolvedValue({ id: "n1", status: "SENT" } as never);
    const r = await notifyInquiryReceived(tenantId, inquiryData);
    expect(r).toMatchObject({ ok: true, deduped: true });
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("정상 발송 시 markSent 를 호출한다", async () => {
    vi.mocked(repo.getTenantOwnerEmail).mockResolvedValue("owner@test.com");
    vi.mocked(repo.findByIdempotencyKey).mockResolvedValue(null);
    vi.mocked(repo.createPending).mockResolvedValue({ id: "n1" } as never);
    sendMock.mockResolvedValue({ data: { id: "resend-1" }, error: null });
    const r = await notifyInquiryReceived(tenantId, inquiryData);
    expect(r).toMatchObject({ ok: true });
    expect(repo.markSent).toHaveBeenCalledWith("n1", "resend-1");
    // idempotencyKey 규칙 확인
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "owner@test.com" }),
      { idempotencyKey: "inquiry_received:inq1" }
    );
  });

  it("provider 오류 시 markFailed + SEND_FAILED", async () => {
    vi.mocked(repo.getTenantOwnerEmail).mockResolvedValue("owner@test.com");
    vi.mocked(repo.findByIdempotencyKey).mockResolvedValue(null);
    vi.mocked(repo.createPending).mockResolvedValue({ id: "n1" } as never);
    sendMock.mockResolvedValue({ data: null, error: { name: "rate_limit" } });
    const r = await notifyInquiryReceived(tenantId, inquiryData);
    expect(r).toMatchObject({ ok: false, code: "SEND_FAILED" });
    expect(repo.markFailed).toHaveBeenCalledWith("n1", "rate_limit");
  });

  it("발송 예외(throw) 시 markFailed + SEND_FAILED", async () => {
    vi.mocked(repo.getTenantOwnerEmail).mockResolvedValue("owner@test.com");
    vi.mocked(repo.findByIdempotencyKey).mockResolvedValue(null);
    vi.mocked(repo.createPending).mockResolvedValue({ id: "n1" } as never);
    sendMock.mockRejectedValue(new Error("network"));
    const r = await notifyInquiryReceived(tenantId, inquiryData);
    expect(r).toMatchObject({ ok: false, code: "SEND_FAILED" });
    expect(repo.markFailed).toHaveBeenCalled();
  });

  it("동시 생성(P2002) 후 기존이 SENT 면 dedup", async () => {
    vi.mocked(repo.getTenantOwnerEmail).mockResolvedValue("owner@test.com");
    vi.mocked(repo.findByIdempotencyKey)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "n1", status: "SENT" } as never);
    vi.mocked(repo.createPending).mockRejectedValue({ code: "P2002" });
    const r = await notifyInquiryReceived(tenantId, inquiryData);
    expect(r).toMatchObject({ ok: true, deduped: true });
    expect(sendMock).not.toHaveBeenCalled();
  });
});

describe("notifyFilesShared", () => {
  const data = {
    shareLinkId: "s1",
    customerName: "ACME",
    shareUrl: "https://app.test/share/tok",
    fileCount: 2,
    expiresAt: "2026-07-05",
  };

  it("정상 발송 시 files_shared idempotencyKey 를 사용한다", async () => {
    vi.mocked(repo.findByIdempotencyKey).mockResolvedValue(null);
    vi.mocked(repo.createPending).mockResolvedValue({ id: "n2" } as never);
    sendMock.mockResolvedValue({ data: { id: "resend-2" }, error: null });
    const r = await notifyFilesShared(tenantId, "customer@test.com", data);
    expect(r).toMatchObject({ ok: true });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "customer@test.com" }),
      { idempotencyKey: "files_shared:s1" }
    );
  });
});
