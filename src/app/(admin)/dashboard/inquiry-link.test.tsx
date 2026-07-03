import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { InquiryLink } from "./inquiry-link";

afterEach(cleanup);

describe("InquiryLink", () => {
  it("slug 로 공개 문의 링크(/inquiry/{slug})를 표시한다", () => {
    render(<InquiryLink slug="acme-1234" />);
    const input = screen.getByLabelText("공개 문의 링크") as HTMLInputElement;
    expect(input.value).toContain("/inquiry/acme-1234");
  });

  it("새 탭 열기 링크가 문의 경로를 가리킨다", () => {
    render(<InquiryLink slug="acme-1234" />);
    const link = screen.getByTitle("새 탭에서 열기") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/inquiry/acme-1234");
  });
});
