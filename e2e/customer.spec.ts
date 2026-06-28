import { test, expect } from "@playwright/test";

// SC-005 고객 생성·검색·수정 (storageState 로 인증된 컨텍스트 재사용)
test("고객을 생성하고 검색으로 찾을 수 있다", async ({ page }) => {
  const company = `E2E고객_${Date.now()}`;

  await page.goto("/customers/new");
  await page.fill('input[name="companyName"]', company);
  await page.fill('input[name="contactName"]', "김담당");
  await page.fill('input[name="email"]', "cust-e2e@test.com");
  await page.getByRole("button", { name: "저장" }).click();

  await expect(page).toHaveURL(/\/customers/);

  // 검색
  await page.fill('input[name="search"]', company);
  await page.keyboard.press("Enter");
  await expect(page.getByText(company)).toBeVisible();
});

test("필수값 누락 시 고객이 생성되지 않는다", async ({ page }) => {
  await page.goto("/customers/new");
  // 회사명만 입력하고 저장 → 브라우저 required 검증으로 제출되지 않거나 동일 페이지 유지
  await page.fill('input[name="companyName"]', "불완전고객");
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page).toHaveURL(/\/customers\/new/);
});
