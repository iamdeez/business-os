"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CalendarDays,
  FolderOpen,
  Kanban,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/customers", label: "고객 관리", icon: Users },
  { href: "/inquiries", label: "문의 관리", icon: MessageSquare, badge: 3 },
  { href: "/reservations", label: "예약 관리", icon: CalendarDays },
  { href: "/files", label: "파일 관리", icon: FolderOpen },
  { href: "/projects", label: "프로젝트", icon: Kanban },
];

interface SidebarProps {
  userName: string;
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[240px] flex-col bg-[#6750a4]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
          <span className="text-[11px] font-bold text-white">B</span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">Business OS</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ba1a1a] px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 px-3 pb-4 pt-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
            pathname.startsWith("/settings")
              ? "bg-white/20 text-white shadow-sm"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          <span>설정</span>
        </Link>

        {/* User card */}
        <div className="mt-3 flex items-center gap-2.5 rounded-xl px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
            {userName.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-white">{userName}</p>
              <span className="shrink-0 rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">
                관리자
              </span>
            </div>
            <p className="text-[11px] text-white/50">Admin Mode</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="로그아웃"
            className="shrink-0 p-1.5 text-white/60 transition-colors hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
