"use server";

import { redirect } from "next/navigation";
import { requireTenantAccess } from "@/modules/tenant/access";
import { getCustomer } from "@/modules/crm/repository";
import { notifyFilesShared } from "@/modules/notification/service";
import { createShare, revokeShare } from "./service";

export async function createShareAction(customerId: string, formData: FormData) {
  const { tenantId } = await requireTenantAccess();
  const fileItemIds = formData.getAll("fileItemId").map(String).filter(Boolean);

  const result = await createShare(tenantId, customerId, fileItemIds);
  const base = `/customers/${customerId}`;
  if (!result.ok) {
    redirect(`${base}?fileError=${encodeURIComponent(result.message)}#files`);
  }

  // 고객에게 공유 알림. 발송 실패가 공유 생성을 막지 않도록 비차단 처리.
  try {
    const customer = await getCustomer(tenantId, customerId);
    if (customer) {
      // BETTER_AUTH_URL 은 런타임 값(배포 도메인). NEXT_PUBLIC_* 은 빌드 시점 인라인되어 부적합.
      const appUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
      await notifyFilesShared(tenantId, customer.email, {
        shareLinkId: result.shareLinkId,
        customerName: customer.companyName,
        shareUrl: `${appUrl}/share/${result.token}`,
        fileCount: fileItemIds.length,
        expiresAt: result.expiresAt.toLocaleDateString("ko-KR"),
      });
    }
  } catch {
    // 알림 실패는 무시 (NotificationLog 에 FAILED 로 남는다)
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
