import { test, expect } from "@playwright/test";

// SC-012 390px 모바일 반응형·가로 overflow 없음 (storageState 인증 재사용)
test.use({ viewport: { width: 390, height: 844 } });

test("390px 모바일에서 대시보드가 가로 overflow 없이 표시된다", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("main").getByRole("heading", { name: "대시보드" })).toBeVisible();

  // 가로 스크롤(overflow) 이 없어야 한다.
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  expect(hasOverflow).toBe(false);
});

test("모바일에서 고객 관리로 이동할 수 있다", async ({ page }) => {
  await page.goto("/customers");
  await expect(page).toHaveURL(/\/customers/);
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  expect(hasOverflow).toBe(false);
});
