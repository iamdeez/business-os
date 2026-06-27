import "server-only";
import { db } from "@/lib/db";
import type { InquiryFormInput, InquiryStatus } from "./schema";

const PAGE_SIZE = 20;

// Resolve tenantSlug to tenantId. Returns null if not found.
export async function resolveSlug(slug: string) {
  const tenant = await db.tenant.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
  return tenant;
}

// Idempotent public inquiry submission.
// Returns existing record if (tenantId, requestId) already exists.
export async function submitInquiry(
  tenantId: string,
  data: InquiryFormInput & { consentedAt: Date }
) {
  const existing = await db.inquiry.findUnique({
    where: { tenantId_requestId: { tenantId, requestId: data.requestId } },
    select: { id: true },
  });
  if (existing) return { id: existing.id, created: false };

  const inquiry = await db.inquiry.create({
    data: {
      tenantId,
      requestId: data.requestId,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      consentedAt: data.consentedAt,
    },
    select: { id: true },
  });
  return { id: inquiry.id, created: true };
}

export async function listInquiries(
  tenantId: string,
  {
    page = 1,
    status,
    search = "",
  }: { page?: number; status?: InquiryStatus; search?: string } = {}
) {
  const where = {
    tenantId,
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" as const } },
            { contactName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [inquiries, total] = await Promise.all([
    db.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { customer: { select: { id: true, companyName: true } } },
    }),
    db.inquiry.count({ where }),
  ]);

  return {
    inquiries,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    page,
  };
}

export async function getInquiry(tenantId: string, id: string) {
  return db.inquiry.findFirst({
    where: { tenantId, id },
    include: {
      customer: {
        select: { id: true, companyName: true, contactName: true, email: true },
      },
    },
  });
}

export async function updateInquiryStatus(
  tenantId: string,
  id: string,
  status: InquiryStatus
) {
  const exists = await db.inquiry.findFirst({ where: { tenantId, id }, select: { id: true } });
  if (!exists) return null;

  return db.inquiry.update({ where: { id }, data: { status } });
}

export async function connectInquiryToCustomer(
  tenantId: string,
  id: string,
  customerId: string
) {
  // Verify both inquiry and customer belong to this tenant
  const [inquiry, customer] = await Promise.all([
    db.inquiry.findFirst({ where: { tenantId, id }, select: { id: true } }),
    db.customer.findFirst({ where: { tenantId, id: customerId }, select: { id: true } }),
  ]);
  if (!inquiry || !customer) return null;

  return db.inquiry.update({ where: { id }, data: { customerId } });
}

export async function disconnectInquiryFromCustomer(tenantId: string, id: string) {
  const exists = await db.inquiry.findFirst({ where: { tenantId, id }, select: { id: true } });
  if (!exists) return null;

  return db.inquiry.update({ where: { id }, data: { customerId: null } });
}
