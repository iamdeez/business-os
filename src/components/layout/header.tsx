"use client";

import { Bell, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "대시보드",
  "/customers": "고객 관리",
  "/inquiries": "문의 관리",
  "/reservations": "예약 관리",
  "/files": "파일 관리",
  "/projects": "프로젝트",
  "/settings": "설정",
};

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  const pathname = usePathname();

  const title =
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? "";

  return (
    <header className="fixed left-[240px] right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-[#cbc4d2]/60 bg-white/80 px-6 backdrop-blur-md">
      <h1 className="text-[17px] font-semibold text-[#1d1b20]">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Bell */}
        <button
          type="button"
          aria-label="알림"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#494551] transition-colors hover:bg-[#f2ecf4]"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-[#ba1a1a] ring-2 ring-white" />
        </button>

        <div className="h-7 w-px bg-[#cbc4d2]" />

        {/* User pill */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-[#cbc4d2]/50 bg-[#f2ecf4] px-3 py-1.5 transition-colors hover:bg-[#e6e0e9]"
        >
          <span className="text-sm font-semibold text-[#1d1b20]">{userName} 님</span>
          <ChevronDown className="h-4 w-4 text-[#494551]" />
        </button>
      </div>
    </header>
  );
}
