import { test, expect } from "@playwright/test";
import { login, DEMO_OWNER } from "./helpers";

// SC-001 인증 흐름
test("데모 OWNER 로그인 후 대시보드로 이동한다", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("heading", { name: "대시보드" })).toBeVisible();
});

test("잘못된 비밀번호는 로그인에 실패한다", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(DEMO_OWNER.email);
  await page.getByLabel("비밀번호", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("미인증 상태로 보호 페이지 접근 시 로그인으로 redirect 된다", async ({ page }) => {
  await page.goto("/customers");
  await expect(page).toHaveURL(/\/login/);
});
