import Link from "next/link";
import { Users, MessageSquare, FolderOpen, ArrowRight } from "lucide-react";
import { requireTenantAccess } from "@/modules/tenant/access";
import { getDashboardData } from "@/modules/dashboard/queries";
import type { InquiryStatus } from "@/modules/inquiry/schema";
import { InquiryLink } from "./inquiry-link";

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

export default async function DashboardPage() {
  const { tenantId, tenant } = await requireTenantAccess();
  const { customerCount, newInquiryCount, fileCount, recentInquiries } =
    await getDashboardData(tenantId);

  const stats = [
    { label: "고객사", value: customerCount, unit: "곳", icon: Users, href: "/customers" },
    { label: "신규 문의", value: newInquiryCount, unit: "건", icon: MessageSquare, href: "/inquiries?status=NEW" },
    { label: "파일", value: fileCount, unit: "개", icon: FolderOpen, href: "/files" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[#1d1b20]">대시보드</h1>

      {/* 공개 문의 링크 */}
      <InquiryLink slug={tenant.slug} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-xl border border-[#cbc4d2]/60 bg-white p-5 shadow-sm transition-colors hover:border-[#4f378a]/40"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4f378a]/10">
                <s.icon className="h-4 w-4 text-[#4f378a]" />
              </div>
              <ArrowRight className="h-4 w-4 text-[#cbc4d2] transition-colors group-hover:text-[#4f378a]" />
            </div>
            <p className="text-sm text-[#7a7582]">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#1d1b20]">
              {s.value}
              <span className="ml-1 text-sm font-medium text-[#7a7582]">{s.unit}</span>
            </p>
          </Link>
        ))}
      </div>

      {/* Recent inquiries */}
      <div className="overflow-hidden rounded-xl border border-[#cbc4d2]/60 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#cbc4d2]/60 px-5 py-4">
          <h2 className="text-sm font-semibold text-[#1d1b20]">최근 문의</h2>
          <Link href="/inquiries" className="text-xs font-medium text-[#4f378a] hover:underline">
            전체 보기
          </Link>
        </div>
        {recentInquiries.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#7a7582]">접수된 문의가 없습니다.</p>
        ) : (
          <ul className="divide-y divide-[#cbc4d2]/40">
            {recentInquiries.map((inq) => (
              <li key={inq.id}>
                <Link
                  href={`/inquiries?selected=${inq.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#4f378a]/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1d1b20]">{inq.companyName}</p>
                    <p className="text-xs text-[#7a7582]">{inq.contactName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[inq.status]}`}
                    >
                      {STATUS_LABEL[inq.status]}
                    </span>
                    <span className="hidden text-xs text-[#7a7582] sm:inline">
                      {inq.createdAt.toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
