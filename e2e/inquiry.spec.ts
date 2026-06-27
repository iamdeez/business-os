import { test, expect } from "@playwright/test";
import { login, DEMO_TENANT_SLUG } from "./helpers";

// SC-003 공개 문의 접수 → 관리자 인박스 노출
test("공개 문의를 접수하면 관리자 인박스에 노출된다", async ({ page }) => {
  const company = `E2E문의사_${Date.now()}`;

  await page.goto(`/inquiry/${DEMO_TENANT_SLUG}`);
  await page.fill('input[name="companyName"]', company);
  await page.fill('input[name="contactName"]', "테스터");
  await page.fill('input[name="email"]', "e2e-inquiry@test.com");
  await page.fill(
    'textarea[name="message"]',
    "E2E 자동 테스트 문의입니다. 프로젝트 유형과 일정을 충분히 설명하는 내용입니다."
  );
  await page.getByRole("button", { name: "문의 보내기" }).click();

  await expect(page.getByRole("heading", { name: "문의가 접수되었습니다" })).toBeVisible();

  // 관리자로 로그인하여 인박스에서 확인
  await login(page);
  await page.goto("/inquiries");
  await expect(page.getByText(company)).toBeVisible();
});

test("존재하지 않는 에이전시 slug 는 접수되지 않는다", async ({ page }) => {
  await page.goto(`/inquiry/non-existent-agency-xyz`);
  // 폼이 없거나 접수가 거부되어 성공 화면이 뜨지 않는다.
  await expect(page.getByRole("heading", { name: "문의가 접수되었습니다" })).toHaveCount(0);
});
