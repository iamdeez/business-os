import { describe, it, expect } from "vitest";
import {
  inquiryReceivedEmail,
  filesSharedEmail,
  escapeHtml,
  TEMPLATE_KEY,
} from "./templates";

describe("escapeHtml", () => {
  it("HTML 특수문자를 이스케이프한다", () => {
    expect(escapeHtml(`<script>"&'`)).toBe("&lt;script&gt;&quot;&amp;&#39;");
  });
});

describe("inquiryReceivedEmail", () => {
  const data = {
    companyName: "ACME",
    contactName: "홍길동",
    email: "a@b.com",
    inquiryUrl: "https://app.test/inquiries/1",
  };

  it("제목에 회사명·담당자를 포함한다", () => {
    expect(inquiryReceivedEmail(data).subject).toContain("ACME");
    expect(inquiryReceivedEmail(data).subject).toContain("홍길동");
  });

  it("본문에 연락처·문의 링크를 포함한다", () => {
    const { html } = inquiryReceivedEmail(data);
    expect(html).toContain("a@b.com");
    expect(html).toContain("https://app.test/inquiries/1");
  });

  it("사용자 입력의 HTML 을 이스케이프한다", () => {
    const { html } = inquiryReceivedEmail({ ...data, companyName: "<b>x</b>" });
    expect(html).not.toContain("<b>x</b>");
    expect(html).toContain("&lt;b&gt;x&lt;/b&gt;");
  });
});

describe("filesSharedEmail", () => {
  const data = {
    customerName: "ACME",
    shareUrl: "https://app.test/share/tok",
    fileCount: 3,
    expiresAt: "2026-07-05",
  };

  it("제목에 파일 개수를 포함한다", () => {
    expect(filesSharedEmail(data).subject).toContain("3");
  });

  it("본문에 공유 링크·만료일을 포함한다", () => {
    const { html } = filesSharedEmail(data);
    expect(html).toContain("https://app.test/share/tok");
    expect(html).toContain("2026-07-05");
  });
});

describe("TEMPLATE_KEY", () => {
  it("두 알림 유형의 버전 키를 제공한다", () => {
    expect(TEMPLATE_KEY.inquiry_received).toBe("inquiry_received_v1");
    expect(TEMPLATE_KEY.files_shared).toBe("files_shared_v1");
  });
});
