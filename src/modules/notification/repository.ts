import "server-only";
import { db } from "@/lib/db";
import type { NotificationType } from "./templates";

export async function findByIdempotencyKey(tenantId: string, idempotencyKey: string) {
  return db.notificationLog.findUnique({
    where: { tenantId_idempotencyKey: { tenantId, idempotencyKey } },
  });
}

export async function createPending(data: {
  tenantId: string;
  type: NotificationType;
  recipient: string;
  templateKey: string;
  idempotencyKey: string;
}) {
  return db.notificationLog.create({
    data: {
      tenantId: data.tenantId,
      type: data.type,
      recipient: data.recipient,
      templateKey: data.templateKey,
      idempotencyKey: data.idempotencyKey,
      status: "PENDING",
    },
  });
}

export async function markSent(id: string, providerMessageId: string | null) {
  return db.notificationLog.update({
    where: { id },
    data: { status: "SENT", providerMessageId },
  });
}

export async function markFailed(id: string, errorCode: string) {
  return db.notificationLog.update({
    where: { id },
    data: { status: "FAILED", errorCode },
  });
}

// 운영자용 발송 로그 목록.
export async function listNotifications(tenantId: string) {
  return db.notificationLog.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

// inquiry_received 수신자 — tenant OWNER 이메일.
export async function getTenantOwnerEmail(tenantId: string): Promise<string | null> {
  const membership = await db.membership.findFirst({
    where: { tenantId, role: "OWNER" },
    include: { user: { select: { email: true } } },
  });
  return membership?.user.email ?? null;
}
