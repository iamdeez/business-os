import "server-only";
import { getResendClient, EMAIL_FROM } from "@/lib/resend";
import {
  inquiryReceivedEmail,
  filesSharedEmail,
  TEMPLATE_KEY,
  type NotificationType,
  type InquiryReceivedData,
  type FilesSharedData,
} from "./templates";
import {
  findByIdempotencyKey,
  createPending,
  markSent,
  markFailed,
  getTenantOwnerEmail,
} from "./repository";

export type SendResult =
  | { ok: true; deduped?: boolean }
  | { ok: false; code: "SEND_FAILED" | "NO_RECIPIENT" };

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

/**
 * 이메일 발송 + 로그. 이중 멱등:
 *   1) (tenantId, idempotencyKey) unique 로 중복 발송을 DB 차원에서 차단
 *   2) Resend idempotencyKey 헤더로 provider 차원에서 차단
 * 발송 실패는 FAILED 로 남기고 호출 측이 동작을 계속할 수 있도록 결과만 반환한다.
 */
async function send(params: {
  tenantId: string;
  type: NotificationType;
  recipient: string;
  idempotencyKey: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const { tenantId, type, recipient, idempotencyKey, subject, html } = params;

  const existing = await findByIdempotencyKey(tenantId, idempotencyKey);
  if (existing?.status === "SENT") return { ok: true, deduped: true };

  let log = existing;
  if (!log) {
    try {
      log = await createPending({
        tenantId,
        type,
        recipient,
        templateKey: TEMPLATE_KEY[type],
        idempotencyKey,
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      const raced = await findByIdempotencyKey(tenantId, idempotencyKey);
      if (raced?.status === "SENT") return { ok: true, deduped: true };
      if (!raced) throw error;
      log = raced;
    }
  }

  try {
    const res = await getResendClient().emails.send(
      { from: EMAIL_FROM, to: recipient, subject, html },
      { idempotencyKey }
    );
    if (res.error) {
      await markFailed(log.id, res.error.name ?? "send_error");
      return { ok: false, code: "SEND_FAILED" };
    }
    await markSent(log.id, res.data?.id ?? null);
    return { ok: true };
  } catch (error) {
    await markFailed(log.id, error instanceof Error ? error.name : "unknown");
    return { ok: false, code: "SEND_FAILED" };
  }
}

export async function notifyInquiryReceived(
  tenantId: string,
  data: InquiryReceivedData & { inquiryId: string }
): Promise<SendResult> {
  const recipient = await getTenantOwnerEmail(tenantId);
  if (!recipient) return { ok: false, code: "NO_RECIPIENT" };
  const { subject, html } = inquiryReceivedEmail(data);
  return send({
    tenantId,
    type: "inquiry_received",
    recipient,
    idempotencyKey: `inquiry_received:${data.inquiryId}`,
    subject,
    html,
  });
}

export async function notifyFilesShared(
  tenantId: string,
  recipient: string,
  data: FilesSharedData & { shareLinkId: string }
): Promise<SendResult> {
  const { subject, html } = filesSharedEmail(data);
  return send({
    tenantId,
    type: "files_shared",
    recipient,
    idempotencyKey: `files_shared:${data.shareLinkId}`,
    subject,
    html,
  });
}
