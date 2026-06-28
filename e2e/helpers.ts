import { type Page, expect } from "@playwright/test";

export const DEMO_OWNER = { email: "owner@demo-agency.com", password: "demo1234!" };
export const DEMO_TENANT_SLUG = "demo-agency";

// 데모 OWNER 로 로그인하고 대시보드 진입을 확인한다.
export async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(DEMO_OWNER.email);
  // exact: true — "비밀번호 보기" 토글 버튼(aria-label)과의 strict mode 충돌 방지
  await page.getByLabel("비밀번호", { exact: true }).fill(DEMO_OWNER.password);
  await page.getByRole("button", { name: "로그인" }).click();
  // 전체 페이지 네비게이션 + CI 콜드스타트 렌더를 감안해 넉넉한 타임아웃.
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}
