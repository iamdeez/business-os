import Link from "next/link";
import { Search, X, Building2, Mail, Phone, Clock, User2, ExternalLink } from "lucide-react";
import { requireTenantAccess } from "@/modules/tenant/access";
import { listInquiries, getInquiry } from "@/modules/inquiry/repository";
import { listCustomers } from "@/modules/crm/repository";
import {
  updateInquiryStatusAction,
  connectToCustomerAction,
  disconnectFromCustomerAction,
} from "@/modules/inquiry/actions";
import type { InquiryStatus } from "@/modules/inquiry/schema";
import { ModalWrapper } from "./modal-wrapper";

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
    selected?: string;
    updated?: string;
    error?: string;
  }>;
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

export default async function InquiriesPage({ searchParams }: Props) {
  const { tenantId } = await requireTenantAccess();
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? 1));
  const rawStatus = params.status;
  const status =
    rawStatus === "NEW" || rawStatus === "IN_PROGRESS" || rawStatus === "RESOLVED"
      ? (rawStatus as InquiryStatus)
      : undefined;
  const search = params.search ?? "";
  const selectedId = params.selected;

  const { inquiries, total, totalPages } = await listInquiries(tenantId, { page, status, search });

  // Fetch modal data in parallel when needed
  const [selectedInquiry, customerList] = selectedId
    ? await Promise.all([getInquiry(tenantId, selectedId), listCustomers(tenantId, { page: 1 })])
    : [null, null];

  function buildHref(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const merged = {
      page: String(page),
      search,
      status: params.status,
      selected: params.selected,
      ...overrides,
    };
    if (Number(merged.page) > 1) p.set("page", merged.page!);
    if (merged.search) p.set("search", merged.search);
    if (merged.status) p.set("status", merged.status);
    if (merged.selected) p.set("selected", merged.selected);
    const qs = p.toString();
    return `/inquiries${qs ? `?${qs}` : ""}`;
  }

  const closeHref = buildHref({ selected: undefined, updated: undefined, error: undefined });
  const modalReturnPath = selectedId ? buildHref({ updated: undefined, error: undefined }) : "";

  const statusFilters: Array<{ label: string; value: string | undefined }> = [
    { label: "전체", value: undefined },
    { label: "신규", value: "NEW" },
    { label: "처리중", value: "IN_PROGRESS" },
    { label: "완료", value: "RESOLVED" },
  ];

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Search + filter row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form method="get" className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7582]" />
            <input
              name="search"
              defaultValue={search}
              placeholder="회사명, 담당자, 이메일 검색..."
              className="h-11 w-full rounded-lg border border-[#cbc4d2] bg-white pl-10 pr-4 text-sm text-[#1d1b20] placeholder:text-[#7a7582] outline-none transition-all focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/10"
            />
            {status && <input type="hidden" name="status" value={status} />}
          </form>

          <div className="flex flex-wrap items-center gap-1.5">
            {statusFilters.map((f) => {
              const isActive = status === f.value;
              return (
                <Link
                  key={f.value ?? "all"}
                  href={buildHref({ status: f.value, selected: undefined, page: "1" })}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-[#4f378a] bg-[#4f378a] text-white"
                      : "border-[#cbc4d2] bg-white text-[#494551] hover:border-[#4f378a]/40 hover:bg-[#f2ecf4]"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-[#cbc4d2]/60 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#cbc4d2]/60 bg-[#f8f2fa]">
                <th className="px-5 py-3.5 text-left text-xs font-medium text-[#7a7582]">회사명</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-[#7a7582]">담당자</th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-medium text-[#7a7582] md:table-cell">
                  이메일
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-[#7a7582]">상태</th>
                <th className="hidden px-5 py-3.5 text-left text-xs font-medium text-[#7a7582] lg:table-cell">
                  고객 연결
                </th>
                <th className="hidden px-5 py-3.5 text-right text-xs font-medium text-[#7a7582] sm:table-cell">
                  접수일
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-medium text-[#7a7582]">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#cbc4d2]/40">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#7a7582]">
                    {search || status ? "검색 결과가 없습니다." : "접수된 문의가 없습니다."}
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => {
                  const isSelected = inquiry.id === selectedId;
                  return (
                    <tr
                      key={inquiry.id}
                      className={`group cursor-pointer transition-colors ${
                        isSelected ? "bg-[#4f378a]/5" : "hover:bg-[#4f378a]/5"
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-[#1d1b20]">
                        {inquiry.companyName}
                      </td>
                      <td className="px-5 py-4 text-[#494551]">{inquiry.contactName}</td>
                      <td className="hidden px-5 py-4 text-[#494551] md:table-cell">
                        {inquiry.email}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[inquiry.status]}`}
                        >
                          {STATUS_LABEL[inquiry.status]}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-[#494551] lg:table-cell">
                        {inquiry.customer ? (
                          <span className="text-xs font-medium text-[#4f378a]">
                            {inquiry.customer.companyName}
                          </span>
                        ) : (
                          <span className="text-xs text-[#7a7582]">미연결</span>
                        )}
                      </td>
                      <td className="hidden px-5 py-4 text-right text-xs text-[#7a7582] sm:table-cell">
                        {inquiry.createdAt.toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Link
                          href={buildHref({ selected: inquiry.id })}
                          scroll={false}
                          className={`rounded-lg border px-4 py-1.5 text-[11px] font-bold transition-all ${
                            isSelected
                              ? "border-[#4f378a] bg-[#4f378a] text-white"
                              : "border-[#4f378a]/20 text-[#4f378a] group-hover:bg-[#4f378a] group-hover:text-white"
                          }`}
                        >
                          보기
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#7a7582]">총 {total}건</span>
            <div className="flex items-center gap-1">
              {page > 1 && (
                <PaginationLink href={buildHref({ page: String(page - 1) })} label="‹" />
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <PaginationLink
                    key={p}
                    href={buildHref({ page: String(p) })}
                    label={String(p)}
                    active={p === page}
                  />
                ))}
              {page < totalPages && (
                <PaginationLink href={buildHref({ page: String(page + 1) })} label="›" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedInquiry && (
        <ModalWrapper closeHref={closeHref}>
          {/* Modal header */}
          <div className="flex items-center justify-between border-b border-[#cbc4d2]/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[selectedInquiry.status]}`}
              >
                {STATUS_LABEL[selectedInquiry.status]}
              </span>
              <span className="text-sm font-semibold text-[#1d1b20]">
                {selectedInquiry.companyName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/inquiries/${selectedInquiry.id}`}
                title="전체 화면으로 보기"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7a7582] hover:bg-[#f2ecf4] hover:text-[#1d1b20]"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <Link
                href={closeHref}
                scroll={false}
                aria-label="닫기"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7a7582] hover:bg-[#f2ecf4] hover:text-[#1d1b20]"
              >
                <X className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Toast */}
          {params.updated && (
            <div className="mx-5 mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
              변경 사항이 저장되었습니다.
            </div>
          )}
          {params.error && (
            <div className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {decodeURIComponent(params.error)}
            </div>
          )}

          <div className="flex flex-col gap-5 p-5">
            {/* Contact info */}
            <div className="rounded-xl border border-[#cbc4d2]/60 bg-[#f8f2fa] p-4">
              <div className="grid gap-3">
                <InfoRow icon={<Mail className="h-4 w-4" />} label="이메일" value={selectedInquiry.email} />
                {selectedInquiry.phone && (
                  <InfoRow icon={<Phone className="h-4 w-4" />} label="연락처" value={selectedInquiry.phone} />
                )}
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="접수일시"
                  value={selectedInquiry.createdAt.toLocaleString("ko-KR")}
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <p className="mb-2 text-xs font-semibold text-[#7a7582]">문의 내용</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#1d1b20]">
                {selectedInquiry.message}
              </p>
            </div>

            {/* Status update */}
            <div>
              <p className="mb-2.5 text-xs font-semibold text-[#7a7582]">상태 변경</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_TRANSITIONS[selectedInquiry.status].map((nextStatus) => {
                  const updateWithId = updateInquiryStatusAction.bind(null, selectedInquiry.id);
                  return (
                    <form key={nextStatus} action={updateWithId}>
                      <input type="hidden" name="status" value={nextStatus} />
                      <input type="hidden" name="returnPath" value={modalReturnPath} />
                      <button
                        type="submit"
                        className="rounded-lg border border-[#4f378a]/20 bg-[#4f378a]/5 px-3.5 py-2 text-sm font-medium text-[#4f378a] transition-colors hover:bg-[#4f378a] hover:text-white"
                      >
                        {STATUS_LABEL[nextStatus]}으로 변경
                      </button>
                    </form>
                  );
                })}
                {STATUS_TRANSITIONS[selectedInquiry.status].length === 0 && (
                  <p className="text-sm text-[#7a7582]">변경 가능한 상태가 없습니다.</p>
                )}
              </div>
            </div>

            {/* Customer connection */}
            <div>
              <p className="mb-2.5 text-xs font-semibold text-[#7a7582]">고객사 연결</p>
              {selectedInquiry.customer ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#cbc4d2]/60 bg-white p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4f378a]/10">
                      <User2 className="h-4 w-4 text-[#4f378a]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1d1b20]">
                        {selectedInquiry.customer.companyName}
                      </p>
                      <p className="text-xs text-[#7a7582]">{selectedInquiry.customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/customers/${selectedInquiry.customer.id}`}
                      className="rounded-lg border border-[#cbc4d2] px-2.5 py-1.5 text-xs font-medium text-[#494551] hover:bg-[#f2ecf4]"
                    >
                      보기
                    </Link>
                    {(() => {
                      const disconnectWithId = disconnectFromCustomerAction.bind(null, selectedInquiry.id);
                      return (
                        <form action={disconnectWithId}>
                          <input type="hidden" name="returnPath" value={modalReturnPath} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            해제
                          </button>
                        </form>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const connectWithId = connectToCustomerAction.bind(null, selectedInquiry.id);
                    return (
                      <form action={connectWithId} className="flex gap-2">
                        <select
                          name="customerId"
                          required
                          className="flex-1 rounded-lg border border-[#cbc4d2] bg-white px-3 py-2 text-sm text-[#1d1b20] outline-none focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/10"
                        >
                          <option value="">고객사 선택...</option>
                          {customerList?.customers.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.companyName} ({c.contactName})
                            </option>
                          ))}
                        </select>
                        <input type="hidden" name="returnPath" value={modalReturnPath} />
                        <button
                          type="submit"
                          className="shrink-0 rounded-lg bg-[#4f378a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b2571]"
                        >
                          연결
                        </button>
                      </form>
                    );
                  })()}
                  <Link
                    href={`/customers/new?companyName=${encodeURIComponent(selectedInquiry.companyName)}&contactName=${encodeURIComponent(selectedInquiry.contactName)}&email=${encodeURIComponent(selectedInquiry.email)}${selectedInquiry.phone ? `&phone=${encodeURIComponent(selectedInquiry.phone)}` : ""}`}
                    className="inline-flex items-center gap-1.5 text-xs text-[#4f378a] hover:underline"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    이 문의로 새 고객사 등록
                  </Link>
                </div>
              )}
            </div>
          </div>
        </ModalWrapper>
      )}
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-[#7a7582]">{icon}</span>
      <div>
        <p className="text-[11px] text-[#7a7582]">{label}</p>
        <p className="text-sm text-[#1d1b20]">{value}</p>
      </div>
    </div>
  );
}

function PaginationLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
        active
          ? "bg-[#4f378a] text-white"
          : "border border-[#cbc4d2] bg-white text-[#7a7582] hover:bg-[#f2ecf4]"
      }`}
    >
      {label}
    </Link>
  );
}
