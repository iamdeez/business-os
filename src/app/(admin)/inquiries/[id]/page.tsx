import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, Phone, Clock, User2 } from "lucide-react";
import { requireTenantAccess } from "@/modules/tenant/access";
import { getInquiry } from "@/modules/inquiry/repository";
import { listCustomers } from "@/modules/crm/repository";
import {
  updateInquiryStatusAction,
  connectToCustomerAction,
  disconnectFromCustomerAction,
} from "@/modules/inquiry/actions";
import type { InquiryStatus } from "@/modules/inquiry/schema";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}

const STATUS_LABEL: Record<InquiryStatus, string> = {
  NEW: "신규",
  IN_PROGRESS: "처리중",
  RESOLVED: "완료",
};

const STATUS_STYLE: Record<InquiryStatus, string> = {
  NEW: "border-blue-200 bg-blue-50 text-blue-700",
  IN_PROGRESS: "border-amber-200 bg-amber-50 text-amber-700",
  RESOLVED: "border-green-200 bg-green-50 text-green-700",
};

const STATUS_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  NEW: ["IN_PROGRESS"],
  IN_PROGRESS: ["NEW", "RESOLVED"],
  RESOLVED: ["IN_PROGRESS"],
};

export default async function InquiryDetailPage({ params, searchParams }: Props) {
  const { tenantId } = await requireTenantAccess();
  const { id } = await params;
  const sp = await searchParams;

  const [inquiry, { customers }] = await Promise.all([
    getInquiry(tenantId, id),
    listCustomers(tenantId, { page: 1 }),
  ]);

  if (!inquiry) notFound();

  const updateStatusWithId = updateInquiryStatusAction.bind(null, id);
  const connectWithId = connectToCustomerAction.bind(null, id);
  const disconnectWithId = disconnectFromCustomerAction.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back */}
      <Link
        href="/inquiries"
        className="inline-flex items-center gap-1.5 text-sm text-[#7a7582] hover:text-[#1d1b20]"
      >
        <ArrowLeft className="h-4 w-4" />
        문의 목록
      </Link>

      {/* Toast */}
      {sp.updated && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          변경 사항이 저장되었습니다.
        </div>
      )}
      {sp.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(sp.error)}
        </div>
      )}

      {/* Inquiry details card */}
      <div className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-[#1d1b20]">{inquiry.companyName}</h1>
            <p className="mt-0.5 text-sm text-[#494551]">{inquiry.contactName}</p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-sm font-bold ${STATUS_STYLE[inquiry.status]}`}
          >
            {STATUS_LABEL[inquiry.status]}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow icon={<Mail className="h-4 w-4" />} label="이메일" value={inquiry.email} />
          {inquiry.phone && (
            <InfoRow icon={<Phone className="h-4 w-4" />} label="연락처" value={inquiry.phone} />
          )}
          <InfoRow
            icon={<Clock className="h-4 w-4" />}
            label="접수일시"
            value={inquiry.createdAt.toLocaleString("ko-KR")}
          />
          {inquiry.customer && (
            <InfoRow
              icon={<Building2 className="h-4 w-4" />}
              label="연결 고객사"
              value={inquiry.customer.companyName}
            />
          )}
        </div>

        <div className="mt-5 border-t border-[#cbc4d2]/40 pt-5">
          <p className="mb-2 text-xs font-semibold text-[#7a7582]">문의 내용</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1d1b20]">
            {inquiry.message}
          </p>
        </div>
      </div>

      {/* Status update */}
      <div className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#1d1b20]">상태 변경</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_TRANSITIONS[inquiry.status].map((nextStatus) => (
            <form key={nextStatus} action={updateStatusWithId}>
              <input type="hidden" name="status" value={nextStatus} />
              <button
                type="submit"
                className="rounded-lg border border-[#4f378a]/20 bg-[#4f378a]/5 px-4 py-2 text-sm font-medium text-[#4f378a] transition-colors hover:bg-[#4f378a] hover:text-white"
              >
                {STATUS_LABEL[nextStatus]}으로 변경
              </button>
            </form>
          ))}
          {STATUS_TRANSITIONS[inquiry.status].length === 0 && (
            <p className="text-sm text-[#7a7582]">변경 가능한 상태가 없습니다.</p>
          )}
        </div>
      </div>

      {/* Customer connection */}
      <div className="rounded-xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-[#1d1b20]">고객사 연결</h2>

        {inquiry.customer ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4f378a]/10">
                <User2 className="h-4 w-4 text-[#4f378a]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1d1b20]">
                  {inquiry.customer.companyName}
                </p>
                <p className="text-xs text-[#7a7582]">{inquiry.customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/customers/${inquiry.customer.id}`}
                className="rounded-lg border border-[#cbc4d2] px-3 py-1.5 text-xs font-medium text-[#494551] hover:bg-[#f2ecf4]"
              >
                고객사 보기
              </Link>
              <form action={disconnectWithId}>
                <button
                  type="submit"
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  연결 해제
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <form action={connectWithId} className="flex items-center gap-2">
              <select
                name="customerId"
                required
                className="flex-1 rounded-lg border border-[#cbc4d2] bg-white px-3 py-2.5 text-sm text-[#1d1b20] outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/10"
              >
                <option value="">기존 고객사 선택...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName} ({c.contactName})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#4f378a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3b2571]"
              >
                연결
              </button>
            </form>

            <p className="text-xs text-[#7a7582]">또는</p>

            <Link
              href={`/customers/new?companyName=${encodeURIComponent(inquiry.companyName)}&contactName=${encodeURIComponent(inquiry.contactName)}&email=${encodeURIComponent(inquiry.email)}${inquiry.phone ? `&phone=${encodeURIComponent(inquiry.phone)}` : ""}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#cbc4d2] px-4 py-2.5 text-sm font-medium text-[#494551] hover:bg-[#f2ecf4]"
            >
              이 문의로 새 고객사 등록
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-[#7a7582]">{icon}</span>
      <div>
        <p className="text-xs text-[#7a7582]">{label}</p>
        <p className="text-sm text-[#1d1b20]">{value}</p>
      </div>
    </div>
  );
}
