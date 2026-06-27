"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface Props {
  closeHref: string;
  children: React.ReactNode;
}

export function ModalWrapper({ closeHref, children }: Props) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push(closeHref, { scroll: false });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, closeHref]);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => router.push(closeHref, { scroll: false })}
        aria-hidden="true"
      />
      {/* Panel — slides in from right */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className="relative ml-auto flex h-full w-full max-w-[480px] flex-col overflow-y-auto bg-white shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}
