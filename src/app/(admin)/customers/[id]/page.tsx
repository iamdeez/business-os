import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { requireTenantAccess } from "@/modules/tenant/access";
import { getCustomer } from "@/modules/crm/repository";
import { updateCustomerAction } from "@/modules/crm/actions";
import { listFileItems, listShareLinks } from "@/modules/file/repository";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileManager } from "./file-manager";
import { toFileRows, toShareRows } from "../file-rows";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    updated?: string;
    share?: string;
    revoked?: string;
    fileError?: string;
  }>;
}

export default async function CustomerDetailPage({ params, searchParams }: Props) {
  const { tenantId } = await requireTenantAccess();
  const { id } = await params;
  const { error, updated, share, revoked, fileError } = await searchParams;

  const customer = await getCustomer(tenantId, id);
  if (!customer) notFound();

  const [fileItems, shareLinks] = await Promise.all([
    listFileItems(tenantId, id),
    listShareLinks(tenantId, id),
  ]);

  const files = toFileRows(fileItems);
  const shares = toShareRows(shareLinks);

  const updateAction = updateCustomerAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/customers"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--surface-border)] bg-white text-[var(--text-muted)] hover:bg-[var(--surface-low)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div className="flex flex-1 items-center gap-3">
          <h1 className="text-2xl font-semibold text-[var(--text)]">
            {customer.companyName}
          </h1>
          <Badge variant={customer.status === "ACTIVE" ? "active" : "inactive"}>
            {customer.status === "ACTIVE" ? "활성" : "비활성"}
          </Badge>
        </div>
      </div>

      {updated && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-[#dcfce7] px-4 py-3 text-sm text-[#15803d]">
          <CheckCircle2 className="h-4 w-4" />
          고객 정보가 업데이트되었습니다.
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg bg-[#fee2e2] px-4 py-3 text-sm text-[var(--error)]">
          {decodeURIComponent(error)}
        </div>
      )}

      <div className="rounded-xl border border-[var(--surface-border)] bg-white p-6">
        <form action={updateAction} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companyName">
                회사명 <span className="text-[var(--error)]">*</span>
              </Label>
              <Input
                id="companyName"
                name="companyName"
                defaultValue={customer.companyName}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contactName">
                담당자명 <span className="text-[var(--error)]">*</span>
              </Label>
              <Input
                id="contactName"
                name="contactName"
                defaultValue={customer.contactName}
                required
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">
                이메일 <span className="text-[var(--error)]">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer.email}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer.phone ?? ""}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">상태</Label>
            <select
              id="status"
              name="status"
              defaultValue={customer.status}
              className="h-[44px] rounded-lg border border-[var(--surface-border)] bg-white px-3 text-sm text-[var(--text)] focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20"
            >
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memo">메모</Label>
            <textarea
              id="memo"
              name="memo"
              rows={3}
              defaultValue={customer.memo ?? ""}
              className="rounded-lg border border-[var(--surface-border)] bg-white px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--outline)] resize-none focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20"
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[var(--surface-border)] pt-4">
            <p className="text-xs text-[var(--outline)]">
              등록일:{" "}
              {new Date(customer.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild size="sm">
                <Link href="/customers">목록</Link>
              </Button>
              <Button type="submit" size="sm">
                저장
              </Button>
            </div>
          </div>
        </form>
      </div>

      {revoked && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#dcfce7] px-4 py-3 text-sm text-[#15803d]">
          <CheckCircle2 className="h-4 w-4" />
          공유 링크를 폐기했습니다.
        </div>
      )}

      <FileManager
        customerId={id}
        files={files}
        shares={shares}
        shareToken={share}
        fileError={fileError}
      />
    </div>
  );
}
