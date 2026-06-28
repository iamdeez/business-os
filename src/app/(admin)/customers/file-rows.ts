import type { listFileItems, listShareLinks } from "@/modules/file/repository";
import type { FileRow, ShareRow } from "./[id]/file-manager";

// "now" 의존 매핑은 컴포넌트 밖(비-렌더)에서 수행한다 (react-hooks/purity).
export function toFileRows(items: Awaited<ReturnType<typeof listFileItems>>): FileRow[] {
  return items.map((f) => ({
    id: f.id,
    displayName: f.displayName,
    size: f.size,
    createdAt: f.createdAt.toLocaleDateString("ko-KR"),
  }));
}

export function toShareRows(links: Awaited<ReturnType<typeof listShareLinks>>): ShareRow[] {
  const now = Date.now();
  return links.map((s) => ({
    id: s.id,
    expiresAt: s.expiresAt.toLocaleString("ko-KR"),
    revokedAt: s.revokedAt ? s.revokedAt.toISOString() : null,
    createdAt: s.createdAt.toLocaleDateString("ko-KR"),
    fileCount: s.files.length,
    expired: s.expiresAt.getTime() <= now,
  }));
}
