// 라이브 배포본을 순회하며 데모 영상(webm)을 녹화한다.
// 이후 ffmpeg 로 GIF 변환: (README/package.json 의 demo:gif 참고)
// 사용: node scripts/record-demo.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, renameSync } from "node:fs";

const BASE = process.env.SHOT_BASE_URL ?? "https://business-os-kmong.fly.dev";
const DIR = "docs/demo-video";
const CRED = { email: "owner@demo-agency.com", password: "demo1234!" };
const wait = (p, ms) => p.waitForTimeout(ms);

mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: DIR, size: { width: 1280, height: 800 } },
});
const page = await ctx.newPage();

// 1) 랜딩
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
await wait(page, 1800);

// 2) 로그인 (타이핑 연출)
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
await wait(page, 800);
await page.getByLabel("이메일").pressSequentially(CRED.email, { delay: 45 });
await page.getByLabel("비밀번호", { exact: true }).pressSequentially(CRED.password, { delay: 45 });
await wait(page, 400);
await page.getByRole("button", { name: "로그인" }).click();
await page.waitForURL(/\/dashboard/, { timeout: 20000 });
await wait(page, 2000);

// 3) 대시보드 스크롤
await page.mouse.wheel(0, 400);
await wait(page, 1200);
await page.mouse.wheel(0, -400);
await wait(page, 800);

// 4) 고객 관리
await page.getByRole("link", { name: "고객 관리" }).click();
await page.waitForURL(/\/customers/, { timeout: 15000 });
await wait(page, 2000);

// 5) 고객 상세(파일 매니저)
await page.goto(`${BASE}/customers/cust_001`, { waitUntil: "domcontentloaded" });
await wait(page, 2400);
await page.mouse.wheel(0, 500);
await wait(page, 1500);

// 6) 문의 관리
await page.getByRole("link", { name: "문의 관리" }).click();
await page.waitForURL(/\/inquiries/, { timeout: 15000 });
await wait(page, 2200);

// 7) 공개 문의 폼(고객 시점)
await page.goto(`${BASE}/inquiry/demo-agency`, { waitUntil: "domcontentloaded" });
await wait(page, 2200);

const videoPath = await page.video().path();
await ctx.close();
await browser.close();

const out = `${DIR}/demo.webm`;
renameSync(videoPath, out);
console.log(`녹화 완료 → ${out}`);
