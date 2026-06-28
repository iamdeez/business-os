import Link from "next/link";
import {
  Plus,
  Search,
  SlidersHorizontal,
  X,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { requireTenantAccess } from "@/modules/tenant/access";
import { listCustomers, getCustomerStats, getCustomer } from "@/modules/crm/repository";
import { listFileItems, listShareLinks } from "@/modules/file/repository";
import { updateCustomerAction } from "@/modules/crm/actions";
import { Button } from "@/components/ui/button";
import { ModalWrapper } from "./modal-wrapper";
import { FileManager } from "./[id]/file-manager";
import { toFileRows, toShareRows } from "./file-rows";

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    selected?: string;
    updated?: string;
    error?: string;
    share?: string;
    revoked?: string;
    fileError?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: Props) {
  const { tenantId } = await requireTenantAccess();
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? 1));
  const search = params.search ?? "";
  const status =
    params.status === "ACTIVE" || params.status === "INACTIVE"
      ? params.status
      : undefined;
  const selectedId = params.selected;

  const [{ customers, total, totalPages }, stats, selectedCustomer, selectedFiles, selectedShares] =
    await Promise.all([
      listCustomers(tenantId, { page, search, status }),
      getCustomerStats(tenantId),
      selectedId ? getCustomer(tenantId, selectedId) : Promise.resolve(null),
      selectedId ? listFileItems(tenantId, selectedId) : Promise.resolve([]),
      selectedId ? listShareLinks(tenantId, selectedId) : Promise.resolve([]),
    ]);

  const activeFilters: { label: string; clearKey: string }[] = [];
  if (status)
    activeFilters.push({
      label: `상태: ${status === "ACTIVE" ? "활성" : "비활성"}`,
      clearKey: "status",
    });
  if (search)
    activeFilters.push({ label: `검색: ${search}`, clearKey: "search" });

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
    return `/customers${qs ? `?${qs}` : ""}`;
  }

  const closeHref = buildHref({ selected: undefined, updated: undefined, error: undefined });
  const modalReturnPath = selectedId ? buildHref({ updated: undefined, error: undefined }) : "";

  return (
    <>
      <div className="flex flex-col gap-6">
      {/* Row 1: Search & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form method="get" className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7582]" />
          <input
            name="search"
            defaultValue={search}
            placeholder="이름, 전화번호, 이메일 검색..."
            className="h-11 w-full rounded-lg border border-[#cbc4d2] bg-white pl-10 pr-4 text-sm text-[#1d1b20] placeholder:text-[#7a7582] outline-none transition-all focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/10"
          />
        </form>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-lg border border-[#cbc4d2] bg-white px-4 text-sm font-medium text-[#494551] transition-colors hover:bg-[#f2ecf4]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            필터
          </button>
          <Button asChild size="sm" className="h-11 px-5">
            <Link href="/customers/new">
              <Plus className="h-4 w-4" />새 고객 추가
            </Link>
          </Button>
        </div>
      </div>

      {/* Row 2: Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => (
            <Link
              key={f.clearKey}
              href={buildHref({ [f.clearKey]: undefined, page: "1" })}
              className="flex items-center gap-1.5 rounded-full border border-[#4f378a]/20 bg-[#4f378a]/10 px-3 py-1.5 text-sm font-medium text-[#4f378a] transition-colors hover:bg-[#4f378a]/20"
            >
              <span>{f.label}</span>
              <X className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      )}

      {/* Row 3: Stats */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#cbc4d2]/60 bg-[#f8f2fa] px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#494551]">전체:</span>
          <span className="text-sm font-bold text-[#1d1b20]">
            {stats.total}명
          </span>
        </div>
        <div className="hidden h-4 w-px bg-[#cbc4d2] md:block" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#494551]">활성:</span>
          <span className="text-sm font-bold text-green-700">
            {stats.active}명
          </span>
        </div>
        <div className="hidden h-4 w-px bg-[#cbc4d2] md:block" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#494551]">비활성:</span>
          <span className="text-sm font-bold text-[#494551]">
            {stats.inactive}명
          </span>
        </div>
      </div>

      {/* Row 4: Table */}
      <div className="overflow-hidden rounded-xl border border-[#cbc4d2]/60 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#cbc4d2]/60 bg-[#f8f2fa]">
              <th className="px-5 py-3.5 text-left text-xs font-medium text-[#7a7582]">
                회사명
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-[#7a7582]">
                담당자
              </th>
              <th className="hidden px-5 py-3.5 text-left text-xs font-medium text-[#7a7582] md:table-cell">
                이메일
              </th>
              <th className="hidden px-5 py-3.5 text-left text-xs font-medium text-[#7a7582] lg:table-cell">
                연락처
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-[#7a7582]">
                상태
              </th>
              <th className="px-5 py-3.5 text-center text-xs font-medium text-[#7a7582]">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#cbc4d2]/40">
            {customers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-[#7a7582]"
                >
                  {search || status
                    ? "검색 결과가 없습니다."
                    : "등록된 고객이 없습니다."}
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                <tr
                  key={c.id}
                  className={`group cursor-pointer transition-colors ${
                    isSelected ? "bg-[#4f378a]/5" : "hover:bg-[#4f378a]/5"
                  }`}
                >
                  <td className="px-5 py-4 font-semibold text-[#1d1b20]">
                    {c.companyName}
                  </td>
                  <td className="px-5 py-4 text-[#494551]">{c.contactName}</td>
                  <td className="hidden px-5 py-4 text-[#494551] md:table-cell">
                    {c.email}
                  </td>
                  <td className="hidden px-5 py-4 text-[#494551] lg:table-cell">
                    {c.phone ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    {c.status === "ACTIVE" ? (
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                        활성
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-[#cbc4d2] bg-[#e6e0e9] px-2.5 py-0.5 text-[11px] font-bold text-[#494551]">
                        비활성
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Link
                      href={buildHref({ selected: c.id })}
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
          <span className="text-[#7a7582]">총 {total}명</span>
          <div className="flex items-center gap-1">
            {page > 1 && (
              <PaginationLink
                href={buildHref({ page: String(page - 1) })}
                label="‹"
              />
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
              <PaginationLink
                href={buildHref({ page: String(page + 1) })}
                label="›"
              />
            )}
          </div>
        </div>
      )}
      </div>

      {/* Modal */}
      {selectedCustomer && (
        <ModalWrapper closeHref={closeHref}>
          {/* Modal header */}
          <div className="flex items-center justify-between border-b border-[#cbc4d2]/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                  selectedCustomer.status === "ACTIVE"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-[#cbc4d2] bg-[#e6e0e9] text-[#494551]"
                }`}
              >
                {selectedCustomer.status === "ACTIVE" ? "활성" : "비활성"}
              </span>
              <span className="text-sm font-semibold text-[#1d1b20]">
                {selectedCustomer.companyName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/customers/${selectedCustomer.id}`}
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
            <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
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
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="이메일"
                  value={selectedCustomer.email}
                />
                {selectedCustomer.phone && (
                  <InfoRow
                    icon={<Phone className="h-4 w-4" />}
                    label="연락처"
                    value={selectedCustomer.phone}
                  />
                )}
                <InfoRow
                  icon={<Clock className="h-4 w-4" />}
                  label="등록일시"
                  value={selectedCustomer.createdAt.toLocaleString("ko-KR")}
                />
              </div>
            </div>

            {/* Edit form */}
            <form
              action={updateCustomerAction.bind(null, selectedCustomer.id)}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="returnPath" value={modalReturnPath} />

              <div className="grid grid-cols-2 gap-3">
                <ModalField label="회사명" required>
                  <input
                    name="companyName"
                    defaultValue={selectedCustomer.companyName}
                    required
                    className={MODAL_INPUT}
                  />
                </ModalField>
                <ModalField label="담당자" required>
                  <input
                    name="contactName"
                    defaultValue={selectedCustomer.contactName}
                    required
                    className={MODAL_INPUT}
                  />
                </ModalField>
              </div>

              <ModalField label="이메일" required>
                <input
                  name="email"
                  type="email"
                  defaultValue={selectedCustomer.email}
                  required
                  className={MODAL_INPUT}
                />
              </ModalField>

              <div className="grid grid-cols-2 gap-3">
                <ModalField label="연락처">
                  <input
                    name="phone"
                    defaultValue={selectedCustomer.phone ?? ""}
                    className={MODAL_INPUT}
                  />
                </ModalField>
                <ModalField label="상태">
                  <select
                    name="status"
                    defaultValue={selectedCustomer.status}
                    className={MODAL_INPUT}
                  >
                    <option value="ACTIVE">활성</option>
                    <option value="INACTIVE">비활성</option>
                  </select>
                </ModalField>
              </div>

              <ModalField label="메모">
                <textarea
                  name="memo"
                  rows={3}
                  defaultValue={selectedCustomer.memo ?? ""}
                  className={`${MODAL_INPUT} resize-none`}
                />
              </ModalField>

              <div className="flex justify-end gap-2 border-t border-[#cbc4d2]/60 pt-4">
                <Link
                  href={closeHref}
                  scroll={false}
                  className="rounded-lg border border-[#cbc4d2] px-4 py-2 text-sm font-medium text-[#494551] hover:bg-[#f2ecf4]"
                >
                  닫기
                </Link>
                <button
                  type="submit"
                  className="rounded-lg bg-[#4f378a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3b2571]"
                >
                  저장
                </button>
              </div>
            </form>

            {/* 파일 업로드·공유 (전체 상세 페이지와 동일) */}
            <FileManager
              customerId={selectedCustomer.id}
              files={toFileRows(selectedFiles)}
              shares={toShareRows(selectedShares)}
              shareToken={params.share}
              fileError={params.fileError}
            />
          </div>
        </ModalWrapper>
      )}
    </>
  );
}

const MODAL_INPUT =
  "w-full rounded-lg border border-[#cbc4d2] bg-white px-3 py-2 text-sm text-[#1d1b20] outline-none transition-colors focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/10";

function ModalField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#7a7582]">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
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

function PaginationLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
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
