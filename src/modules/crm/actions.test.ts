import { describe, it, expect, vi, beforeEach } from "vitest";

// redirect 는 실제 Next 처럼 throw 하여 이후 코드 실행을 중단시킨다(URL 은 메시지로 캡처).
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));
vi.mock("@/modules/tenant/access", () => ({ requireTenantAccess: vi.fn() }));
vi.mock("./repository");

import { requireTenantAccess } from "@/modules/tenant/access";
import * as repo from "./repository";
import { createCustomerAction, updateCustomerAction } from "./actions";

function formData(overrides: Record<string, string> = {}) {
  const f = new FormData();
  f.set("companyName", "ACME");
  f.set("contactName", "홍길동");
  f.set("email", "a@b.com");
  f.set("phone", "");
  f.set("memo", "");
  for (const [k, v] of Object.entries(overrides)) f.set(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireTenantAccess).mockResolvedValue({ tenantId: "t1" } as never);
});

describe("createCustomerAction", () => {
  it("유효 입력 시 tenant 범위로 생성 후 /customers 로 이동", async () => {
    vi.mocked(repo.createCustomer).mockResolvedValue({} as never);
    await expect(createCustomerAction(formData())).rejects.toThrow("REDIRECT:/customers");
    expect(repo.createCustomer).toHaveBeenCalledWith(
      "t1",
      expect.objectContaining({ companyName: "ACME", email: "a@b.com" })
    );
  });

  it("검증 실패 시 /customers/new?error=.. 로 이동하고 생성하지 않는다", async () => {
    await expect(createCustomerAction(formData({ email: "bad" }))).rejects.toThrow(
      /REDIRECT:\/customers\/new\?error=/
    );
    expect(repo.createCustomer).not.toHaveBeenCalled();
  });
});

describe("updateCustomerAction", () => {
  it("returnPath 로 복귀하며 updated=1 을 붙인다 (모달 케이스)", async () => {
    vi.mocked(repo.updateCustomer).mockResolvedValue({} as never);
    const f = formData();
    f.set("returnPath", "/customers?selected=c1");
    await expect(updateCustomerAction("c1", f)).rejects.toThrow(
      "REDIRECT:/customers?selected=c1&updated=1"
    );
    expect(repo.updateCustomer).toHaveBeenCalledWith("t1", "c1", expect.objectContaining({ companyName: "ACME" }));
  });

  it("returnPath 없으면 /customers/{id}?updated=1 로 이동", async () => {
    vi.mocked(repo.updateCustomer).mockResolvedValue({} as never);
    await expect(updateCustomerAction("c1", formData())).rejects.toThrow(
      "REDIRECT:/customers/c1?updated=1"
    );
  });

  it("검증 실패 시 error 로 이동하고 수정하지 않는다", async () => {
    await expect(updateCustomerAction("c1", formData({ companyName: "" }))).rejects.toThrow(/error=/);
    expect(repo.updateCustomer).not.toHaveBeenCalled();
  });
});
