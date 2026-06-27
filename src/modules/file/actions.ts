"use server";

import { redirect } from "next/navigation";
import { requireTenantAccess } from "@/modules/tenant/access";
import { createShare, revokeShare } from "./service";

export async function createShareAction(customerId: string, formData: FormData) {
  const { tenantId } = await requireTenantAccess();
  const fileItemIds = formData.getAll("fileItemId").map(String).filter(Boolean);

  const result = await createShare(tenantId, customerId, fileItemIds);
  const base = `/customers/${customerId}`;
  if (!result.ok) {
    redirect(`${base}?fileError=${encodeURIComponent(result.message)}#files`);
  }
  // token 원문은 1회만 노출된다. 운영자가 즉시 복사하도록 화면에 표시한다.
  redirect(`${base}?share=${encodeURIComponent(result.token)}#files`);
}

export async function revokeShareAction(customerId: string, formData: FormData) {
  const { tenantId } = await requireTenantAccess();
  const shareLinkId = String(formData.get("shareLinkId"));

  await revokeShare(tenantId, shareLinkId);
  redirect(`/customers/${customerId}?revoked=1#files`);
}
