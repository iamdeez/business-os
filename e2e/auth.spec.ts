import { test, expect } from "@playwright/test";
import { login, DEMO_OWNER } from "./helpers";

// 로그인 흐름 자체를 검증하므로 저장된 세션을 쓰지 않고 비인증 상태로 실행한다.
test.use({ storageState: { cookies: [], origins: [] } });

// SC-001 인증 흐름
test("데모 OWNER 로그인 후 대시보드로 이동한다", async ({ page }) => {
  await login(page);
  // 헤더·본문 양쪽에 "대시보드" 제목이 있어 main 영역으로 한정한다.
  await expect(page.getByRole("main").getByRole("heading", { name: "대시보드" })).toBeVisible();
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
