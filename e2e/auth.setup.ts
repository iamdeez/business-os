import { test as setup, expect } from "@playwright/test";
import { DEMO_OWNER } from "./helpers";

// 1회만 로그인해 세션을 저장한다. 모든 인증 테스트가 이 상태를 재사용하여
// 반복 로그인(production rate limit·쿠키 race)으로 인한 flakiness 를 제거한다.
const authFile = "e2e/.auth/owner.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(DEMO_OWNER.email);
  await page.getByLabel("비밀번호", { exact: true }).fill(DEMO_OWNER.password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await page.context().storageState({ path: authFile });
});
