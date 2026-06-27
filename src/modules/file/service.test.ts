import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/s3", () => ({ getS3Client: vi.fn(), S3_BUCKET: "test-bucket" }));
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://signed.example/url"),
}));
vi.mock("@/modules/crm/repository", () => ({ getCustomer: vi.fn() }));
vi.mock("./repository");

import * as repo from "./repository";
import { getCustomer } from "@/modules/crm/repository";
import { getS3Client } from "@/lib/s3";
import { reserveUpload, completeUpload, createShare, resolveShare, getDownloadUrl } from "./service";

const tenantId = "t1";
const validInput = {
  customerId: "c1",
  uploadId: "upload0001abcdef0001",
  displayName: "report.pdf",
  mimeType: "application/pdf",
  size: 1000,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("reserveUpload", () => {
  it("고객사가 없으면 CUSTOMER_NOT_FOUND", async () => {
    vi.mocked(getCustomer).mockResolvedValue(null);
    const r = await reserveUpload(tenantId, validInput);
    expect(r).toMatchObject({ ok: false, code: "CUSTOMER_NOT_FOUND" });
  });

  it("정책 위반(차단 확장자)을 거부한다", async () => {
    vi.mocked(getCustomer).mockResolvedValue({ id: "c1" } as never);
    const r = await reserveUpload(tenantId, { ...validInput, displayName: "x.exe" });
    expect(r).toMatchObject({ ok: false, code: "BLOCKED_EXTENSION" });
  });

  it("신규 업로드를 예약하고 presigned URL 을 반환한다", async () => {
    vi.mocked(getCustomer).mockResolvedValue({ id: "c1" } as never);
    vi.mocked(repo.findUploadById).mockResolvedValue(null);
    vi.mocked(repo.createUpload).mockResolvedValue({} as never);
    const r = await reserveUpload(tenantId, validInput);
    expect(r).toMatchObject({ ok: true, uploadUrl: "https://signed.example/url" });
    expect(repo.createUpload).toHaveBeenCalledOnce();
  });

  it("이미 완료된 uploadId 는 ALREADY_COMPLETED", async () => {
    vi.mocked(getCustomer).mockResolvedValue({ id: "c1" } as never);
    vi.mocked(repo.findUploadById).mockResolvedValue({ status: "COMPLETED", customerId: "c1", s3Key: "k" } as never);
    const r = await reserveUpload(tenantId, validInput);
    expect(r).toMatchObject({ ok: false, code: "ALREADY_COMPLETED" });
  });

  it("다른 고객의 uploadId 재사용은 UPLOAD_CONFLICT", async () => {
    vi.mocked(getCustomer).mockResolvedValue({ id: "c1" } as never);
    vi.mocked(repo.findUploadById).mockResolvedValue({ status: "PENDING", customerId: "other", s3Key: "k" } as never);
    const r = await reserveUpload(tenantId, validInput);
    expect(r).toMatchObject({ ok: false, code: "UPLOAD_CONFLICT" });
  });

  it("동일 PENDING uploadId 는 같은 s3Key 로 재발급(멱등)", async () => {
    vi.mocked(getCustomer).mockResolvedValue({ id: "c1" } as never);
    vi.mocked(repo.findUploadById).mockResolvedValue({ status: "PENDING", customerId: "c1", s3Key: "existing-key" } as never);
    const r = await reserveUpload(tenantId, validInput);
    expect(r.ok).toBe(true);
    expect(repo.createUpload).not.toHaveBeenCalled();
  });

  it("동시 생성(P2002)이면 기존 예약을 재사용한다", async () => {
    vi.mocked(getCustomer).mockResolvedValue({ id: "c1" } as never);
    vi.mocked(repo.findUploadById)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ status: "PENDING", customerId: "c1", s3Key: "raced-key" } as never);
    vi.mocked(repo.createUpload).mockRejectedValue({ code: "P2002" });
    const r = await reserveUpload(tenantId, validInput);
    expect(r.ok).toBe(true);
  });
});

describe("completeUpload", () => {
  const upload = { id: "u1", uploadId: "upload0001abcdef0001", s3Key: "k", size: 1000, customerId: "c1", displayName: "report.pdf", mimeType: "application/pdf" };

  it("예약이 없으면 UPLOAD_NOT_FOUND", async () => {
    vi.mocked(repo.findUploadById).mockResolvedValue(null);
    const r = await completeUpload(tenantId, { uploadId: validInput.uploadId });
    expect(r).toMatchObject({ ok: false, code: "UPLOAD_NOT_FOUND" });
  });

  it("이미 확정된 경우 기존 FileItem 을 반환(멱등)", async () => {
    vi.mocked(repo.findUploadById).mockResolvedValue(upload as never);
    vi.mocked(repo.findFileItemByUploadId).mockResolvedValue({ id: "fi1" } as never);
    const r = await completeUpload(tenantId, { uploadId: validInput.uploadId });
    expect(r).toMatchObject({ ok: true, fileItem: { id: "fi1" } });
  });

  it("S3 객체가 없으면 OBJECT_NOT_FOUND + FAILED 표기", async () => {
    vi.mocked(repo.findUploadById).mockResolvedValue(upload as never);
    vi.mocked(repo.findFileItemByUploadId).mockResolvedValue(null);
    vi.mocked(getS3Client).mockReturnValue({ send: vi.fn().mockRejectedValue(new Error("404")) } as never);
    const r = await completeUpload(tenantId, { uploadId: validInput.uploadId });
    expect(r).toMatchObject({ ok: false, code: "OBJECT_NOT_FOUND" });
    expect(repo.markUploadFailed).toHaveBeenCalledWith(upload.uploadId);
  });

  it("크기 불일치는 SIZE_MISMATCH", async () => {
    vi.mocked(repo.findUploadById).mockResolvedValue(upload as never);
    vi.mocked(repo.findFileItemByUploadId).mockResolvedValue(null);
    vi.mocked(getS3Client).mockReturnValue({ send: vi.fn().mockResolvedValue({ ContentLength: 999 }) } as never);
    const r = await completeUpload(tenantId, { uploadId: validInput.uploadId });
    expect(r).toMatchObject({ ok: false, code: "SIZE_MISMATCH" });
  });

  it("정상 확정 시 FileItem 을 생성한다", async () => {
    vi.mocked(repo.findUploadById).mockResolvedValue(upload as never);
    vi.mocked(repo.findFileItemByUploadId).mockResolvedValue(null);
    vi.mocked(getS3Client).mockReturnValue({ send: vi.fn().mockResolvedValue({ ContentLength: 1000 }) } as never);
    vi.mocked(repo.confirmUpload).mockResolvedValue({ id: "fi-new" } as never);
    const r = await completeUpload(tenantId, { uploadId: validInput.uploadId });
    expect(r).toMatchObject({ ok: true, fileItem: { id: "fi-new" } });
  });
});

describe("createShare", () => {
  it("선택 파일이 없으면 NO_FILES", async () => {
    const r = await createShare(tenantId, "c1", []);
    expect(r).toMatchObject({ ok: false, code: "NO_FILES" });
  });

  it("고객사가 없으면 CUSTOMER_NOT_FOUND", async () => {
    vi.mocked(getCustomer).mockResolvedValue(null);
    const r = await createShare(tenantId, "c1", ["f1"]);
    expect(r).toMatchObject({ ok: false, code: "CUSTOMER_NOT_FOUND" });
  });

  it("파일 개수 불일치(교차 tenant/타 고객)는 FILE_MISMATCH", async () => {
    vi.mocked(getCustomer).mockResolvedValue({ id: "c1" } as never);
    vi.mocked(repo.createShareLink).mockResolvedValue({ ok: false } as never);
    const r = await createShare(tenantId, "c1", ["f1", "f2"]);
    expect(r).toMatchObject({ ok: false, code: "FILE_MISMATCH" });
  });

  it("정상 생성 시 token 을 반환한다", async () => {
    vi.mocked(getCustomer).mockResolvedValue({ id: "c1" } as never);
    vi.mocked(repo.createShareLink).mockResolvedValue({ ok: true, link: { id: "s1" } } as never);
    const r = await createShare(tenantId, "c1", ["f1"]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.token).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(r.shareLinkId).toBe("s1");
    }
  });
});

describe("resolveShare", () => {
  const future = new Date(Date.now() + 100_000);
  const past = new Date(Date.now() - 100_000);

  it("없으면 NOT_FOUND", async () => {
    vi.mocked(repo.findShareLinkByTokenHash).mockResolvedValue(null);
    expect(await resolveShare("tok")).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("폐기된 링크는 REVOKED", async () => {
    vi.mocked(repo.findShareLinkByTokenHash).mockResolvedValue({ revokedAt: new Date(), expiresAt: future, files: [] } as never);
    expect(await resolveShare("tok")).toMatchObject({ ok: false, code: "REVOKED" });
  });

  it("만료된 링크는 EXPIRED", async () => {
    vi.mocked(repo.findShareLinkByTokenHash).mockResolvedValue({ revokedAt: null, expiresAt: past, files: [] } as never);
    expect(await resolveShare("tok")).toMatchObject({ ok: false, code: "EXPIRED" });
  });

  it("유효한 링크는 ok", async () => {
    vi.mocked(repo.findShareLinkByTokenHash).mockResolvedValue({ revokedAt: null, expiresAt: future, files: [] } as never);
    expect((await resolveShare("tok")).ok).toBe(true);
  });
});

describe("getDownloadUrl", () => {
  const future = new Date(Date.now() + 100_000);

  it("링크에 없는 파일은 FILE_NOT_IN_LINK", async () => {
    vi.mocked(repo.findShareLinkByTokenHash).mockResolvedValue({
      revokedAt: null,
      expiresAt: future,
      files: [{ fileItemId: "f1", fileItem: { s3Key: "k", displayName: "a.pdf" } }],
    } as never);
    const r = await getDownloadUrl("tok", "f-other");
    expect(r).toMatchObject({ ok: false, code: "FILE_NOT_IN_LINK" });
  });

  it("유효 파일은 presigned GET URL 을 반환한다", async () => {
    vi.mocked(repo.findShareLinkByTokenHash).mockResolvedValue({
      revokedAt: null,
      expiresAt: future,
      files: [{ fileItemId: "f1", fileItem: { s3Key: "k", displayName: "a.pdf" } }],
    } as never);
    vi.mocked(getS3Client).mockReturnValue({} as never);
    const r = await getDownloadUrl("tok", "f1");
    expect(r).toMatchObject({ ok: true, url: "https://signed.example/url" });
  });
});
