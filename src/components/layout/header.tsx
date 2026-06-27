"use client";

import { Bell, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="fixed left-[240px] right-0 top-0 z-20 flex h-[56px] items-center justify-between border-b border-[var(--surface-border)] bg-white px-6">
      <div />
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="알림"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-low)] hover:text-[var(--text)]"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ede9fe] text-xs font-semibold text-[var(--primary)]">
            {userName.slice(0, 1)}
          </div>
          <span className="text-sm font-medium text-[var(--text)]">{userName}</span>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          aria-label="로그아웃"
          className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-low)] hover:text-[var(--text)]"
        >
          <LogOut className="h-3.5 w-3.5" />
          로그아웃
        </button>
      </div>
    </header>
  );
}
