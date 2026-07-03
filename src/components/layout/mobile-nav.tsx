"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/customers", label: "고객", icon: Users },
  { href: "/inquiries", label: "문의", icon: MessageSquare },
  { href: "/files", label: "파일", icon: FolderOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-[var(--surface-border)] bg-white md:hidden">
      {mobileNavItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors",
              active ? "text-[var(--primary)]" : "text-[var(--outline)]"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
