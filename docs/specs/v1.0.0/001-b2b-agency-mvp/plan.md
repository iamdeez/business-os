# Plan: B2B Agency MVP

> Branch: `docs/SPEC-001-b2b-agency-mvp` | Date: 2026-06-28 | Spec: [spec.md](./spec.md) | Research: [research.md](./research.md)

## 사전 검증 (Constitution Gates)

- [x] **P-001 고객 데이터 격리**: 모든 업무 repository에 `tenantId`를 필수화하고 교차 tenant 통합 테스트를 설계했다.
- [x] **P-002 민감정보 보호**: 시크릿은 환경변수로, 공유 토큰은 hash로, S3는 private bucket으로 관리한다.
- [x] **P-003 모듈 재사용성**: 인증·tenant·파일·알림을 Core로, CRM·문의·대시보드를 도메인 모듈로 분리한다.
- [x] **P-004 검증 가능한 완료**: 모든 FR에 대응하는 SC와 자동화 테스트 유형을 정의했다.
- [x] **P-005 스펙 범위 준수**: 견적·계약·프로젝트·AI 등 후속 기능을 명시적으로 제외했다.
- [x] **P-006 외부 인터페이스 호환성**: 최초 공개 전 계약이며 입력 schema와 상태 enum을 계약 테스트로 고정한다.

**예외 사항**: 없음.

## 기술 컨텍스트

- **언어 / 런타임**: TypeScript 5.x / Node.js 24 LTS
- **웹 프레임워크**: Next.js 16.2 안정 계열 / React 19 / App Router / Turbopack
- **패키지 관리자**: pnpm
- **UI**: Tailwind CSS / shadcn/ui
- **인증**: Better Auth 1.6 안정 계열 / Prisma adapter / 이메일·비밀번호
- **데이터**: Supabase PostgreSQL / Prisma ORM 7
- **파일**: AWS SDK for JavaScript v3 / S3 private bucket / presigned URL
- **이메일**: Resend SDK
- **검증**: Zod / Vitest / Testing Library / Playwright
- **배포 후보**: Vercel. 실제 계정·환경 구성은 구현 시 확인한다.

## 사전 영향도 분석 결과

기존 애플리케이션 코드가 없으므로 아래 파일은 모두 신규 생성 대상이다. 자동 생성되는 lockfile과 Prisma migration SQL도 저장소에 포함한다.

### 영향 파일 목록

| 파일 | 변경 유형 | 영향 내용 |
|---|---|---|
| `package.json`, `pnpm-lock.yaml` | 신규 | 의존성·실행·검증 스크립트 |
| `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json` | 신규 | Next.js·TypeScript·lint·UI 설정 |
| `.env.example` | 신규 | 필요한 환경변수 이름과 설명의 기준 |
| `prisma/schema.prisma` | 신규 | 인증·tenant·CRM·문의·파일·공유·알림 모델 |
| `prisma/migrations/*/migration.sql` | 신규 | 최초 데이터베이스 schema |
| `prisma/seed.ts` | 신규 | 재실행 가능한 B2B 에이전시 데모 데이터 |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` | 신규 | 앱 루트와 기본 스타일 |
| `src/app/(auth)/login/page.tsx` | 신규 | 운영자 로그인 화면 |
| `src/app/(admin)/layout.tsx` | 신규 | 인증·tenant 보호 운영 레이아웃 |
| `src/app/(admin)/dashboard/page.tsx` | 신규 | 현황 집계와 최근 문의 |
| `src/app/(admin)/customers/page.tsx` | 신규 | 고객사 목록·검색·필터 |
| `src/app/(admin)/customers/new/page.tsx` | 신규 | 고객사 등록 |
| `src/app/(admin)/customers/[id]/page.tsx` | 신규 | 고객사 상세·수정·파일 |
| `src/app/(admin)/inquiries/page.tsx` | 신규 | 문의 인박스 |
| `src/app/(admin)/inquiries/[id]/page.tsx` | 신규 | 문의 상세·상태·고객 연결 |
| `src/app/(admin)/files/page.tsx` | 신규 | 파일 목록과 공유 링크 생성 |
| `src/app/inquiry/[tenantSlug]/page.tsx` | 신규 | tenant별 공개 문의 폼 |
| `src/app/share/[token]/page.tsx` | 신규 | 만료 가능한 고객 파일 공유 화면 |
| `src/app/api/auth/[...all]/route.ts` | 신규 | Better Auth handler |
| `src/app/api/files/presign/route.ts` | 신규 | 업로드 URL 발급 |
| `src/app/api/files/complete/route.ts` | 신규 | 업로드 메타데이터 확정 |
| `src/app/api/files/download/route.ts` | 신규 | 공유 링크 검증 후 다운로드 URL 발급 |
| `src/components/layout/admin-shell.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/header.tsx` | 신규 | 운영 화면 공통 레이아웃 |
| `src/components/ui/button.tsx`, `input.tsx`, `form.tsx`, `table.tsx`, `badge.tsx`, `card.tsx`, `dialog.tsx`, `textarea.tsx`, `select.tsx` | 신규 | MVP 공통 UI primitive |
| `src/lib/env.ts`, `db.ts`, `auth.ts`, `auth-client.ts`, `s3.ts`, `resend.ts` | 신규 | 환경 검증과 외부 클라이언트 |
| `src/modules/tenant/access.ts`, `repository.ts` | 신규 | 세션 membership과 tenant 경계 |
| `src/modules/crm/schema.ts`, `repository.ts`, `actions.ts` | 신규 | 고객사 validation·조회·명령 |
| `src/modules/inquiry/schema.ts`, `repository.ts`, `actions.ts` | 신규 | 공개 접수·인박스·상태·고객 연결 |
| `src/modules/file/schema.ts`, `repository.ts`, `service.ts` | 신규 | 업로드·메타데이터·공유 링크 |
| `src/modules/notification/repository.ts`, `service.ts`, `templates.tsx` | 신규 | 이메일 idempotency·발송·기록 |
| `src/modules/dashboard/queries.ts` | 신규 | tenant 범위 집계 |
| `src/proxy.ts` | 신규 | 운영 화면 인증 경계의 빠른 redirect |
| `tests/unit/*.test.ts` | 신규 | schema·상태·토큰·파일 정책 단위 테스트 |
| `tests/integration/*.test.ts` | 신규 | repository·tenant·idempotency·DB 통합 테스트 |
| `tests/e2e/*.spec.ts` | 신규 | 로그인·문의·CRM·파일 공유·반응형 E2E |
| `vitest.config.ts`, `playwright.config.ts` | 신규 | 테스트 실행 설정 |
| `.github/workflows/app-ci.yml` | 신규 | lint·typecheck·test·build·E2E CI |
| `.Codex/project.md` | 수정 | B2B 에이전시 확정과 SPEC-001 상태 갱신 |

## 핵심 설계

### 모듈 경계

```text
공개/운영 UI
  └─ Server Action 또는 Route Handler
       └─ 도메인 schema + service
            ├─ tenant-scoped repository ── Prisma ── PostgreSQL
            ├─ S3 adapter
            └─ Resend adapter
```

- UI는 Prisma·S3·Resend를 직접 호출하지 않는다.
- `src/modules/tenant`가 현재 사용자의 membership을 확인하고 `tenantId`를 반환한다.
- 운영 도메인 repository는 공개 메서드마다 `tenantId`를 첫 인자로 요구한다.
- 공개 문의는 `tenantSlug`를 서버에서 tenant로 해석한 뒤 접수한다.
- 외부 서비스 호출은 도메인 상태 저장 transaction과 분리한다.

### 라우팅·렌더링

- `(auth)`와 `(admin)` route group으로 로그인·운영 UI를 분리한다.
- 운영 조회 화면은 Server Component에서 tenant-scoped query를 실행한다.
- 폼 mutation은 Server Action을 기본으로 사용한다.
- presigned URL과 다운로드 redirect처럼 HTTP 응답 계약이 필요한 흐름만 Route Handler를 사용한다.
- 데이터는 동적 운영 정보이므로 명시적 cache를 사용하지 않는다. 이후 성능 요구가 생기면 tenant별 invalidation을 별도 spec으로 설계한다.

### 인증·권한

1. Better Auth가 이메일·비밀번호 로그인과 세션 쿠키를 관리한다.
2. 공개 회원가입은 비활성화한다.
3. bootstrap/seed가 데모 OWNER 계정을 생성한다.
4. `Membership(userId, tenantId, role)`이 업무 tenant 접근 권한을 결정한다.
5. `proxy.ts`는 비인증 운영 접근을 로그인으로 보내는 UX 경계다.
6. 실제 권한 판단은 각 Server Action·Route Handler에서 세션과 membership을 재검증한다.

### 공개 문의 흐름

```text
tenantSlug 공개 폼
  → 서버 validation + honeypot
  → tenantSlug 해석
  → (tenantId, requestId) unique 문의 저장
  → 성공 응답
  → NotificationLog PENDING 생성
  → Resend 운영자 알림
  → SENT 또는 FAILED 기록
```

- 중복 request는 기존 성공 결과를 반환한다.
- 알림 실패는 문의 저장을 취소하지 않는다.
- 문의 상태 변경은 `NEW → IN_PROGRESS → RESOLVED`와 이전 상태 복귀를 허용하되 enum 밖 값은 거부한다.

### 고객사 흐름

- `Customer`는 법인/사업체와 대표 담당자 연락처를 함께 보관하는 MVP aggregate다.
- 상태는 `ACTIVE`, `INACTIVE` 두 가지다.
- 목록은 기본 20건, 최대 100건의 cursor pagination을 사용한다.
- 문의 연결 시 tenant와 고객사의 tenant가 일치해야 한다.
- 이메일 중복은 자동 병합하지 않고 동일 tenant 후보를 운영자에게 표시한다.

### 파일 업로드·공유 흐름

```text
운영자 파일 선택
  → tenant/customer/파일 정책 검증
  → UUID uploadId와 S3 key 예약
  → 5분 presigned PUT 발급
  → 브라우저가 S3에 직접 업로드
  → complete endpoint가 객체 메타데이터 확인
  → FileItem 확정
  → 선택 FileItem으로 ShareLink 생성
  → token 원문 1회 반환 / hash만 저장
  → 고객이 공유 화면 접근
  → hash·만료·폐기·tenant·파일 연결 검증
  → 15분 presigned GET 발급
```

- S3 key 형식은 `{tenantId}/customers/{customerId}/{yyyy}/{mm}/{uploadId}`다.
- 업로드 URL 5분, 다운로드 URL 15분, 공유 링크 7일을 기본값으로 한다.
- 허용 유형은 PDF, 일반 이미지, Office 문서와 ZIP이며 파일당 최대 100MB다.
- 실행 파일, 스크립트, HTML과 MIME/확장자 불일치는 거부한다.

### 알림

- `NotificationLog`는 `type`, `recipient`, `templateKey`, `status`, `providerMessageId`, `idempotencyKey`, `errorCode`, timestamps를 기록한다.
- `(tenantId, idempotencyKey)` unique 제약과 Resend idempotency header를 함께 사용한다.
- MVP 자동 알림은 `inquiry_received`, `files_shared` 두 종류다.
- 실패는 `FAILED`로 남기며 자동 재시도 worker는 후속 spec으로 분리한다. 운영자는 실패 상태를 확인할 수 있다.

### 대시보드

- tenant 범위 내 `Customer` 수, `Inquiry(status=NEW)` 수, `FileItem` 수를 각각 집계한다.
- 최근 문의는 생성일 내림차순 최대 5건이다.
- 집계와 목록은 한 요청에서 무제한 row를 로드하지 않는다.

### 공유 상태·동시성

- 애플리케이션 전역 mutable cache를 두지 않는다.
- `Inquiry(tenantId, requestId)`, `FileItem(uploadId)`, `NotificationLog(tenantId, idempotencyKey)` unique 제약으로 중복 쓰기를 원자적으로 차단한다.
- 공유 링크 생성 transaction 안에서 파일 ID 전체를 tenant·customer 조건으로 다시 조회하고 개수가 일치할 때만 연결한다.
- 외부 네트워크 I/O는 DB transaction 밖에서 실행한다.

## 인터페이스 계약

### 공개 문의

- 입력: `tenantSlug`, `requestId`, 회사·담당자·연락·프로젝트 정보, 개인정보 처리 동의, honeypot.
- 성공: 접수 식별자와 성공 상태. 같은 `requestId` 재요청은 같은 접수 식별자를 반환한다.
- 실패: field별 validation 오류, 존재하지 않는 tenant, 서버 오류를 구분하되 내부 식별자와 stack은 노출하지 않는다.

### 운영 mutation

- 모든 Action은 서버 세션에서 `tenantId`를 해석한다. 클라이언트가 보낸 `tenantId`는 권한 근거로 사용하지 않는다.
- 존재하지 않거나 다른 tenant의 ID는 모두 `NOT_FOUND`로 처리하여 객체 존재 여부를 노출하지 않는다.
- 상태 enum과 페이지 크기는 서버 schema가 검증한다.

### 파일

- presign 입력: `customerId`, 표시 파일명, MIME, byte size, `uploadId`.
- presign 출력: 제한 시간과 필요한 header를 포함한 upload URL.
- complete 입력: `uploadId`; S3 객체 확인 후 단일 `FileItem`을 반환한다.
- download 입력: 공유 token과 file ID; 유효할 때만 짧은 수명의 URL을 반환한다.

### 하위 호환성

- 이번 spec이 v1 계약의 기준선이다.
- 후속 변경은 기존 enum 값의 의미를 바꾸지 않고 필드를 선택적으로 추가한다.
- 필드 제거, 필수화, 상태 의미 변경은 major 변경 또는 마이그레이션 plan이 필요하다.

## 데이터 모델

| 모델 | 핵심 필드·제약 | 관계 |
|---|---|---|
| `Tenant` | `id`, unique `slug`, `name`, timestamps | Membership, Customer, Inquiry 등 소유 |
| `User` / Better Auth tables | Better Auth 생성 필드 | Membership 소유 |
| `Membership` | unique `(tenantId,userId)`, `role` | Tenant ↔ User |
| `Customer` | `tenantId`, `companyName`, `contactName`, `email`, `phone?`, `memo?`, `status` | Tenant 소유, Inquiry·FileItem 연결 |
| `Inquiry` | `tenantId`, optional `customerId`, `requestId`, 접수 snapshot, `status` | Tenant 소유, Customer 선택 연결 |
| `FileUpload` | unique `uploadId`, `tenantId`, `customerId`, `s3Key`, 정책 정보, `status` | 업로드 예약·확정 추적 |
| `FileItem` | `tenantId`, `customerId`, `uploadId`, `displayName`, `s3Key`, `size`, `mimeType` | Customer 소유, 공유 링크에 연결 |
| `ShareLink` | `tenantId`, `customerId`, unique `tokenHash`, `expiresAt`, `revokedAt?` | 다수 FileItem 연결 |
| `ShareLinkFile` | unique `(shareLinkId,fileItemId)` | ShareLink ↔ FileItem |
| `NotificationLog` | `tenantId`, unique idempotency key, template, recipient, status, provider 결과 | Inquiry/ShareLink 이벤트 추적 |

모든 tenant 소유 테이블은 `tenantId` 인덱스를 갖고, 목록 조건에 맞춰 `(tenantId, createdAt)`, `(tenantId, status)` 복합 인덱스를 추가한다.

## 환경·배포 설계

- `.env.example`은 `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL` 이름만 제공하고 실제 값은 포함하지 않는다.
- S3 bucket은 public access를 차단하고 애플리케이션 전용 최소 권한 IAM을 사용한다.
- Resend 발신 도메인은 배포 전 검증한다.
- 개발·CI·운영 DB를 분리하고 CI는 임시 PostgreSQL service를 사용한다.
- 배포 전 실제 계정·비용·백업·롤백·모니터링은 `.Codex/infra.md`에 검증 결과를 반영한다.

## 테스트 전략

| SC 식별자 | 테스트 유형 | 시나리오 요약 | 입력 | 기대 결과 |
|---|---|---|---|---|
| SC-001 | E2E + 통합 | 공개 문의 정상·중복 제출 | 유효 form, 동일 requestId 2회 | 성공 화면, DB 1건, 인박스 표시 |
| SC-002 | 단위 + E2E | 공개 문의 validation | 누락·잘못된 이메일·honeypot | DB 변화 없이 field 오류/거부 |
| SC-003 | E2E | 로그인·보호·로그아웃 | 유효/무효 계정, 비인증 URL | 성공/오류/redirect가 계약과 일치 |
| SC-004 | 통합 | tenant 교차 접근 차단 | tenant A 세션으로 tenant B ID 조회·변경 | 모든 경로 NOT_FOUND, 데이터 불변 |
| SC-005 | 단위 + 통합 + E2E | 고객 CRUD·검색·필터 | 고객 생성·수정·검색 조건 | tenant 내 정확한 결과 |
| SC-006 | 통합 + E2E | 문의 상태·고객 연결 | 허용/비허용 상태, 동일/다른 tenant 고객 | 허용만 반영, 교차 tenant 차단 |
| SC-007 | 단위 + 통합 | 파일 정책·완료 idempotency | 허용/금지 MIME, 크기 경계, 중복 complete | 정책에 맞는 승인/거부, FileItem 1건 |
| SC-008 | 통합 + E2E | 공유 링크 선택·만료·폐기 | 유효/만료/폐기 token | 선택 파일만 표시, 무효 token 거부 |
| SC-009 | 통합 | 알림 성공·실패·중복 | Resend mock 성공/실패, 동일 key | SENT/FAILED 기록, provider 호출 최대 1회 |
| SC-010 | 통합 + E2E | 대시보드 집계 | 고정 fixture | 카운트·최근순 결과 일치 |
| SC-011 | 통합 | seed 재실행 | seed 2회 | 기준 데이터 수와 식별자 동일 |
| SC-012 | Playwright | 모바일·키보드 핵심 흐름 | 390px/desktop, keyboard | 가로 스크롤 없이 흐름 완료 |
| SC-013 | CI | 품질 gate | 전체 저장소 | lint, typecheck, test, build, E2E 통과 |

## 기타 고려사항

- 공개 문의 rate limiting, 악성코드 검사와 알림 자동 재시도는 운영 공개 전 후속 hardening spec이 필요하다.
- 외부 서비스 계정이 준비되지 않으면 local fake adapter로 기능을 개발하되, 완료 판정에는 실제 staging 연동 검증이 필요하다.
- UI 텍스트는 개발자 용어 대신 고객 언어를 사용한다. 예: `Customer CRUD` 대신 `고객사 관리`, `FileItem` 대신 `전달 파일`.
- 구현 중 기술 버전이 바뀌면 lockfile의 실제 버전을 research와 plan에 반영한다.

