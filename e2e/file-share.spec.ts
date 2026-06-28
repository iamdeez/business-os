import { test, expect } from "@playwright/test";

// SC-007~SC-009 파일 업로드~공유~다운로드.
// 브라우저 직접 S3 PUT 업로드는 실제 S3 + CORS 가 필요하므로 CI 기본 실행에서 제외하고,
// 실제 자격증명이 준비된 staging(T019)에서 E2E_S3_READY=1 로 실행한다.
test.skip(!process.env.E2E_S3_READY, "실제 S3 연동 필요 — staging(T019)에서 실행");

test("고객 상세에서 파일 업로드 후 공유 링크를 생성한다", async ({ page }) => {
  await page.goto("/customers");
  await page.getByRole("link", { name: "보기" }).first().click();

  // 파일 업로드 (테스트 픽스처)
  await page.locator('input[type="file"]').setInputFiles({
    name: "e2e-sample.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 e2e sample"),
  });
  await expect(page.getByText("e2e-sample.pdf")).toBeVisible({ timeout: 30_000 });

  // 파일 선택 후 공유 링크 생성
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "공유 링크 생성" }).click();
  await expect(page.getByText(/공유 링크가 생성되었습니다/)).toBeVisible();
});
