# Changes: v1.0.0

## [001-b2b-agency-mvp] T001 완료

**변경 파일**:

- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`: Node.js 24·pnpm 11·Next.js 16.2 의존성과 품질 스크립트 구성
- `next.config.ts`, `tsconfig.json`, `next-env.d.ts`: Next.js·TypeScript strict 설정
- `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`: lint·Tailwind·smoke test 설정
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`: B2B 에이전시 MVP 기반 화면과 전역 스타일
- `src/app/page.test.tsx`: 기본 화면 접근성 이름과 핵심 문구 smoke test
- `.gitignore`: TypeScript 증분 빌드 산출물 제외
- `.Codex/context.md`, `.Codex/infra.md`, `.Codex/project.md`: 현재 기술 스택·실행 방법·진행 상태 반영
- `docs/specs/v1.0.0/001-b2b-agency-mvp/tasks.md`: T001 완료 처리

**검증 결과**:

- `pnpm lint`: 통과
- `pnpm typecheck`: 통과
- `pnpm test`: 1 file, 1 test 통과
- `pnpm build`: Next.js 16.2.9 production build 통과
- 브라우저: `/` HTTP 200, 390px 가로 overflow 없음, console error 0건

**후속 작업 시 주의사항**:

- 실행·검증은 `package.json`의 Node.js 24 이상 조건을 따른다.
- pnpm 공급망 보호 설정은 `sharp`, `unrs-resolver`의 build script만 허용한다.
- 현재 테스트는 기반 화면 smoke test뿐이며 도메인 테스트는 T016에서 확장한다.
- `DIFF-001-b2b-agency-mvp.md`는 전체 spec 구현이 확정되는 T020에서 생성한다.

---

## [001-b2b-agency-mvp] T002 완료

**변경 파일**:

- `.env.example`: 필요한 환경변수 이름과 설명 (실제 값 없음)
- `src/lib/env.ts`: zod로 서버 시작 시 환경변수 검증·단일 `env` 객체 export. `server-only` import로 클라이언트 bundle 차단
- `src/lib/s3.ts`: S3Client lazy 싱글턴, 파일 정책(허용 MIME·최대 크기·차단 확장자) 상수 정의
- `src/lib/resend.ts`: Resend 클라이언트 lazy 싱글턴
- `package.json`, `pnpm-lock.yaml`: `zod`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `resend`, `server-only` 추가

**검증 결과**:

- `pnpm typecheck`: 통과
- `pnpm lint`: 통과

**후속 작업 시 주의사항**:

- `env.ts`는 `server-only`로 보호되어 있으므로 Client Component에서 직접 import 시 빌드 오류가 발생한다. 클라이언트에 필요한 값은 `NEXT_PUBLIC_APP_URL`처럼 `NEXT_PUBLIC_` 접두사를 사용한다.
- 실제 외부 서비스 연결이 없는 상태에서는 서버 시작 시 환경변수 검증 오류가 발생한다. `.env`에 placeholder를 설정해두었으며 실제 값은 T003·T004 이후 채운다.

---

## [001-b2b-agency-mvp] T003 완료

**변경 파일**:

- `prisma/schema.prisma`: Tenant·User(Better Auth)·Session·Account·Verification·Membership·Customer·Inquiry·FileUpload·FileItem·ShareLink·ShareLinkFile·NotificationLog 모델 정의. tenant 소유 테이블에 복합 인덱스 포함
- `prisma.config.ts`: Prisma 7 방식으로 연결 설정 분리 (`defineConfig` 사용). `.env`에서 DATABASE_URL 로드
- `prisma/seed.ts`: 데모 tenant·OWNER 사용자·Membership을 고정 id로 upsert (재실행 안전)
- `src/lib/db.ts`: 개발 환경 hot-reload 대응 PrismaClient 싱글턴
- `package.json`: `db:generate`, `db:migrate`, `db:push`, `db:seed`, `db:studio` 스크립트 추가. `prisma.seed` 설정 추가
- `pnpm-workspace.yaml`: `@prisma/engines`, `prisma`, `esbuild` 빌드 스크립트 허용
- `pnpm-lock.yaml`: `prisma`, `@prisma/client`, `@prisma/config`, `tsx`, `dotenv` 추가

**검증 결과**:

- `pnpm db:generate`: Prisma Client (v7.8.0) 생성 성공
- `pnpm typecheck`: 통과
- `pnpm test`: 1 file, 1 test 통과

**후속 작업 시 주의사항**:

- Prisma 7은 `schema.prisma`의 `datasource.url`을 지원하지 않는다. 연결 URL은 `prisma.config.ts`에서만 관리한다.
- Prisma 7 런타임 PrismaClient는 `@prisma/adapter-pg` driver adapter가 필수다. `new PrismaClient()` 단독 사용 불가.
- `prisma.config.ts`의 `datasource.url`은 `DIRECT_URL`(port 5432, 세션 모드)을 사용한다. pgbouncer 트랜잭션 모드(port 6543)는 DDL을 지원하지 않는다.
- `src/lib/db.ts`는 `DATABASE_URL`(pooler)로 `pg.Pool`을 생성하고 `PrismaPg` adapter를 통해 PrismaClient에 전달한다.
- `prisma/seed.ts`는 `DIRECT_URL`(direct)로 연결한다. seed 실행 시 `.env`에 `DIRECT_URL`이 설정되어 있어야 한다.
- `prisma/seed.ts`의 User 비밀번호 해시는 T004(Better Auth) 구현 단계에서 채운다. 현재는 비밀번호 없이 사용자 레코드만 생성한다.

---

## [001-b2b-agency-mvp] T004 완료

**변경 파일**:

- `src/lib/auth.ts`: Better Auth 서버 설정. Prisma adapter, 이메일·비밀번호, 공개 가입 차단(`disableSignUp: true`)
- `src/lib/auth-client.ts`: Better Auth React 클라이언트. `signIn`, `signOut`, `useSession` export
- `src/app/api/auth/[...all]/route.ts`: `toNextJsHandler`로 Next.js GET/POST 라우터 연결
- `src/modules/tenant/access.ts`: `requireSession` + `requireTenantAccess` 서버 사이드 경계. 미인증·미소속 시 `/login` redirect
- `src/modules/tenant/repository.ts`: `getTenantBySlug` 데이터 접근 헬퍼
- `prisma/seed.ts`: `hashPassword` (better-auth/crypto)로 데모 OWNER 비밀번호 해시 후 Account 레코드 생성. Account 모델에 `@@unique([providerId, accountId])` 미존재로 `findFirst` + 조건부 `create` 패턴 사용
- `package.json`, `pnpm-lock.yaml`: `better-auth`, `@prisma/adapter-pg`, `pg`, `@types/pg` 추가

**검증 결과**:

- `pnpm typecheck` (tsc --noEmit): 통과

**후속 작업 시 주의사항**:

- `Account` 모델에 `@@unique([providerId, accountId])` 제약이 없다. Better Auth 런타임이 중복 insert를 시도할 경우 충돌 없이 복수 레코드가 생길 수 있다. T005 이후 로그인 플로우 검증 시 스키마에 `@@unique([providerId, accountId])`를 추가하는 것을 검토한다.
- `src/modules/tenant/access.ts`의 `requireTenantAccess`는 `membership.findFirst`로 첫 번째 소속 tenant를 반환한다. 향후 멀티 tenant 지원 시 tenant 선택 로직이 필요하다.

---

## [001-b2b-agency-mvp] T005 완료

**변경 파일**:

- `src/app/globals.css`: Business OS 디자인 토큰 적용 (Plus Jakarta Sans, Indigo→Purple 팔레트, `--surface`, `--primary` 등 CSS 변수). Tailwind v4 `@theme inline` 블록으로 유틸리티 클래스 등록
- `src/lib/utils.ts`: `cn()` — clsx + tailwind-merge 헬퍼
- `src/components/ui/button.tsx`: 그라데이션 primary / outline / ghost / destructive 변형. 44px 기본 높이
- `src/components/ui/input.tsx`: focus ring + border 전환. 44px 높이
- `src/components/ui/label.tsx`: Radix Label 래퍼
- `src/components/ui/badge.tsx`: default·active·inactive·warning·error·count 변형
- `src/components/layout/sidebar.tsx`: 240px 고정 사이드바. 6개 nav + 설정. 활성 항목 보라색 배경
- `src/components/layout/header.tsx`: 56px 헤더. 유저 아바타·이름·알림·로그아웃
- `src/components/layout/mobile-nav.tsx`: 모바일 하단 5탭 네비게이션
- `src/app/(auth)/login/page.tsx`: 좌측 브랜드(그라데이션) + 우측 이메일/패스워드 폼. signIn.email 연동
- `src/app/(admin)/layout.tsx`: `requireTenantAccess` 서버 가드 + Sidebar + Header + MobileNav 조합
- `src/app/(admin)/dashboard/page.tsx`: 빈 대시보드 shell (T014에서 완성)
- `src/app/page.tsx`: `/dashboard` redirect로 교체
- `src/app/page.test.tsx`: redirect 동작 반영으로 smoke test 갱신
- `package.json`, `pnpm-lock.yaml`: `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `@radix-ui/react-slot`, `@radix-ui/react-label` 추가

**검증 결과**:

- `tsc --noEmit`: 통과

**후속 작업 시 주의사항**:

- `globals.css`의 Google Fonts `@import`는 개발 환경에서 네트워크 요청을 유발한다. 프로덕션에서는 `next/font/google`으로 교체하거나 self-hosted 방식을 고려한다.
- `Header`의 로그아웃은 `signOut()` 후 `router.push("/login")`으로 처리한다. Better Auth 세션 쿠키 만료와 Next.js 라우터 사이의 타이밍 이슈가 발생하면 `window.location.href` 방식으로 교체한다.

---

## [001-b2b-agency-mvp] T006 + T007 완료

**변경 파일**:

- `src/modules/crm/schema.ts`: Zod v4 customerSchema (companyName, contactName, email, phone?, memo?, status)
- `src/modules/crm/repository.ts`: `listCustomers` (검색·필터·페이지네이션), `getCustomer`, `createCustomer`, `updateCustomer`
- `src/modules/crm/actions.ts`: `createCustomerAction` / `updateCustomerAction` — Server Action. Zod 검증 실패 시 redirect로 error 전달
- `src/app/(admin)/customers/page.tsx`: 검색·상태 필터·페이지네이션 포함 고객 목록 테이블
- `src/app/(admin)/customers/new/page.tsx`: 고객 등록 폼
- `src/app/(admin)/customers/[id]/page.tsx`: 고객 상세·수정 폼. 저장 성공 시 `?updated=1` 배너 표시

**검증 결과**:

- `tsc --noEmit`: 통과

**후속 작업 시 주의사항**:

- Zod v4에서 `error.errors` → `error.issues`로 변경됨. 다른 Server Action 작성 시 동일하게 적용한다.
- Server Action 오류 전달을 `redirect + searchParams` 방식으로 구현했다. React 19의 `useActionState`로 교체하면 클라이언트 상태를 더 세밀하게 제어할 수 있으나 T007 범위 외다.

---

## [001-b2b-agency-mvp] T010 완료

**변경 파일**:

- `src/lib/file-policy.ts` (신규): 파일 정책(허용 MIME·차단 확장자·최대 크기)·`validateFilePolicy`·`buildS3Key`를 server-only 의존 없는 순수 모듈로 분리. 단위 테스트 가능
- `src/lib/s3.ts`: 인라인 `FILE_POLICY` 정의를 제거하고 `file-policy.ts`에서 re-export (단일 소스 유지)
- `src/modules/file/schema.ts` (신규): presign/complete 입력 Zod 스키마. `uploadId`는 멱등 토큰으로 검증
- `src/modules/file/repository.ts` (신규): `FileUpload`·`FileItem` 데이터 접근, `confirmUpload` transaction
- `src/modules/file/service.ts` (신규): 고객사 tenant 검증 → 정책 검증 → S3 key 예약 → presigned PUT(5분) 발급 / complete 시 S3 HeadObject 확인 후 FileItem 확정. uploadId·FileItem 멱등성과 P2002 동시성 처리
- `src/app/api/files/presign/route.ts` (신규): POST presign. 401/400/404/409 분기
- `src/app/api/files/complete/route.ts` (신규): POST complete. 401/400/404/422 분기
- `src/modules/tenant/access.ts`: Route Handler용 비-redirect `getTenantAccess()` 추가 (미인증 시 null 반환 → API 401 JSON)
- `src/lib/file-policy.test.ts` (신규): 정책·확장자·S3 key 단위 테스트 11건

**검증 결과**:

- `pnpm typecheck`: 통과
- `pnpm lint`: 통과
- `pnpm test`: 2 files, 12 tests 통과 (신규 11 + 기존 1)
- `pnpm build`: production build 통과 (`/api/files/presign`, `/api/files/complete` dynamic 라우트 생성)

**후속 작업 시 주의사항**:

- **통합 테스트 위임**: 중복(uploadId/FileItem 멱등)·교차 tenant 거부·S3 확인 흐름의 통합 테스트는 본 차수에 미포함. vitest에 `server-only` alias와 PostgreSQL test DB·S3 mock 인프라가 필요하며 이는 T016 범위다. 현재 단위 테스트는 순수 정책 모듈(`file-policy.ts`)만 커버한다.
- **uploadId 형식**: `crypto.randomUUID()`가 비-secure context(HTTP+비localhost)에서 실패하므로(typescript 규칙), 백엔드는 엄격한 RFC UUID 대신 `^[A-Za-z0-9_-]{16,64}$` 토큰으로 검증한다. T012 UI에서 uploadId 생성 시 이 제약을 따른다.
- **파일 정책 위치 이동**: `FILE_POLICY`가 `s3.ts` → `file-policy.ts`로 이동했다. 정책 참조는 `@/lib/file-policy` 또는 `@/lib/s3`(re-export) 어느 쪽도 가능하나, 검증 로직 추가는 순수 모듈인 `file-policy.ts`에 둔다.
- **complete 응답 422**: S3 객체 미존재·크기 불일치는 422로 응답하고 `FileUpload.status`를 FAILED로 전이한다. T012에서 재시도 UX를 설계할 때 이 상태를 참조한다.
- T011(공유 링크·다운로드)은 본 차수의 `FileItem`을 입력으로 사용한다.

---

## [001-b2b-agency-mvp] T011 완료

**변경 파일**:

- `src/lib/share-token.ts` (신규): 공유 토큰 생성(`randomBytes` base64url)·sha256 해시. server-only 의존 없는 순수 모듈
- `src/modules/file/repository.ts`: `listFileItems`, `createShareLink`(transaction 내 fileItemId tenant·customer 재조회·개수 일치 검증), `findShareLinkByTokenHash`, `revokeShareLink`, `listShareLinks` 추가
- `src/modules/file/service.ts`: `createShare`(7일 만료, token 원문 1회 반환/hash 저장), `revokeShare`, `resolveShare`(hash·폐기·만료 검증), `getDownloadUrl`(15분 presigned GET, Content-Disposition attachment) 추가
- `src/app/api/files/download/route.ts` (신규): 공개 GET. token+fileItemId 검증 후 presigned GET 으로 302 redirect. 410(만료·폐기)/404 분기
- `src/app/share/[token]/page.tsx` (신규): 공개 공유 화면. 유효 시 파일 목록·다운로드, 만료/폐기/미존재 안내
- `src/lib/share-token.test.ts` (신규): 토큰 형식·해시 결정성 단위 테스트 5건

**검증 결과**:

- `pnpm typecheck`: 통과
- `pnpm lint`: 통과
- `pnpm test`: 3 files, 17 tests 통과 (신규 5 + 기존 12)
- `pnpm build`: production build 통과 (`/api/files/download`, `/share/[token]` 생성)

**후속 작업 시 주의사항**:

- **통합 테스트 위임**: 유효·만료·폐기·교차 tenant·파일 미연결 검증의 통합 테스트는 DB·S3 mock 인프라가 필요하여 T016 범위다. 본 차수 단위 테스트는 순수 토큰 모듈(`share-token.ts`)만 커버한다.
- **공유 링크 생성·폐기 UI(운영자)** 는 T012 범위다. T011은 백엔드 계약(`createShare`/`revokeShare`/`resolveShare`/`getDownloadUrl`) + 공개 다운로드 화면까지다.
- **다운로드는 302 redirect**: `/api/files/download`는 presigned S3 URL 로 redirect 하므로 토큰이 query string 에 노출된다. MVP 공유 링크 수준에서 허용하며, 추가 보안이 필요하면 POST 본문 방식으로 전환한다.
- **기본 만료값**: 공유 링크 7일(`SHARE_LINK_TTL_DAYS`), 다운로드 URL 15분(`DOWNLOAD_URL_TTL`). T012 에서 만료 기간 선택 UI 추가 시 이 상수를 파라미터화한다.

---

## [001-b2b-agency-mvp] T012 완료

**변경 파일**:

- `src/modules/file/upload-token.ts` (신규): 클라이언트 uploadId 생성. `crypto.randomUUID()` 미사용(비-secure context 대응), 백엔드 정규식 충족
- `src/modules/file/actions.ts` (신규): `createShareAction`(선택 파일 → 공유 token 1회 표시), `revokeShareAction` 서버 액션
- `src/app/(admin)/customers/[id]/file-manager.tsx` (신규, 클라이언트): 파일 업로드(presign→S3 PUT→complete) + 진행 상태, 파일 선택·공유 링크 생성, 생성된 URL 복사, 공유 링크 목록·폐기
- `src/app/(admin)/customers/[id]/page.tsx`: `listFileItems`·`listShareLinks` 조회 후 `FileManager` 렌더. "now" 의존 매핑은 컴포넌트 밖 헬퍼로 분리(react-hooks/purity)
- `src/app/(admin)/files/page.tsx` (신규): tenant 전체 파일 목록 + 고객 연결
- `src/modules/file/repository.ts`: `listTenantFiles`(고객 정보 포함) 추가

**검증 결과**:

- `pnpm typecheck`: 통과
- `pnpm lint`: 통과
- `pnpm test`: 3 files, 17 tests 통과
- `pnpm build`: production build 통과 (`/files`, `/customers/[id]` 갱신)

**후속 작업 시 주의사항**:

- **S3 CORS 필요**: 브라우저가 presigned PUT 으로 S3 에 직접 업로드하므로 S3 버킷에 운영 도메인 출처의 PUT CORS 설정이 필요하다. 미설정 시 업로드가 CORS 오류로 실패한다 (T019 staging 검증 항목).
- **react-hooks/purity**: 서버 컴포넌트 렌더 본문에서 `Date.now()`/`Math.random()` 직접 호출은 lint 에러다. "현재 시각" 의존 로직은 컴포넌트 밖 모듈 함수로 분리한다.
- **공유 token 1회 노출**: `createShareAction` 은 token 을 `?share=` 로 전달해 화면에 1회 표시한다. 새로고침·재방문 시 재노출되지 않는다(재생성 필요).
- E2E(업로드~다운로드)는 T017, 실제 S3·Resend staging 검증은 T019 범위다. DEV-005 백엔드·UI 구현은 본 차수로 완료.

---

## [001-b2b-agency-mvp] T013 완료

**변경 파일**:

- `src/modules/notification/templates.tsx` (신규): `inquiry_received`·`files_shared` 두 템플릿(subject+html), `TEMPLATE_KEY` 버전, `escapeHtml`(XSS 방지). server-only 의존 없는 순수 모듈
- `src/modules/notification/repository.ts` (신규): NotificationLog CRUD(`findByIdempotencyKey`, `createPending`, `markSent`, `markFailed`, `listNotifications`), `getTenantOwnerEmail`(OWNER 수신자)
- `src/modules/notification/service.ts` (신규): 이중 멱등 발송(`(tenantId,idempotencyKey)` unique + Resend idempotencyKey 헤더), PENDING→SENT/FAILED, `notifyInquiryReceived`/`notifyFilesShared`
- `src/modules/inquiry/actions.ts`: 신규 문의 접수 시 OWNER 에게 알림 트리거(비차단)
- `src/modules/file/actions.ts`: 공유 링크 생성 시 고객에게 알림 트리거(비차단)
- `src/modules/notification/templates.test.ts` (신규): 템플릿·이스케이프 단위 테스트 7건

**검증 결과**:

- `pnpm typecheck`: 통과
- `pnpm lint`: 통과
- `pnpm test`: 4 files, 24 tests 통과 (신규 7 + 기존 17)
- `pnpm build`: production build 통과

**후속 작업 시 주의사항**:

- **비차단 알림**: 알림 발송 실패는 문의 접수·공유 생성을 막지 않는다. 실패는 `NotificationLog.status=FAILED`로 남으며 자동 재시도 worker 는 후속 spec 이다(plan 명시). 운영자 확인 화면은 미구현(필요 시 별도 태스크).
- **이중 멱등**: `idempotencyKey`는 `inquiry_received:{inquiryId}` / `files_shared:{shareLinkId}` 규칙. DB unique 와 Resend 헤더 양쪽에서 중복 발송을 차단한다.
- **수신자**: `inquiry_received`는 tenant OWNER(`getTenantOwnerEmail`), `files_shared`는 고객 이메일. OWNER 부재 시 `NO_RECIPIENT`로 무시된다.
- **provider 성공·실패·중복 mock 통합 테스트**: Resend mock + DB 인프라 필요로 T016 위임. 본 차수는 순수 템플릿 단위 테스트만 포함.
- **XSS**: 공개 문의의 사용자 입력이 메일 본문에 들어가므로 `escapeHtml` 필수. 신규 템플릿 작성 시 동일 적용.

---

## [001-b2b-agency-mvp] T014 완료

**변경 파일**:

- `src/modules/dashboard/queries.ts` (신규): `getDashboardData(tenantId)` — Customer·Inquiry(NEW)·FileItem count 병렬 집계 + 최근 문의 5건(생성일 desc, select 제한)
- `src/app/(admin)/dashboard/page.tsx`: 빈 셸을 통계 카드 3개(고객사·신규 문의·파일, 각 해당 목록 링크) + 최근 문의 리스트로 교체

**검증 결과**:

- `pnpm typecheck`: 통과
- `pnpm lint`: 통과
- `pnpm test`: 4 files, 24 tests 통과
- `pnpm build`: production build 통과

**후속 작업 시 주의사항**:

- **무제한 로드 금지**: 집계는 `count`, 최근 문의는 `take: 5` + `select` 로 제한한다(plan NFR). 위젯 추가 시 동일 원칙 유지.
- **최근 문의 링크**: `/inquiries?selected={id}` 로 인박스 모달을 연다(T009 모달 패턴 재사용).
- fixture 집계 일치 검증은 DB 필요로 T016 위임.

---

## [001-b2b-agency-mvp] T015 완료

**변경 파일**:

- `prisma/seed.ts`: 기존 tenant·OWNER·고객 8·문의 7 에 더해 파일 metadata 4건(`FileUpload` COMPLETED + `FileItem`), 데모 공유 링크 1건(`ShareLink` + `ShareLinkFile` 2)을 고정 식별자로 upsert. `../src/lib/share-token`의 `hashShareToken` 재사용

**검증 결과**:

- `pnpm typecheck`: 통과
- `pnpm lint`: 통과
- `pnpm test`: 4 files, 24 tests 통과
- (DB 실행 검증은 미수행 — 로컬/staging DATABASE_URL 환경 필요, T019)

**후속 작업 시 주의사항**:

- **metadata-only 파일**: 데모 `FileItem` 의 s3Key 는 규칙에 맞지만 실제 S3 객체는 없다. 데모에서 다운로드 시 S3 404 가 정상이다. 실제 객체가 필요하면 staging 에서 업로드한다.
- **데모 공유 토큰 공개**: `DEMO_SHARE_TOKEN = "demo_share_techstart_0001"` → `/share/demo_share_techstart_0001` 로 공유 흐름을 시연할 수 있다. 운영 데이터에는 사용하지 않는다.
- **idempotency**: 모든 신규 레코드는 고정 id + `update:{}` upsert 라 2회 실행 시 수·로그인 동일. 실제 2회 실행 동일 확인은 DB 연결 후 수행(T019).
- **로그인**: `owner@demo-agency.com` / `demo1234!` (tenant `demo-agency`).

---

## [001-b2b-agency-mvp] T016 (mock 차수) 완료

**변경 파일**:

- `vitest.config.ts`: `server-only` → 빈 모듈 alias 추가 (service/repository 를 테스트에서 import 가능하게)
- `src/test/empty-module.ts` (신규): server-only 스텁
- `src/modules/file/service.test.ts` (신규): reserveUpload/completeUpload/createShare/resolveShare/getDownloadUrl 오케스트레이션 — repository·S3·crm·presigner mock 으로 멱등(P2002)·정책·교차 tenant 가드·만료/폐기·크기 불일치 분기 검증
- `src/modules/notification/service.test.ts` (신규): 발송 성공/실패(provider error/throw)/중복(dedup)/NO_RECIPIENT/P2002 — repository·Resend mock

**검증 결과**:

- `pnpm typecheck`: 통과
- `pnpm lint`: 통과
- `pnpm test`: 6 files, 53 tests 통과 (순수 단위 24 + service mock 29)

**후속 작업 시 주의사항**:

- **mock 차수 한정**: 본 차수는 service 오케스트레이션 로직을 mock(Prisma·S3·Resend)으로 검증한다. 실제 PostgreSQL 통합(트랜잭션 내 tenant·customer 재조회, unique 제약 동작 등)과 Resend 실제 발송은 검증하지 않는다.
- **실제 DB 통합·CI**: `SC-XXX`의 "PostgreSQL test DB 통과"는 T018(CI에 PostgreSQL service + 마이그레이션)과 T019(staging) 에서 연결한다. test DATABASE_URL 환경이 필요하다.
- **mock 패턴**: service 테스트는 `vi.mock("./repository")` + `@aws-sdk/s3-request-presigner`·`@/lib/s3`·`@/lib/resend` mock 으로 외부 의존을 격리한다. 신규 service 로직 추가 시 동일 패턴 사용.
- `server-only` alias 로 이제 모든 server 모듈을 테스트에서 import 할 수 있다.

---

## [001-b2b-agency-mvp] T017 (작성 차수) 완료

**변경 파일**:

- `playwright.config.ts` (신규): chromium, `webServer`(`pnpm start`), `baseURL`, `testDir: e2e/`, CI retry/reporter
- `e2e/helpers.ts` (신규): 데모 OWNER 로그인 헬퍼, 데모 상수
- `e2e/auth.spec.ts` (신규): 로그인 성공/실패/미인증 redirect (SC-001)
- `e2e/inquiry.spec.ts` (신규): 공개 문의 접수 → 인박스 노출, 미존재 slug 거부 (SC-003)
- `e2e/customer.spec.ts` (신규): 고객 생성·검색, 필수값 누락 (SC-005)
- `e2e/responsive.spec.ts` (신규): 390px 대시보드·고객 가로 overflow 없음 (SC-012)
- `e2e/file-share.spec.ts` (신규): 업로드~공유 — `E2E_S3_READY` 가드(staging 전용)
- `package.json`: `@playwright/test` devDependency + `test:e2e` 스크립트
- `.gitignore`: playwright 산출물 제외

**검증 결과**:

- `pnpm typecheck`: 통과 (e2e 포함)
- `pnpm lint`: 통과
- `pnpm test`: 6 files, 53 통과 (vitest 는 `src/**` 만, e2e 미포함)
- **Chromium 실제 실행은 미수행** — 브라우저 + 실행 앱 + PostgreSQL 필요. T018 CI 에서 검증.

**후속 작업 시 주의사항**:

- **실행 검증 = T018 CI**: 본 차수는 E2E 스펙·config 작성까지다. 실제 Chromium 실행·통과 검증은 T018 CI(PostgreSQL service + 마이그레이션/seed + `playwright install` + `pnpm test:e2e`)에서 이뤄진다. CI 미구성 상태에서 main 의 E2E 는 자동 실행되지 않는다.
- **file-share E2E**: 브라우저 직접 S3 PUT 은 실제 S3 + CORS 필요로 `test.skip(!E2E_S3_READY)` 가드. staging(T019)에서 `E2E_S3_READY=1` 로 실행.
- **seed 의존**: 인증·인박스 E2E 는 데모 seed(`owner@demo-agency.com`, slug `demo-agency`)에 의존한다. CI 는 E2E 전에 `db:seed` 를 실행해야 한다.
- **테스트 위치**: E2E 는 `e2e/*.spec.ts`(Playwright), 단위·service 는 `src/**/*.test.ts`(vitest). 분리 유지.

---

## [001-b2b-agency-mvp] T018 완료

**변경 파일**:

- `.github/workflows/app-ci.yml` (신규): PR/Push(main) 트리거. `postgres:16` service + 더미 외부 env. pnpm 11.7/Node 24 → `install --frozen-lockfile` → `db:generate` → `db:push` → `db:seed` → `lint` → `typecheck` → `test`(vitest) → `build` → `playwright install chromium` → `test:e2e`

**검증 결과**:

- `pnpm lint`: 통과
- (CI job 자체의 실제 통과는 본 PR 의 App CI run 으로 검증된다 — 이 워크플로가 PR 에서 실행됨)

**후속 작업 시 주의사항**:

- **마이그레이션 부재**: `prisma/migrations/` 가 없어 CI 는 `db:push` 로 스키마를 동기화한다. 향후 마이그레이션 도입 시 `prisma migrate deploy` 로 전환한다.
- **이 PR 이 검증 환경**: app-ci.yml 이 본 PR 에서 실행되어 그동안 작성만 했던 T016 service 테스트·T017 E2E 가 실제 PostgreSQL·Chromium 으로 통과하는지 처음 검증된다. 실패 시 반복 수정한다.
- **file-share E2E**: `E2E_S3_READY` 미설정으로 CI 에서 skip. 실제 S3 검증은 T019 staging.
- **secret 미사용**: CI 외부 env 는 더미. 실제 staging 검증(T019)은 별도 secret 환경에서 수행.

---

## [001-b2b-agency-mvp] T020 (현행화 차수) 완료

**변경 파일**:

- `.Codex/context.md`: 구현 이전 상태 기술을 현재 코드 사실로 전면 현행화 (모듈 구조·레이어·데이터 흐름·도메인 모델·외부 연동·알려진 제약·이력)
- `.Codex/infra.md`: Supabase·S3·Resend·Better Auth 실연동, `app-ci.yml`(PostgreSQL service + E2E), db push 방식, S3 CORS·staging 미검증 제약 현행화
- `docs/specs/.../tasks.md`: T016·T017 [x], T018 [x], T020 [~] 및 구현 완료 기준 갱신 (T019 staging 만 잔여)

**검증 결과**:

- `pnpm typecheck`·`pnpm lint`·`pnpm test`(53)·`pnpm build`: 통과 (T018 이후 변경 없음 — 문서·E2E 안정화만)
- App CI(`app-ci.yml`): green (lint·typecheck·test·build·Chromium E2E)

**현재 MVP 상태**:

- 핵심 흐름 완성: 공개 문의 접수 → CRM → 파일 업로드/공유 → 이메일 알림 → 대시보드. 데모 seed·테스트·CI 포함.
- **남은 작업 = T019(staging 외부 연동 수동 검증)**: 실제 S3 업로드/만료 링크·Resend 발송·교차 tenant·secret 노출 확인. 사용자 자격증명·배포 환경 필요로 별도 수행.

**후속 작업 시 주의사항**:

- **DIFF-001 미생성**: 본 spec 은 그린필드 전체 구현이라 spec 단위 diff 가 사실상 전체 코드베이스다. 전체 덤프 대신 단계별 변경을 본 `CHANGES.md`(T001~T020)와 git 히스토리(PR #1~#14)로 추적한다.
- T019 완료 시 `.Codex/infra.md` §8 staging 제약과 본 CHANGES 에 실제 검증 증거·잔여 제약을 추가한다.

---

## [001-b2b-agency-mvp] T019 준비 산출물

> T019 자체(실제 staging 검증)는 자격증명·배포 환경 보유 운영자가 수행한다. 본 차수는 **실행 가능하게 만드는 준비 산출물**만 제공한다.

**변경 파일**:

- `docs/specs/.../contracts/s3-cors.json` (신규): 브라우저 직접 업로드용 S3 버킷 PUT/GET CORS 설정 (`AllowedOrigins` 치환 필요)
- `docs/specs/.../T019-staging-verification.md` (신규): SC-007~009·NFR-001~004 단계별 수동 검증 런북 + `E2E_S3_READY=1` 실행법 + 결과 기록 템플릿
- `tasks.md`·`.Codex/infra.md`: 런북·CORS 산출물 참조 추가

**후속 작업 시 주의사항**:

- **실행·증거 = 운영자**: 런북 §7 결과 템플릿을 채워 `.Codex/infra.md` §8 와 본 CHANGES 에 반영하면 T019 가 종료된다.
- **S3 CORS 미적용 시 업로드 실패**: `s3-cors.json` 적용이 staging 업로드의 전제 조건이다.
- 단일 tenant seed 라 교차 tenant(NFR-001) 검증에는 두 번째 tenant 를 별도 생성해야 한다.
