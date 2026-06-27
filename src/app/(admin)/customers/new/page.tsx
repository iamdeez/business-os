import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createCustomerAction } from "@/modules/crm/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewCustomerPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/customers"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--surface-border)] bg-white text-[var(--text-muted)] hover:bg-[var(--surface-low)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--text)]">새 고객 추가</h1>
      </div>

      <div className="rounded-xl border border-[var(--surface-border)] bg-white p-6">
        {error && (
          <div className="mb-5 rounded-lg bg-[#fee2e2] px-4 py-3 text-sm text-[var(--error)]">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={createCustomerAction} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companyName">
                회사명 <span className="text-[var(--error)]">*</span>
              </Label>
              <Input id="companyName" name="companyName" placeholder="(주)크몽" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contactName">
                담당자명 <span className="text-[var(--error)]">*</span>
              </Label>
              <Input id="contactName" name="contactName" placeholder="홍길동" required />
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
                placeholder="contact@company.com"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">연락처</Label>
              <Input id="phone" name="phone" placeholder="010-1234-5678" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">상태</Label>
            <select
              id="status"
              name="status"
              defaultValue="ACTIVE"
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
              placeholder="특이사항을 입력하세요"
              className="rounded-lg border border-[var(--surface-border)] bg-white px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--outline)] resize-none focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" asChild size="sm">
              <Link href="/customers">취소</Link>
            </Button>
            <Button type="submit" size="sm">
              저장
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
