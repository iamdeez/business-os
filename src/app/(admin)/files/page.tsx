import Link from "next/link";
import { FileText, FolderOpen } from "lucide-react";
import { requireTenantAccess } from "@/modules/tenant/access";
import { listTenantFiles } from "@/modules/file/repository";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function FilesPage() {
  const { tenantId } = await requireTenantAccess();
  const files = await listTenantFiles(tenantId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4f378a]/10">
          <FolderOpen className="h-4 w-4 text-[#4f378a]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[#1d1b20]">파일 관리</h1>
          <p className="text-xs text-[#7a7582]">고객사별 파일 업로드·공유는 고객 상세에서 관리합니다.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#cbc4d2]/60 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#cbc4d2]/60 bg-[#f8f2fa]">
              <th className="px-5 py-3.5 text-left text-xs font-medium text-[#7a7582]">파일명</th>
              <th className="px-5 py-3.5 text-left text-xs font-medium text-[#7a7582]">고객사</th>
              <th className="hidden px-5 py-3.5 text-right text-xs font-medium text-[#7a7582] sm:table-cell">
                크기
              </th>
              <th className="hidden px-5 py-3.5 text-right text-xs font-medium text-[#7a7582] md:table-cell">
                등록일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#cbc4d2]/40">
            {files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-sm text-[#7a7582]">
                  업로드된 파일이 없습니다.
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="transition-colors hover:bg-[#4f378a]/5">
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="h-4 w-4 shrink-0 text-[#4f378a]" />
                      <span className="truncate font-medium text-[#1d1b20]">{file.displayName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/customers/${file.customer.id}#files`}
                      className="text-[#4f378a] hover:underline"
                    >
                      {file.customer.companyName}
                    </Link>
                  </td>
                  <td className="hidden px-5 py-4 text-right text-[#494551] sm:table-cell">
                    {formatSize(file.size)}
                  </td>
                  <td className="hidden px-5 py-4 text-right text-xs text-[#7a7582] md:table-cell">
                    {file.createdAt.toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
