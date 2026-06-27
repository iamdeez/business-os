import { requireTenantAccess } from "@/modules/tenant/access";

export default async function DashboardPage() {
  await requireTenantAccess();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-[var(--text)]">대시보드</h1>
      <p className="text-sm text-[var(--text-muted)]">
        통계 및 최근 활동이 여기에 표시됩니다. (T014에서 구현 예정)
      </p>
    </div>
  );
}
