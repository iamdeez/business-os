"use client";

import { useState } from "react";
import { Link2, Copy, Check, ExternalLink } from "lucide-react";

// 워크스페이스의 공개 문의 폼 링크(/inquiry/{slug})를 표시하고 복사할 수 있게 한다.
export function InquiryLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/inquiry/${slug}`;
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 실패 시 사용자가 직접 복사
    }
  }

  return (
    <div className="rounded-xl border border-[#cbc4d2]/60 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4f378a]/10">
          <Link2 className="h-4 w-4 text-[#4f378a]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1d1b20]">공개 문의 링크</p>
          <p className="text-xs text-[#7a7582]">
            이 링크를 고객에게 공유하면 문의가 인박스로 접수됩니다.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          aria-label="공개 문의 링크"
          // min-w-0: flex 자식이 콘텐츠 폭 이하로 줄어들 수 있게 해 모바일 가로 overflow 방지
          className="min-w-0 flex-1 rounded-lg border border-[#cbc4d2] bg-[#f8f2fa] px-3 py-2 text-xs text-[#1d1b20]"
        />
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#4f378a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#3b2571]"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "복사됨" : "복사"}
        </button>
        <a
          href={path}
          target="_blank"
          rel="noreferrer"
          title="새 탭에서 열기"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#cbc4d2] text-[#7a7582] hover:bg-[#f2ecf4]"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
