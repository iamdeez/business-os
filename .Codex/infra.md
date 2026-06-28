# Project Infra

> 현재 확인된 운영 환경만 기록한다. 계획은 spec 또는 `.claude/idea.md`에 둔다.
> 실제 인증 정보는 절대 기록하지 않는다. 환경변수는 `.env` / `.env.example` 로 관리한다.

## 1. 환경 구성

| 환경 | 상태 | 비고 |
|---|---|---|
| local(dev) | 구성됨 | Node 24 + Supabase Postgres + `.env` |
| CI | 구성됨 | GitHub Actions `app-ci.yml` (임시 PostgreSQL service) |
| staging/prod | 미구성 | 배포 대상 미정 (T019 미수행) |

- 소스 관리: GitHub `iamdeez/business-os` (기본 브랜치 `main`).

## 2. 인프라 토폴로지

```text
브라우저 ── Next.js(App Router) ── PostgreSQL(Supabase)
                  │                    ↑ DATABASE_URL(pgbouncer 6543) 런타임
                  │                    ↑ DIRECT_URL(5432 세션) CLI/seed
                  ├── AWS S3 (presigned PUT/GET, private bucket)
                  └── Resend (트랜잭션 이메일)
인증: Better Auth (이메일·비밀번호, 공개 가입 차단)
```

| 컴포넌트 | 유형 | 역할 |
|---|---|---|
| Next.js 앱 | 서버+클라이언트 | UI·Server Action·Route Handler |
| PostgreSQL(Supabase) | 관리형 DB | tenant 데이터. 런타임 pooler, CLI/seed 직접 연결 |
| AWS S3 | 오브젝트 스토리지 | 고객 파일. presigned URL로만 접근 |
| Resend | 이메일 | inquiry_received·files_shared 발송 |

## 3. 배포 방식

### 빌드·실행

```bash
pnpm install --frozen-lockfile
pnpm db:generate        # Prisma Client
pnpm db:push            # 스키마 동기화 (마이그레이션 디렉토리 없음)
pnpm db:seed            # 데모 데이터 (선택)
pnpm build              # Next.js production build
pnpm start              # production 서버 (NODE_ENV=production)
```

- **마이그레이션 부재**: `prisma/migrations/` 가 없어 `prisma migrate deploy` 대신 `db push` 로 스키마를 적용한다. 운영 도입 시 마이그레이션 체계로 전환 필요.
- 배포 대상 플랫폼·롤백 절차는 미정(staging 미구성, T019).

### 필수 환경변수 (`.env.example` 기준)

`DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_APP_URL`
(`src/lib/env.ts` 가 서버 시작 시 zod 로 전수 검증 — 누락 시 즉시 오류)

## 4. CI (GitHub Actions)

| 워크플로 | 트리거 | 내용 |
|---|---|---|
| `pr-policy.yml` | PR | PR 제목·브랜치명 컨벤션 검사 |
| `app-ci.yml` | PR, push(main) | postgres:16 service + 더미 외부 env → install → db:generate → db:push → db:seed → lint → typecheck → test(vitest) → build → playwright(chromium) → test:e2e |

- E2E 의 file-share 스펙은 `E2E_S3_READY` 미설정으로 skip(실제 S3 필요).
- CI 외부 env(AWS·Resend)는 더미값 — DB-only 흐름만 실행되며 실제 발송·업로드는 하지 않는다.

## 5. 연결 실패·재시도 동작

- **이메일(Resend)**: 발송 실패는 비차단 — `NotificationLog.status=FAILED` 로 기록하고 본 동작(문의 접수·공유 생성)은 계속한다. 자동 재시도 worker 없음(운영자 확인).
- **S3**: complete 시 HeadObject 실패는 422 + `FileUpload.status=FAILED`.
- **DB**: 연결 풀(`pg.Pool`) 기본 동작. 별도 재시도 래퍼 없음.

## 6. 로컬 개발 환경

- 런타임: Node.js 24.x, 패키지 관리자: pnpm 11.7.x

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm lint && pnpm typecheck && pnpm test && pnpm build   # = pnpm check
pnpm test:e2e       # Playwright (로컬 DB·브라우저 필요)
pnpm db:push && pnpm db:seed   # 로컬 DB 준비
```

- `.env` 에 Supabase `DATABASE_URL`/`DIRECT_URL` 과 외부 서비스 키가 있어야 서버가 기동한다(env 전수 검증).

## 7. 배포 전 확인 체크리스트

- [ ] 환경별 `.env` 변수 전수 설정 (env.ts 검증 통과)
- [ ] S3 버킷 **PUT/GET CORS** 가 운영 도메인 출처로 설정됨 (브라우저 직접 업로드 — 설정값: `docs/specs/v1.0.0/001-b2b-agency-mvp/contracts/s3-cors.json`)
- [ ] staging 검증 런북 수행: `docs/specs/v1.0.0/001-b2b-agency-mvp/T019-staging-verification.md`
- [ ] tenant 데이터 격리 검증 (교차 tenant 접근 차단)
- [ ] 마이그레이션/스키마 동기화 방식 확정 (현재 db push)
- [ ] 민감정보가 저장소·로그·Slack에 노출되지 않음
- [ ] 모니터링·오류 알림 구성 (미구성)

## 8. 알려진 인프라 제약

| 항목 | 내용 | 영향 범위 | 관련 spec |
|---|---|---|---|
| staging/prod 미구성 | 배포 대상 플랫폼·롤백 절차 미정. 실제 S3·Resend·DB 통합 미검증 | 배포·파일·알림 | SPEC-001/T019 |
| 마이그레이션 부재 | db push 로만 스키마 적용 (CI 포함) | 스키마 변경 | SPEC-001/T003·T018 |
| S3 CORS 필수 | 미설정 시 브라우저 업로드가 CORS 오류로 실패 | 파일 업로드 | SPEC-001/T012·T019 |
| pgbouncer 트랜잭션 모드 | port 6543 은 DDL 미지원 → CLI/seed 는 DIRECT_URL(5432) | DB 작업 | SPEC-001/T003 |
| Ruleset 미적용 | 비공개 저장소 요금제로 서버측 브랜치 보호 불가 → 절차 규칙 + PR CI 로 운영 | GitHub | CONTRIBUTING |

## 9. 갱신 이력

| 날짜 | commit | 갱신 내용 | 관련 spec |
|---|---|---|---|
| 2026-06-28 | `N/A` | 최초 작성 | — |
| 2026-06-28 | `PR #1` | GitHub 저장소와 PR 정책 검사 구성 | PM-002 |
| 2026-06-28 | `DEV-001` | Node.js·pnpm·Next.js 로컬 실행 및 품질 명령 구성 | SPEC-001/T001 |
| 2026-06-28 | `0783948` | Supabase·S3·Resend·Better Auth 연동, app-ci.yml(PostgreSQL+E2E), db push 방식·S3 CORS 제약 현행화 | SPEC-001/T020 |
