import { Download, FileText, Clock, ShieldX, LinkIcon } from "lucide-react";
import { resolveShare } from "@/modules/file/service";

interface Props {
  params: Promise<{ token: string }>;
}

const INVALID_MESSAGE: Record<"NOT_FOUND" | "EXPIRED" | "REVOKED", { title: string; desc: string }> = {
  NOT_FOUND: { title: "유효하지 않은 링크", desc: "공유 링크를 찾을 수 없습니다. 링크를 다시 확인해 주세요." },
  EXPIRED: { title: "만료된 링크", desc: "이 공유 링크는 만료되었습니다. 담당자에게 새 링크를 요청해 주세요." },
  REVOKED: { title: "폐기된 링크", desc: "이 공유 링크는 더 이상 사용할 수 없습니다." },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const resolved = await resolveShare(token);

  if (!resolved.ok) {
    const { title, desc } = INVALID_MESSAGE[resolved.code];
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f2fa] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#cbc4d2]/60 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <ShieldX className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-lg font-semibold text-[#1d1b20]">{title}</h1>
          <p className="mt-2 text-sm text-[#7a7582]">{desc}</p>
        </div>
      </main>
    );
  }

  const { link } = resolved;
  const files = link.files.map((f) => f.fileItem);

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#f8f2fa] px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4f378a]">
            <LinkIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1d1b20]">공유된 파일</h1>
            <p className="flex items-center gap-1 text-xs text-[#7a7582]">
              <Clock className="h-3 w-3" />
              {link.expiresAt.toLocaleString("ko-KR")}까지 유효
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#cbc4d2]/60 bg-white shadow-sm">
          {files.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-[#7a7582]">공유된 파일이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-[#cbc4d2]/40">
              {files.map((file) => (
                <li key={file.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f2ecf4]">
                      <FileText className="h-4 w-4 text-[#4f378a]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1d1b20]">{file.displayName}</p>
                      <p className="text-xs text-[#7a7582]">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <a
                    href={`/api/files/download?token=${encodeURIComponent(token)}&fileItemId=${encodeURIComponent(file.id)}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#4f378a] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3b2571]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    다운로드
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-[#7a7582]">
          다운로드 링크는 보안을 위해 짧은 시간만 유효합니다.
        </p>
      </div>
    </main>
  );
}
