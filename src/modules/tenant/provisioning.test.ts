import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    membership: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { db } from "@/lib/db";
import { baseSlug, provisionWorkspace } from "./provisioning";

const dbMock = db as unknown as {
  membership: { findFirst: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("baseSlug", () => {
  it("ASCII 이름을 slug 로 변환한다", () => {
    expect(baseSlug("ACME Corp")).toBe("acme-corp");
  });
  it("한글 등 비-ASCII 만이면 workspace 로 대체한다", () => {
    expect(baseSlug("주식회사 예시")).toBe("workspace");
  });
  it("빈 값이면 workspace", () => {
    expect(baseSlug("")).toBe("workspace");
    expect(baseSlug(null)).toBe("workspace");
    expect(baseSlug(undefined)).toBe("workspace");
  });
});

describe("provisionWorkspace", () => {
  it("이미 소속이 있으면 생성하지 않는다(멱등)", async () => {
    dbMock.membership.findFirst.mockResolvedValue({ id: "m1" });
    await provisionWorkspace("u1", "ACME");
    expect(dbMock.$transaction).not.toHaveBeenCalled();
  });

  it("소속이 없으면 Tenant+Membership 을 생성한다", async () => {
    dbMock.membership.findFirst.mockResolvedValue(null);
    dbMock.$transaction.mockResolvedValue(undefined);
    await provisionWorkspace("u1", "ACME");
    expect(dbMock.$transaction).toHaveBeenCalledTimes(1);
  });

  it("slug 충돌(P2002) 시 재시도한다", async () => {
    dbMock.membership.findFirst.mockResolvedValue(null);
    dbMock.$transaction.mockRejectedValueOnce({ code: "P2002" }).mockResolvedValueOnce(undefined);
    await provisionWorkspace("u1", "ACME");
    expect(dbMock.$transaction).toHaveBeenCalledTimes(2);
  });

  it("P2002 이 아닌 오류는 전파한다", async () => {
    dbMock.membership.findFirst.mockResolvedValue(null);
    dbMock.$transaction.mockRejectedValue(new Error("db down"));
    await expect(provisionWorkspace("u1", "ACME")).rejects.toThrow("db down");
  });
});
