import "server-only";
import { db } from "@/lib/db";
import type { CustomerInput } from "./schema";

export const PAGE_SIZE = 10;

export async function listCustomers(
  tenantId: string,
  {
    page = 1,
    search = "",
    status,
  }: { page?: number; search?: string; status?: "ACTIVE" | "INACTIVE" }
) {
  const where = {
    tenantId,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" as const } },
            { contactName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [customers, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.customer.count({ where }),
  ]);

  return {
    customers,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    page,
  };
}

export async function getCustomerStats(tenantId: string) {
  const [total, active, inactive] = await Promise.all([
    db.customer.count({ where: { tenantId } }),
    db.customer.count({ where: { tenantId, status: "ACTIVE" } }),
    db.customer.count({ where: { tenantId, status: "INACTIVE" } }),
  ]);
  return { total, active, inactive };
}

export async function getCustomer(tenantId: string, id: string) {
  return db.customer.findFirst({ where: { tenantId, id } });
}

export async function createCustomer(tenantId: string, data: CustomerInput) {
  return db.customer.create({
    data: {
      tenantId,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone || null,
      memo: data.memo || null,
      status: data.status,
    },
  });
}

export async function updateCustomer(
  tenantId: string,
  id: string,
  data: Partial<CustomerInput>
) {
  return db.customer.update({
    where: { id },
    data: {
      ...(data.companyName !== undefined && { companyName: data.companyName }),
      ...(data.contactName !== undefined && { contactName: data.contactName }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.memo !== undefined && { memo: data.memo || null }),
      ...(data.status !== undefined && { status: data.status }),
    },
  });
}
