import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Home from "./page";

afterEach(cleanup);

describe("Landing page", () => {
  it("제품명과 시작 CTA 를 렌더한다", () => {
    render(<Home />);
    expect(screen.getByText("Business OS")).toBeDefined();
    expect(screen.getByRole("link", { name: "시작하기" })).toBeDefined();
  });

  it("핵심 기능 4개를 소개한다", () => {
    render(<Home />);
    expect(screen.getByText("문의 자동 접수")).toBeDefined();
    expect(screen.getByText("고객 CRM")).toBeDefined();
    expect(screen.getByText("파일 공유")).toBeDefined();
    expect(screen.getByText("현황 대시보드")).toBeDefined();
  });
});
