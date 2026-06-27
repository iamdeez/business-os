// 이메일 템플릿 — 순수 모듈 (server-only 의존 없음, 단위 테스트 가능).
// 사용자 입력이 본문에 들어가므로 반드시 escapeHtml 로 처리한다.

export type NotificationType = "inquiry_received" | "files_shared";

// 템플릿 버전 키. 내용 변경 시 버전을 올려 추적한다.
export const TEMPLATE_KEY: Record<NotificationType, string> = {
  inquiry_received: "inquiry_received_v1",
  files_shared: "files_shared_v1",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(heading: string, bodyHtml: string): string {
  return [
    `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1d1b20">`,
    `<h1 style="font-size:18px;color:#4f378a;margin:0 0 16px">${heading}</h1>`,
    bodyHtml,
    `<p style="margin-top:24px;font-size:12px;color:#7a7582">Business OS 자동 발송 메일입니다.</p>`,
    `</div>`,
  ].join("");
}

export interface InquiryReceivedData {
  companyName: string;
  contactName: string;
  email: string;
  inquiryUrl: string;
}

export function inquiryReceivedEmail(d: InquiryReceivedData): { subject: string; html: string } {
  const subject = `[새 문의] ${d.companyName} - ${d.contactName}`;
  const html = layout(
    "새로운 문의가 접수되었습니다",
    [
      `<p style="font-size:14px;line-height:1.6">새 문의가 도착했습니다.</p>`,
      `<table style="font-size:14px;line-height:1.8">`,
      `<tr><td style="color:#7a7582;padding-right:12px">회사명</td><td>${escapeHtml(d.companyName)}</td></tr>`,
      `<tr><td style="color:#7a7582;padding-right:12px">담당자</td><td>${escapeHtml(d.contactName)}</td></tr>`,
      `<tr><td style="color:#7a7582;padding-right:12px">이메일</td><td>${escapeHtml(d.email)}</td></tr>`,
      `</table>`,
      `<p style="margin-top:20px"><a href="${escapeHtml(d.inquiryUrl)}" style="display:inline-block;background:#4f378a;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">문의 확인하기</a></p>`,
    ].join("")
  );
  return { subject, html };
}

export interface FilesSharedData {
  customerName: string;
  shareUrl: string;
  fileCount: number;
  expiresAt: string;
}

export function filesSharedEmail(d: FilesSharedData): { subject: string; html: string } {
  const subject = `파일이 공유되었습니다 (${d.fileCount}개)`;
  const html = layout(
    "파일이 공유되었습니다",
    [
      `<p style="font-size:14px;line-height:1.6">${escapeHtml(d.customerName)}님, 파일 ${d.fileCount}개가 공유되었습니다.</p>`,
      `<p style="margin:20px 0"><a href="${escapeHtml(d.shareUrl)}" style="display:inline-block;background:#4f378a;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">파일 다운로드</a></p>`,
      `<p style="font-size:13px;color:#7a7582">이 링크는 ${escapeHtml(d.expiresAt)}까지 유효합니다.</p>`,
    ].join("")
  );
  return { subject, html };
}
