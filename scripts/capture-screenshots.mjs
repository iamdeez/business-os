// 라이브 배포본을 Playwright 로 캡처해 docs/screenshots 에 저장한다.
// 사용: node scripts/capture-screenshots.mjs  (chromium 설치 필요: pnpm exec playwright install chromium)
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.SHOT_BASE_URL ?? "https://business-os-kmong.fly.dev";
const OUT = "docs/screenshots";
const CRED = { email: "owner@demo-agency.com", password: "demo1234!" };

mkdirSync(OUT, { recursive: true });

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel("이메일").fill(CRED.email);
  await page.getByLabel("비밀번호", { exact: true }).fill(CRED.password);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
}

async function shot(page, path, file, { full = true } = {}) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${file}`, fullPage: full });
  console.log(`✓ ${file}  ←  ${path}`);
}

const browser = await chromium.launch();

// ── 데스크톱 (인증) ──
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

// 공개 화면(로그인 불필요)
await shot(page, "/", "01-landing.png");
await shot(page, "/login", "02-login.png", { full: false });
await shot(page, "/signup", "03-signup.png", { full: false });
await shot(page, "/inquiry/demo-agency", "08-public-inquiry.png");
await shot(page, "/share/demo_share_techstart_0001", "09-public-share.png", { full: false });

// 인증 화면
await login(page);
await shot(page, "/dashboard", "04-dashboard.png");
await shot(page, "/customers", "05-customers.png");
await shot(page, "/customers/cust_001", "06-customer-files.png");
await shot(page, "/inquiries", "07-inquiries.png");
await ctx.close();

// ── 모바일 (인증) ──
const mctx = await browser.newContext({ ...devices["iPhone 13"] });
const mpage = await mctx.newPage();
await login(mpage);
await shot(mpage, "/dashboard", "10-mobile-dashboard.png");
await mctx.close();

await browser.close();
console.log("\n완료 → docs/screenshots/");
