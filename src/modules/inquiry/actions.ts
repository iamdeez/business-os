"use server";

import { redirect } from "next/navigation";
import { requireTenantAccess } from "@/modules/tenant/access";
import { inquiryFormSchema, inquiryStatusSchema, connectCustomerSchema } from "./schema";
import {
  resolveSlug,
  submitInquiry,
  updateInquiryStatus,
  connectInquiryToCustomer,
  disconnectInquiryFromCustomer,
} from "./repository";

export type SubmitInquiryState =
  | { status: "idle" }
  | { status: "success"; inquiryId: string }
  | { status: "error"; message: string };

// returnPath from formData → append ?updated=1 or ?error=…
function resolveReturn(formData: FormData, id: string, param: "updated=1" | `error=${string}`) {
  const base = (formData.get("returnPath") as string) || `/inquiries/${id}`;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${param}`;
}

// Public: no auth required.
export async function submitInquiryAction(
  tenantSlug: string,
  _prev: SubmitInquiryState,
  formData: FormData
): Promise<SubmitInquiryState> {
  if (formData.get("honeypot") !== "") {
    return { status: "error", message: "잘못된 요청입니다" };
  }

  const raw = {
    requestId: formData.get("requestId"),
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    honeypot: "",
  };

  const parsed = inquiryFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const tenant = await resolveSlug(tenantSlug);
  if (!tenant) return { status: "error", message: "존재하지 않는 에이전시입니다" };

  const { id } = await submitInquiry(tenant.id, { ...parsed.data, consentedAt: new Date() });
  return { status: "success", inquiryId: id };
}

// Admin: update inquiry status
export async function updateInquiryStatusAction(id: string, formData: FormData) {
  const { tenantId } = await requireTenantAccess();

  const parsed = inquiryStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) {
    redirect(resolveReturn(formData, id, `error=${encodeURIComponent("올바른 상태 값이 아닙니다")}`));
  }

  const result = await updateInquiryStatus(tenantId, id, parsed.data!.status);
  if (!result) {
    redirect(resolveReturn(formData, id, `error=${encodeURIComponent("문의를 찾을 수 없습니다")}`));
  }

  redirect(resolveReturn(formData, id, "updated=1"));
}

// Admin: connect to existing customer
export async function connectToCustomerAction(id: string, formData: FormData) {
  const { tenantId } = await requireTenantAccess();

  const parsed = connectCustomerSchema.safeParse({ customerId: formData.get("customerId") });
  if (!parsed.success) {
    redirect(resolveReturn(formData, id, `error=${encodeURIComponent(parsed.error.issues[0].message)}`));
  }

  const result = await connectInquiryToCustomer(tenantId, id, parsed.data!.customerId);
  if (!result) {
    redirect(resolveReturn(formData, id, `error=${encodeURIComponent("고객사 또는 문의를 찾을 수 없습니다")}`));
  }

  redirect(resolveReturn(formData, id, "updated=1"));
}

// Admin: disconnect from customer
export async function disconnectFromCustomerAction(id: string, formData: FormData) {
  const { tenantId } = await requireTenantAccess();

  const result = await disconnectInquiryFromCustomer(tenantId, id);
  if (!result) {
    redirect(resolveReturn(formData, id, `error=${encodeURIComponent("문의를 찾을 수 없습니다")}`));
  }

  redirect(resolveReturn(formData, id, "updated=1"));
}
