# Research: B2B Agency MVP

> Date: 2026-06-28 | Spec: [spec.md](./spec.md)

## 기존 코드베이스 분석

### 현재 상태

- 애플리케이션 소스, 패키지 설정, 데이터베이스 스키마와 배포 설정은 존재하지 않는다.
- 현재 저장소에는 제품 기획 `.claude/idea.md`, 프로젝트 운영 문서와 GitHub 협업 설정만 존재한다.
- 따라서 기존 클래스·모듈 계층, 호출 측, 하위 호환 대상과 순환 의존은 없다.
- 이번 spec은 신규 애플리케이션의 기준 구조와 외부 인터페이스를 처음 정의한다.

### 클래스·모듈 계층 구조

```text
현재: 해당 없음

계획:
App Router 화면·Route Handler
        ↓
도메인별 Server Action / Query
        ↓
tenant 접근 경계 + Repository
        ↓
Prisma ORM / 외부 어댑터(S3, Resend)
```

- 도메인 모듈은 상속보다 함수와 명시적 의존성 조합을 사용한다.
- `src/lib`의 외부 클라이언트는 도메인 규칙을 포함하지 않는다.
- 모든 운영 데이터 repository는 `tenantId`를 필수 입력으로 받는다.

### 영향 범위 분석

| 영역 | 현재 파일 | 결과 |
|---|---|---|
| 애플리케이션 | 없음 | Next.js 애플리케이션 전체 신규 생성 |
| 데이터 | 없음 | Prisma 스키마·마이그레이션·시드 신규 생성 |
| 인증 | 없음 | Better Auth 기반 이메일·비밀번호 인증 신규 생성 |
| 파일 | 없음 | S3 presigned upload/download 어댑터 신규 생성 |
| 알림 | 없음 | Resend 어댑터와 발송 로그 신규 생성 |
| 테스트 | 없음 | Vitest·Playwright·CI 신규 생성 |
| 문서 | `.Codex/project.md` | B2B 에이전시 결정과 SPEC-001 상태 반영 |

## 기술 선택 조사

### 런타임·웹 프레임워크

- **채택**: Node.js 24 LTS, TypeScript, Next.js 16.2 안정 계열, App Router.
- **근거**: Next.js 16은 Node.js 20.9 이상과 TypeScript 5.1 이상을 요구하며 `proxy.ts`, Turbopack 안정화와 명시적 캐시 모델을 제공한다. 2026-03 공개된 16.2가 현재 안정 릴리즈다. [Next.js 16](https://nextjs.org/blog/next-16), [Next.js 16.2](https://nextjs.org/blog/next-16-2), [설치 문서](https://nextjs.org/docs/app/getting-started/installation)
- **기획 초안과 차이**: `.claude/idea.md`의 Next.js 15는 작성 당시 초안이다. 신규 구축 시점의 안정 메이저인 16으로 갱신한다.
- **대안**: Next.js 15 고정은 기존 코드 호환 이점이 없고 신규 프로젝트에 곧바로 업그레이드 부채를 만든다.

### 인증

- **채택**: Better Auth 1.6 안정 계열 + Prisma adapter, 이메일·비밀번호, 공개 회원가입 비활성화.
- **근거**: Auth.js 프로젝트는 Better Auth에 편입됐으며 Better Auth는 이메일·비밀번호 인증, 세션, 비밀번호 해시와 Prisma adapter를 공식 지원한다. [Auth.js 현황](https://authjs.dev/), [이메일·비밀번호](https://better-auth.com/docs/authentication/email-password), [Prisma adapter](https://better-auth.com/docs/adapters/prisma)
- **대안**: Auth.js Credentials provider는 신규 사용자·비밀번호 생명주기를 별도 구현해야 한다. Supabase Auth는 RLS와 결합하기 쉽지만 이번 MVP의 ORM·도메인 repository 경계를 두 인증 체계와 혼합하게 된다.
- **보안 결정**: 공개 가입을 끄고 데모 운영자는 seed/bootstrap 절차로 만든다. 비밀번호 재설정·운영자 초대는 후속 spec이다.

### 데이터베이스·ORM·tenant 경계

- **채택**: Supabase PostgreSQL + Prisma ORM 7, 서버 전용 DB 접근.
- **근거**: Prisma는 Next.js·Vercel 배포와 PostgreSQL driver adapter를 공식 안내하며 Prisma 7 문서 기준 Node.js 20.19/22.12/24 이상을 지원한다. [Prisma Next.js 가이드](https://www.prisma.io/docs/guides/frameworks/nextjs)
- **tenant 전략**: 모든 업무 테이블에 `tenantId`를 두고, 도메인 repository가 tenant 조건을 강제한다. 브라우저에서 Supabase Data API를 직접 호출하지 않는다. 노출 schema를 사용할 경우 RLS를 활성화해야 한다는 Supabase 지침을 따른다. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- **대안**: 브라우저 직접 DB 접근 + RLS는 빠르지만, Server Action·Prisma와 데이터 접근 규칙이 이중화된다. MVP는 서버 전용 단일 경계를 우선한다.

### 파일 저장

- **채택**: AWS S3 private bucket + 짧은 수명의 presigned PUT/GET URL.
- **근거**: S3 presigned URL은 클라이언트에 AWS 자격 증명을 제공하지 않고 제한된 업로드·다운로드 권한을 위임한다. 동일 key 업로드는 기존 객체를 덮어쓰므로 충돌 없는 UUID key가 필요하다. [AWS S3 presigned upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- **대안**: 서버 중계 업로드는 단순하지만 서버리스 실행 시간·메모리·전송 비용이 증가한다. Supabase Storage는 DB와 통합되지만 기존 상품 기획의 S3 재사용성을 우선한다.

### 이메일

- **채택**: Resend Node.js SDK + `NotificationLog` + idempotency key.
- **근거**: Resend는 Node.js SDK, React 본문, 발송 ID와 중복 발송 방지용 `Idempotency-Key`를 제공한다. [Resend Send Email](https://resend.com/docs/api-reference/emails/send-email)
- **대안**: SMTP 직접 연동은 공급자별 오류·재시도·인증 설정 부담이 크다.

### 테스트

- **채택**: Vitest(도메인·validation·repository 통합) + Playwright(브라우저 E2E), PostgreSQL CI service.
- **근거**: Next.js 공식 문서는 Vitest를 단위 테스트, Playwright를 E2E 도구로 안내하며 async Server Component는 E2E 검증을 우선 권장한다. [Next.js 테스트 가이드](https://nextjs.org/docs/app/guides/testing), [Playwright 테스트](https://playwright.dev/docs/running-tests)

## 엣지 케이스 및 한계

### 인증·tenant

- 사용자는 하나 이상의 tenant에 속할 수 있도록 membership을 분리하되 MVP UI는 단일 tenant만 선택한다.
- URL 식별자만으로 tenant를 신뢰하지 않고 세션 membership과 함께 확인한다.
- 공개 문의 tenant는 클라이언트의 `tenantId`가 아니라 서버가 `tenantSlug`로 해석한다.
- 서버 코드에서 Prisma를 직접 호출하면 tenant 누락 가능성이 생기므로 도메인 repository 외 직접 접근을 금지한다.

### 문의

- 공개 폼은 클라이언트 생성 `requestId`를 tenant와 함께 unique 처리해 재전송 중복을 방지한다.
- 문의 저장 후 이메일이 실패해도 문의는 유지하고 발송 실패를 기록한다.
- 문의를 고객사로 전환할 때 동일 tenant 내 이메일 중복을 확인하되 자동 병합하지 않고 운영자에게 기존 고객 후보를 보여준다.

### 파일·공유 링크

- 원본 파일명은 표시용으로만 저장하고 S3 key에는 UUID를 사용한다.
- 업로드 URL은 5분, 다운로드 URL은 15분, 공유 링크는 기본 7일로 제한한다.
- MVP 기본 제한은 파일당 100MB이며 실행 파일·스크립트·HTML 업로드를 허용하지 않는다.
- S3 업로드 성공 후 메타데이터 확정 요청이 중복돼도 `uploadId` unique 제약으로 한 건만 생성한다.
- 공유 토큰 원문은 생성 직후 한 번만 반환하고 DB에는 SHA-256 hash만 저장한다.
- 파일 삭제와 버전 관리는 범위 밖이므로 잘못 업로드한 파일은 공유 대상에서 제외하는 방식으로 처리한다.

### 동시성·공유 상태

- 프로세스 메모리 캐시나 in-memory rate limit을 사용하지 않아 서버리스 인스턴스 간 상태 불일치를 피한다.
- 문의 `requestId`, 파일 `uploadId`, 알림 `idempotencyKey`는 데이터베이스 unique 제약으로 check-then-act 경쟁을 방지한다.
- 공유 링크 생성은 선택 파일과 tenant 소유권 검사를 같은 transaction에서 수행한다.
- 외부 S3·Resend 호출 중에는 DB transaction을 유지하지 않는다. 먼저 상태를 기록하고 외부 호출 후 결과만 짧은 transaction으로 갱신한다.

### 운영 한계

- 공개 문의의 고급 봇 방지와 분산 rate limiting은 실제 공개 도메인 출시 전 인프라 hardening spec에서 추가한다. MVP는 서버 검증, honeypot, 중복 요청 방지를 제공한다.
- Supabase, AWS, Resend와 Vercel 계정·도메인·시크릿은 아직 준비 여부가 확인되지 않았다.
- 고객 파일의 악성코드 검사는 후속 보안 spec 대상이다. MVP는 확장자와 MIME allowlist만 적용한다.

