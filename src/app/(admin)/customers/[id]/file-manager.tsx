"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  Trash2,
  Link2,
  Check,
  Copy,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { generateUploadId } from "@/modules/file/upload-token";
import { createShareAction, revokeShareAction } from "@/modules/file/actions";

export interface FileRow {
  id: string;
  displayName: string;
  size: number;
  createdAt: string;
}

export interface ShareRow {
  id: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  fileCount: number;
  expired: boolean;
}

interface Props {
  customerId: string;
  files: FileRow[];
  shares: ShareRow[];
  shareToken?: string;
  fileError?: string;
  // 공유 생성·폐기 후 복귀할 경로 (모달=/customers?selected=, 전체=/customers/{id})
  returnPath: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileManager({ customerId, files, shares, shareToken, fileError, returnPath }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  async function handleFiles(fileList: FileList) {
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        setStatus(`업로드 중: ${file.name}`);
        const uploadId = generateUploadId();

        const presignRes = await fetch("/api/files/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            uploadId,
            displayName: file.name,
            mimeType: file.type || "application/octet-stream",
            size: file.size,
          }),
        });
        if (!presignRes.ok) {
          const data = await presignRes.json().catch(() => ({}));
          setError(`${file.name}: ${data.error ?? "업로드 준비 실패"}`);
          continue;
        }
        const { uploadUrl } = await presignRes.json();

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });
        if (!putRes.ok) {
          setError(`${file.name}: S3 업로드 실패`);
          continue;
        }

        const completeRes = await fetch("/api/files/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId }),
        });
        if (!completeRes.ok) {
          const data = await completeRes.json().catch(() => ({}));
          setError(`${file.name}: ${data.error ?? "업로드 확정 실패"}`);
          continue;
        }
      }
      setStatus(null);
      router.refresh();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}`
    : null;

  async function copyShareUrl() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("클립보드 복사에 실패했습니다. URL을 직접 복사하세요.");
    }
  }

  return (
    <div id="files" className="mt-8 rounded-xl border border-[var(--surface-border)] bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text)]">파일</h2>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg bg-[#4f378a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3b2571] disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "업로드 중..." : "파일 업로드"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {status && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#f2ecf4] px-4 py-2.5 text-sm text-[#4f378a]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {status}
        </div>
      )}
      {(error || fileError) && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#fee2e2] px-4 py-2.5 text-sm text-[var(--error)]">
          <AlertCircle className="h-4 w-4" />
          {error ?? fileError}
        </div>
      )}

      {/* Share link result (1회 노출) */}
      {shareUrl && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-800">
            <Check className="h-4 w-4" /> 공유 링크가 생성되었습니다 (7일 유효)
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 rounded-lg border border-green-300 bg-white px-3 py-2 text-xs text-[#1d1b20]"
            />
            <button
              type="button"
              onClick={copyShareUrl}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>
      )}

      {/* File list + share creation */}
      {files.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--text-muted)]">업로드된 파일이 없습니다.</p>
      ) : (
        <form action={createShareAction.bind(null, customerId)}>
          <input type="hidden" name="returnPath" value={returnPath} />
          <ul className="divide-y divide-[var(--surface-border)]">
            {files.map((file) => (
              <li key={file.id} className="flex items-center gap-3 py-3">
                <input
                  type="checkbox"
                  name="fileItemId"
                  value={file.id}
                  checked={selected.has(file.id)}
                  onChange={() => toggle(file.id)}
                  className="h-4 w-4 rounded border-[var(--surface-border)] accent-[#4f378a]"
                />
                <FileText className="h-4 w-4 shrink-0 text-[#4f378a]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--text)]">{file.displayName}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatSize(file.size)} · {file.createdAt}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--surface-border)] pt-4">
            <p className="text-xs text-[var(--text-muted)]">{selected.size}개 선택됨</p>
            <button
              type="submit"
              disabled={selected.size === 0}
              className="flex items-center gap-1.5 rounded-lg border border-[#4f378a]/30 px-4 py-2 text-sm font-semibold text-[#4f378a] transition-colors hover:bg-[#4f378a] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#4f378a]"
            >
              <Link2 className="h-4 w-4" />
              공유 링크 생성
            </button>
          </div>
        </form>
      )}

      {/* Existing share links */}
      {shares.length > 0 && (
        <div className="mt-6 border-t border-[var(--surface-border)] pt-5">
          <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">공유 링크</h3>
          <ul className="space-y-2">
            {shares.map((share) => {
              const inactive = share.revokedAt != null || share.expired;
              return (
                <li
                  key={share.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--surface-border)] px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text)]">
                      파일 {share.fileCount}개
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          share.revokedAt
                            ? "bg-[#e6e0e9] text-[#494551]"
                            : share.expired
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {share.revokedAt ? "폐기됨" : share.expired ? "만료됨" : "활성"}
                      </span>
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{share.expiresAt}까지</p>
                  </div>
                  {!inactive && (
                    <form action={revokeShareAction.bind(null, customerId)}>
                      <input type="hidden" name="shareLinkId" value={share.id} />
                      <input type="hidden" name="returnPath" value={returnPath} />
                      <button
                        type="submit"
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        폐기
                      </button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
