import { type Page, expect } from "@playwright/test";

export const DEMO_OWNER = { email: "owner@demo-agency.com", password: "demo1234!" };
export const DEMO_TENANT_SLUG = "demo-agency";

// 데모 OWNER 로 로그인하고 대시보드 진입을 확인한다.
export async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(DEMO_OWNER.email);
  await page.getByLabel("비밀번호").fill(DEMO_OWNER.password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}
