"use server";

import { redirect } from "next/navigation";
import { requireTenantAccess } from "@/modules/tenant/access";
import { customerSchema } from "./schema";
import { createCustomer, updateCustomer } from "./repository";

export async function createCustomerAction(formData: FormData) {
  const { tenantId } = await requireTenantAccess();

  const raw = {
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    memo: formData.get("memo"),
    status: formData.get("status") ?? "ACTIVE",
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/customers/new?error=${encodeURIComponent(message)}`);
  }

  await createCustomer(tenantId, parsed.data);
  redirect("/customers");
}

export async function updateCustomerAction(id: string, formData: FormData) {
  const { tenantId } = await requireTenantAccess();

  const raw = {
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    memo: formData.get("memo"),
    status: formData.get("status") ?? "ACTIVE",
  };

  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join(", ");
    redirect(`/customers/${id}?error=${encodeURIComponent(message)}`);
  }

  await updateCustomer(tenantId, id, parsed.data);
  redirect(`/customers/${id}?updated=1`);
}
