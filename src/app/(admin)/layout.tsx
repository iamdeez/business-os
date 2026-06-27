import { requireTenantAccess } from "@/modules/tenant/access";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = await requireTenantAccess();

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar userName={session.user.name ?? session.user.email} />
      </div>

      {/* Header */}
      <Header userName={session.user.name ?? session.user.email} />

      {/* Main content */}
      <main className="pb-16 pt-[64px] md:ml-[240px] md:pb-0">
        <div className="min-h-[calc(100vh-56px)] p-6">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
