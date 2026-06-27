"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CalendarDays,
  FolderOpen,
  Kanban,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/customers", label: "고객 관리", icon: Users },
  { href: "/inquiries", label: "문의 관리", icon: MessageSquare, badge: 3 },
  { href: "/reservations", label: "예약 관리", icon: CalendarDays },
  { href: "/files", label: "파일 관리", icon: FolderOpen },
  { href: "/projects", label: "프로젝트", icon: Kanban },
];

const bottomItems = [{ href: "/settings", label: "설정", icon: Settings }];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[240px] flex-col border-r border-[var(--surface-border)] bg-white">
      {/* Logo */}
      <div className="flex h-[56px] items-center gap-2.5 border-b border-[var(--surface-border)] px-5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}
        >
          <span className="text-[11px] font-bold text-white">B</span>
        </div>
        <span className="text-[15px] font-semibold text-[var(--text)]">Business OS</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-[#ede9fe] text-[var(--primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-low)] hover:text-[var(--text)]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <Badge variant="count">{item.badge}</Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[var(--surface-border)] px-3 py-3">
        {bottomItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                active
                  ? "bg-[#ede9fe] text-[var(--primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-low)] hover:text-[var(--text)]"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
