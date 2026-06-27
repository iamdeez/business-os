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
