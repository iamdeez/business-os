# Project Context

> 현재 코드베이스의 사실을 기록한다. 미래 계획은 `.claude/idea.md` 또는 spec에 둔다.

## 1. 프로젝트 개요

- **프로젝트명**: Business OS (`kmong` 작업 폴더)
- **목적**: 반복적인 고객 관리·문의·파일·알림 업무를 통합하는 크몽 판매용 비즈니스 운영 자동화 솔루션
- **현재 버전**: v0.1.0 (B2B 에이전시 MVP)
- **현재 기술 스택**: Node.js 24, pnpm 11, Next.js 16.2(App Router), React 19, TypeScript 5.9(strict), Tailwind CSS 4, Vitest 4, Playwright 1.61
- **데이터·외부**: Prisma 7(+`@prisma/adapter-pg`), PostgreSQL(Supabase), Better Auth, AWS S3(presigned URL), Resend(이메일)

## 2. 프로젝트 구조

```text
kmong/
├── src/
│   ├── app/
│   │   ├── (auth)/login/            # 로그인 화면 (client signIn)
│   │   ├── (admin)/                 # 인증 가드 레이아웃 + 운영 화면
│   │   │   ├── dashboard/           # 집계·최근 문의
│   │   │   ├── customers/           # 목록·등록·상세(모달)·파일 매니저
│   │   │   ├── inquiries/           # 인박스·상세(모달)
│   │   │   └── files/               # tenant 전체 파일 목록
│   │   ├── inquiry/[tenantSlug]/    # 공개 문의 폼
│   │   ├── share/[token]/           # 공개 공유 다운로드 화면
│   │   └── api/
│   │       ├── auth/[...all]/       # Better Auth 핸들러
│   │       └── files/{presign,complete,download}/  # 파일 HTTP 계약
│   ├── modules/                     # 도메인 모듈 (schema·repository·service·actions)
│   │   ├── tenant/                  # access(requireTenantAccess·getTenantAccess)·repository
│   │   ├── crm/                     # 고객
│   │   ├── inquiry/                 # 문의
│   │   ├── file/                    # 업로드·공유 (+ upload-token)
│   │   ├── notification/            # 이메일(templates·service·repository)
│   │   └── dashboard/               # 집계 쿼리
│   ├── lib/                         # env·db·s3·resend·file-policy·share-token·auth(-client)·utils
│   ├── components/                  # ui/* · layout/*
│   └── test/empty-module.ts         # vitest server-only 스텁
├── e2e/                             # Playwright 스펙 + auth.setup + helpers
├── prisma/                          # schema·seed·migrations (migrate deploy)
├── .github/workflows/               # pr-policy.yml, app-ci.yml
└── .Codex/, .claude/                # 프로젝트 문서·기획
```

### 레이어 구조

```text
화면(Server/Client Component)  ←  인증 가드·데이터 조회·렌더
        ↓
도메인 모듈(modules/*)         ←  schema(Zod) · repository(Prisma) · service(오케스트레이션) · actions(Server Action)
        ↓
lib(외부 경계)                ←  db(PrismaPg) · s3 · resend · 순수 정책 모듈(file-policy·share-token)
```

- UI는 Prisma·S3·Resend를 직접 호출하지 않고 modules/lib 경계를 통한다.
- presigned URL·다운로드 redirect 등 HTTP 응답 계약은 Route Handler(`api/*`)로 처리한다.
- 순수 모듈(`file-policy`·`share-token`·notification `templates`)은 `server-only` 의존 없이 단위 테스트한다.

## 3. 이벤트 및 데이터 흐름

```text
[공개 문의 접수] /inquiry/{slug}
   → inquiry.submitInquiry (requestId 멱등)
   → notification.notifyInquiryReceived (OWNER 메일, 비차단)
   → 관리자 인박스(/inquiries) 상태 변경·고객 연결

[파일 업로드·공유] 고객 상세
   → POST /api/files/presign (정책 검증·S3 key 예약·5분 PUT)
   → 브라우저 S3 직접 PUT
   → POST /api/files/complete (S3 HeadObject 확인·FileItem 확정)
   → createShareAction (선택 파일 ShareLink·token 1회 노출)
   → notification.notifyFilesShared (고객 메일, 비차단)
   → 고객 /share/{token} → GET /api/files/download (15분 presigned GET, 302)

[현황] /dashboard → 고객·NEW 문의·파일 집계 + 최근 문의 5건
```

### 외부 시스템 연동

| 시스템 | 방식 | 담당 모듈 | 주의 |
|---|---|---|---|
| PostgreSQL(Supabase) | Prisma 7 + `@prisma/adapter-pg` | `lib/db`(pooler), `prisma.config`(DIRECT_URL) | 런타임 DATABASE_URL(pgbouncer), CLI/seed DIRECT_URL(세션) |
| AWS S3 | presigned PUT/GET | `lib/s3`, `modules/file/service` | 브라우저 직접 업로드 → 버킷 PUT CORS 필요 |
| Resend | SDK send + idempotencyKey | `modules/notification/service` | 이중 멱등(DB unique + provider header), 실패 비차단 |
| Better Auth | 이메일·비번, 공개 가입 차단 | `lib/auth`, `modules/tenant/access` | 세션 쿠키 race로 로그인 후 full navigation 사용 |

## 4. 도메인 모델

| 엔티티 | 설명 | 주요 관계 |
|---|---|---|
| `Tenant` | 고객사 단위(슬러그) | User(Membership)·Customer·Inquiry·File·ShareLink·NotificationLog 소유 |
| `User`/`Session`/`Account` | Better Auth 인증 | Membership으로 Tenant 연결 |
| `Membership` | tenant 소속·역할(OWNER/MEMBER) | unique(tenantId,userId) |
| `Customer` | 고객사 연락처·상태 | Inquiry·FileItem 연결 |
| `Inquiry` | 공개 문의(상태 NEW/IN_PROGRESS/RESOLVED) | unique(tenantId,requestId) 멱등, Customer 선택 연결 |
| `FileUpload`→`FileItem` | 업로드 예약(uploadId unique)→확정 파일 | Customer 소유, ShareLink 연결 |
| `ShareLink`/`ShareLinkFile` | tokenHash·만료·폐기 / 파일 연결 | 다운로드 검증 |
| `NotificationLog` | 발송 로그(PENDING/SENT/FAILED) | unique(tenantId,idempotencyKey) |

> tenant 소유 테이블은 `tenantId` 범위 조회로 교차 tenant 접근을 차단한다.

## 5. 도메인 용어 사전

| 용어 | 정의 | 사용 금지 동의어 |
|---|---|---|
| Business OS | 고객사의 반복 운영 업무를 통합·자동화하는 시스템 | 단순 홈페이지, 단순 챗봇 |
| tenant | 시스템을 독립적으로 사용하는 고객사 단위 | 고객 개인 |
| Core | 고객·업종에 공통으로 재사용하는 기반 기능 묶음 | 고객별 복제본 |
| 모듈 | CRM, 문의, 파일, 알림 등 조합 기능 단위 | 페이지 |

## 6. 알려진 제약 및 기술 부채

| 항목 | 내용 | 영향 범위 | 관련 spec |
|---|---|---|---|
| 통합 테스트 mock 차수 | service 테스트는 Prisma·S3·Resend mock. 실제 DB 트랜잭션·unique 동작은 CI E2E·라이브 배포로 간접 검증 | file·notification | SPEC-001/T016 |
| staging 검증 부분완 | Fly 배포 후 로그인·업로드→R2·다운로드 라이브 검증. **잔여**: 교차 tenant 격리·Resend 실발송·secret 감사 | 파일·알림 | SPEC-001/T019 |
| S3 CORS 의존 | 브라우저 직접 PUT은 버킷 PUT CORS 설정 필요. 미설정 시 업로드 실패(운영 R2 버킷은 적용 완료) | 파일 업로드 | SPEC-001/T012·T019 |
| Resend 도메인 미인증 | `motionbit.kr` DNS 인증 전이면 실발송 실패(로직·트리거는 테스트 커버) | 알림 | DEV-016/T019 |
| 알림 재시도 worker 부재 | FAILED 알림 자동 재시도 없음(운영자 확인만) | 알림 | SPEC-001/T013 |
| 단일 tenant 가정 | `requireTenantAccess`가 첫 소속 tenant 반환 | 멀티 tenant | SPEC-001/T004 |
| 버전 정책 미확정 | 공개 API·템플릿 호환성 정책 없음 | 외부 인터페이스 | 최초 구현 spec |

## 7. 갱신 이력

| 날짜 | commit | 갱신 내용 | 관련 spec |
|---|---|---|---|
| 2026-06-28 | `N/A` | 최초 작성 | — |
| 2026-06-28 | `PR #1` | GitHub·Slack·Codex 협업 흐름 구성 | PM-002 |
| 2026-06-28 | `DEV-001` | Next.js 애플리케이션과 품질 기반 구성 | SPEC-001/T001 |
| 2026-06-28 | `0783948` | T002~T018 구현 완료 반영(인증·CRM·문의·파일·알림·대시보드·테스트·CI). 구조·흐름·모델·제약 현행화 | SPEC-001/T020 |
| 2026-07-03 | `OPS-011~DEV-017` | Fly.io 배포·Prisma 마이그레이션 도입·Account unique·이메일 트리거 테스트·랜딩 페이지 반영. 마이그레이션/Account 부채 해소, staging 부분검증 | OPS-011·DEV-015·DEV-016·DEV-017 |
