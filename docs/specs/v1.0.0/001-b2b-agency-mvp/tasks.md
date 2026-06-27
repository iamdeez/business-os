# Tasks: B2B Agency MVP

> Branch: `docs/SPEC-001-b2b-agency-mvp` | Date: 2026-06-28 | Plan: [plan.md](./plan.md)

## 전제 조건

- [x] `spec.md`의 모든 `[NEEDS CLARIFICATION]` 항목이 해소되었다.
- [x] `plan.md`의 Constitution Gates가 모두 통과했다.
- [x] 이전 `CHANGES.md`가 존재하지 않음을 확인했다.
- [x] B2B 에이전시를 첫 포트폴리오 업종으로 확정했다.

## 태스크 목록

> `[P]`: 선행 조건 충족 후 다른 태스크와 병렬 실행 가능

### Phase 1. 기반 작업

- [ ] **T001** — Next.js 애플리케이션과 품질 스크립트 초기화
  - 구현 파일: `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `src/app/*`
  - 관련 요구사항: `NFR-005`, `NFR-006`, `NFR-008`
  - 상세: Next.js 16.2 안정 계열, TypeScript, Tailwind, App Router, pnpm과 lint/typecheck/test/build 스크립트를 구성한다.
  - 완료 기준: 기본 앱이 실행되고 lint·typecheck·build가 성공한다.

- [ ] **T002** — 환경 계약과 외부 클라이언트 골격 작성 (T001 완료 후) `[P]`
  - 구현 파일: `.env.example`, `src/lib/env.ts`, `src/lib/s3.ts`, `src/lib/resend.ts`
  - 관련 요구사항: `NFR-002`, `NFR-003`, `NFR-004`
  - 상세: 환경변수를 서버 시작 시 검증하고 실제 값 없는 예제와 test adapter 주입 경계를 만든다.
  - 완료 기준: 필수 환경 누락은 명확한 서버 오류를 내고 클라이언트 bundle에 server secret이 포함되지 않는다.

- [ ] **T003** — Prisma schema·최초 migration·seed 기반 작성 (T001 완료 후)
  - 구현 파일: `prisma/schema.prisma`, `prisma/migrations/*/migration.sql`, `prisma/seed.ts`, `src/lib/db.ts`
  - 관련 요구사항: `FR-004`~`FR-014`, `NFR-001`, `NFR-007`
  - 상세: plan의 데이터 모델, unique 제약과 tenant 복합 인덱스를 구현한다.
  - 완료 기준: 빈 PostgreSQL에 migration이 적용되고 Prisma Client 생성과 seed 골격 실행이 성공한다.

- [ ] **T004** — Better Auth와 tenant membership 경계 구현 (T003 완료 후)
  - 구현 파일: `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts`, `src/proxy.ts`, `src/modules/tenant/access.ts`, `src/modules/tenant/repository.ts`
  - 관련 요구사항: `FR-003`, `FR-004`, `NFR-001`, `NFR-002`
  - 상세: 이메일·비밀번호, 공개 가입 차단, 세션, OWNER seed와 server-side membership 검증을 구현한다.
  - 완료 기준: 인증·로그아웃과 교차 tenant 거부 통합 테스트가 통과한다.

- [ ] **T005** — 공통 UI와 운영 레이아웃 구현 (T001, T004 완료 후) `[P]`
  - 구현 파일: `components.json`, `src/components/ui/*`, `src/components/layout/*`, `src/app/(auth)/login/page.tsx`, `src/app/(admin)/layout.tsx`, `src/app/globals.css`
  - 관련 요구사항: `FR-003`, `NFR-005`, `NFR-006`
  - 상세: 로그인, sidebar, header, 모바일 navigation과 공통 폼·테이블·상태 UI를 만든다.
  - 완료 기준: 모바일·데스크톱에서 인증 후 빈 운영 shell을 키보드로 탐색할 수 있다.

### Phase 2. 핵심 도메인 구현

- [ ] **T006** — 고객사 validation·repository·actions 구현 (T003, T004 완료 후) `[P]`
  - 구현 파일: `src/modules/crm/schema.ts`, `repository.ts`, `actions.ts`
  - 관련 요구사항: `FR-005`, `FR-006`, `NFR-001`, `NFR-007`
  - 상세: tenant-scoped CRUD, 검색, 상태 필터와 cursor pagination을 구현한다.
  - 완료 기준: 정상·validation·교차 tenant·페이지 경계 통합 테스트가 통과한다.

- [ ] **T007** — 고객사 목록·등록·상세 화면 구현 (T005, T006 완료 후)
  - 구현 파일: `src/app/(admin)/customers/page.tsx`, `new/page.tsx`, `[id]/page.tsx`
  - 관련 요구사항: `FR-005`, `FR-006`, `NFR-005`, `NFR-006`
  - 상세: 고객 언어 기반 폼, 검색·필터·페이지 이동과 수정 흐름을 연결한다.
  - 완료 기준: E2E에서 고객 생성·검색·수정이 완료된다.

- [ ] **T008** — 공개 문의와 인박스 도메인 구현 (T003, T004 완료 후) `[P]`
  - 구현 파일: `src/modules/inquiry/schema.ts`, `repository.ts`, `actions.ts`
  - 관련 요구사항: `FR-001`, `FR-002`, `FR-007`, `FR-008`, `NFR-001`
  - 상세: tenantSlug 해석, honeypot, requestId idempotency, 상태 변경과 고객 연결을 구현한다.
  - 완료 기준: 정상·중복·오류·교차 tenant 통합 테스트가 통과한다.

- [ ] **T009** — 공개 문의·관리자 인박스 화면 구현 (T005, T006, T008 완료 후)
  - 구현 파일: `src/app/inquiry/[tenantSlug]/page.tsx`, `src/app/(admin)/inquiries/page.tsx`, `[id]/page.tsx`
  - 관련 요구사항: `FR-001`, `FR-002`, `FR-007`, `FR-008`, `NFR-005`, `NFR-006`
  - 상세: 공개 접수 성공/오류, 인박스 필터, 상태 변경과 고객 연결 UI를 만든다.
  - 완료 기준: 공개 제출부터 운영자 처리까지 E2E가 통과한다.

- [ ] **T010** — S3 업로드 예약·확정과 파일 정책 구현 (T002, T003, T004 완료 후) `[P]`
  - 구현 파일: `src/modules/file/schema.ts`, `repository.ts`, `service.ts`, `src/app/api/files/presign/route.ts`, `complete/route.ts`
  - 관련 요구사항: `FR-009`, `NFR-001`~`NFR-004`
  - 상세: MIME/확장자/크기 검증, UUID key, 5분 PUT, S3 확인, uploadId idempotency를 구현한다.
  - 완료 기준: 허용·금지·경계·중복·교차 tenant 테스트가 통과한다.

- [ ] **T011** — 공유 링크와 다운로드 계약 구현 (T010 완료 후)
  - 구현 파일: `src/modules/file/repository.ts`, `service.ts`, `src/app/share/[token]/page.tsx`, `src/app/api/files/download/route.ts`
  - 관련 요구사항: `FR-010`, `FR-011`, `NFR-001`~`NFR-004`
  - 상세: 선택 파일 transaction 검증, token hash, 만료·폐기, 15분 GET URL을 구현한다.
  - 완료 기준: 유효·만료·폐기·파일 변조·tenant 불일치 테스트가 통과한다.

- [ ] **T012** — 파일 관리·공유 UI 구현 (T005, T007, T010, T011 완료 후)
  - 구현 파일: `src/app/(admin)/files/page.tsx`, `src/app/(admin)/customers/[id]/page.tsx`
  - 관련 요구사항: `FR-009`~`FR-011`, `NFR-005`, `NFR-006`
  - 상세: 고객사 파일 업로드, 진행 상태, 파일 선택과 공유 링크 생성·폐기 UI를 만든다.
  - 완료 기준: 업로드부터 고객 다운로드까지 E2E가 통과한다.

- [ ] **T013** — 이메일 알림과 발송 로그 구현 (T002, T003, T008, T011 완료 후) `[P]`
  - 구현 파일: `src/modules/notification/repository.ts`, `service.ts`, `templates.tsx`
  - 관련 요구사항: `FR-012`, `NFR-002`, `NFR-004`
  - 상세: 두 템플릿, PENDING/SENT/FAILED, provider ID와 이중 idempotency를 구현한다.
  - 완료 기준: provider 성공·실패·중복 mock 통합 테스트가 통과한다.

- [ ] **T014** — 대시보드 query와 화면 구현 (T005, T006, T008, T010 완료 후) `[P]`
  - 구현 파일: `src/modules/dashboard/queries.ts`, `src/app/(admin)/dashboard/page.tsx`
  - 관련 요구사항: `FR-013`, `NFR-001`, `NFR-007`
  - 상세: tenant별 고객·NEW 문의·파일 집계와 최근 문의 5건을 표시한다.
  - 완료 기준: fixture 집계와 UI 표시가 일치한다.

- [ ] **T015** — B2B 에이전시 데모 seed 완성 (T003, T006, T008, T010 완료 후) `[P]`
  - 구현 파일: `prisma/seed.ts`
  - 관련 요구사항: `FR-014`
  - 상세: tenant, OWNER, 고객사, 상태별 문의와 파일 metadata를 고정 식별자로 upsert한다.
  - 완료 기준: seed 2회 실행 후 데이터 수와 로그인 정보가 동일하다.

### Phase 3. 검증·배포 준비

- [ ] **T016** — 단위·통합 테스트 스위트 작성 (각 도메인 태스크와 병행) `[P]`
  - 테스트 파일: `tests/unit/*.test.ts`, `tests/integration/*.test.ts`, `vitest.config.ts`
  - 검증 대상: `SC-002`, `SC-004`, `SC-005`, `SC-006`, `SC-007`, `SC-008`, `SC-009`, `SC-010`, `SC-011`
  - 상세: schema, 상태, tenant repository, idempotency, 파일 token과 집계를 자동 검증한다.
  - 완료 기준: SC 매핑 테스트가 PostgreSQL test DB에서 모두 통과한다.

- [ ] **T017** — 핵심 브라우저 E2E 작성 (T007, T009, T012, T014, T015 완료 후)
  - 테스트 파일: `tests/e2e/auth.spec.ts`, `inquiry.spec.ts`, `customer.spec.ts`, `file-share.spec.ts`, `responsive.spec.ts`, `playwright.config.ts`
  - 검증 대상: `SC-001`, `SC-003`, `SC-005`, `SC-006`, `SC-007`, `SC-008`, `SC-009`, `SC-010`, `SC-012`
  - 상세: 실제 사용자 흐름과 390px 모바일·키보드 탐색을 검증한다.
  - 완료 기준: Chromium 기준 핵심 E2E가 격리된 데이터로 통과한다.

- [ ] **T018** — 애플리케이션 CI 구성 (T016, T017 완료 후)
  - 구현 파일: `.github/workflows/app-ci.yml`
  - 검증 대상: `SC-013`
  - 상세: PostgreSQL service와 함께 lint, typecheck, unit/integration, build, E2E를 PR에서 실행한다.
  - 완료 기준: GitHub PR에서 모든 job이 성공한다.

- [ ] **T019** — staging 외부 연동·보안 수동 검증 (T010, T013, T018 완료 후)
  - 관련 문서: `.Codex/infra.md`, `docs/specs/v1.0.0/CHANGES.md`
  - 검증 대상: `SC-007`~`SC-009`, `NFR-001`~`NFR-004`
  - 상세: 실제 S3·Resend·DB로 업로드, 만료 링크, 교차 tenant, 발송 성공/실패와 secret 노출을 확인한다.
  - 완료 기준: 실제 staging 증거와 남은 운영 제약이 기록된다.

- [ ] **T020** — 설계·현재 상태·변경 이력 현행화 (T001~T019 완료 후)
  - 구현 파일: `spec.md`, `research.md`, `plan.md`, `tasks.md`, `.Codex/context.md`, `.Codex/infra.md`, `docs/specs/v1.0.0/CHANGES.md`, `DIFF-001-b2b-agency-mvp.md`
  - 관련 요구사항: 전체
  - 상세: 최종 구현과 문서의 파일·계약·테스트 차이를 0건으로 만들고 이력을 남긴다.
  - 완료 기준: 모든 FR/SC 추적, 최종 diff, context/infra 갱신과 의도치 않은 파일 없음이 확인된다.

## 구현 완료 기준

- [ ] 모든 태스크 체크박스가 완료 처리되었다.
- [ ] 모든 FR-XXX가 하나 이상의 SC-XXX와 구현 태스크에 연결됐다.
- [ ] lint와 typecheck가 성공한다.
- [ ] Vitest 단위·통합 테스트가 모두 통과한다.
- [ ] Playwright 핵심 E2E가 모두 통과한다.
- [ ] production build가 성공한다.
- [ ] tenant 교차 접근 테스트가 모든 업무 모델에서 통과한다.
- [ ] 실제 staging S3 업로드·다운로드와 Resend 발송이 검증됐다.
- [ ] `.Codex/context.md`, `.Codex/infra.md`, `CHANGES.md`, `DIFF-001-b2b-agency-mvp.md`가 최종 구현과 일치한다.
- [ ] `git status`에 의도치 않은 파일이 없다.
