# T019 — Staging 외부 연동·보안 수동 검증 런북

> 이 문서는 **실행 절차**다. 실제 검증은 staging 자격증명·배포 환경을 가진 운영자가 수행하고,
> 결과(증거·잔여 제약)를 §7 결과 기록 템플릿에 채운 뒤 `.Codex/infra.md` §8 와 `CHANGES.md` 에 반영한다.
> 검증 대상: `SC-007`~`SC-009`, `NFR-001`~`NFR-004`.

## 목차

- [1. 사전 준비](#1-사전-준비)
- [2. SC-007 — 파일 업로드 정책·경로·교차 tenant](#2-sc-007--파일-업로드-정책경로교차-tenant)
- [3. SC-008 — 공유 링크 만료·폐기](#3-sc-008--공유-링크-만료폐기)
- [4. SC-009 — 이메일 발송 성공·실패·중복](#4-sc-009--이메일-발송-성공실패중복)
- [5. NFR 보안·무결성](#5-nfr-보안무결성)
- [6. E2E (선택) — 실제 S3 포함 실행](#6-e2e-선택--실제-s3-포함-실행)
- [7. 결과 기록 템플릿](#7-결과-기록-템플릿)

---

## 1. 사전 준비

- [ ] staging `.env` 전수 설정 (`src/lib/env.ts` 검증 통과). 실제 `DATABASE_URL`/`DIRECT_URL`(Supabase), `AWS_*`, `RESEND_API_KEY`/`EMAIL_FROM`, `BETTER_AUTH_*`, `NEXT_PUBLIC_APP_URL`.
- [ ] **S3 버킷 CORS** 적용: `contracts/s3-cors.json` 의 `AllowedOrigins` 를 실제 staging 도메인으로 치환 후 적용.
  ```bash
  aws s3api put-bucket-cors --bucket "$AWS_S3_BUCKET" \
    --cors-configuration file://docs/specs/v1.0.0/001-b2b-agency-mvp/contracts/s3-cors.json
  ```
- [ ] 버킷은 **private** (퍼블릭 액세스 차단) 유지 — 접근은 presigned URL 로만.
- [ ] 스키마·데모 데이터 준비: `pnpm db:push && pnpm db:seed`.
- [ ] 앱 기동: `pnpm build && pnpm start` (또는 배포본). 데모 로그인 `owner@demo-agency.com` / `demo1234!`.
- [ ] 교차 tenant 확인용 **두 번째 tenant**(다른 slug·OWNER) 가 필요하면 별도 생성. (seed 는 단일 tenant)

## 2. SC-007 — 파일 업로드 정책·경로·교차 tenant

| # | 절차 | 기대 결과 |
|---|---|---|
| 2-1 | 고객 상세에서 허용 파일(PDF/이미지/Office/ZIP, ≤100MB) 업로드 | S3 `{tenantId}/customers/{customerId}/{yyyy}/{mm}/{uploadId}` 에 객체 생성, 목록에 표시, `FileItem` 저장 |
| 2-2 | 금지 확장자(.exe/.html 등) 또는 비허용 MIME 업로드 시도 | presign 400 (BLOCKED_EXTENSION/MIME_NOT_ALLOWED), 업로드 거부 |
| 2-3 | 100MB 초과 파일 | presign 400 (SIZE_EXCEEDED) |
| 2-4 | 다른 tenant 의 `customerId` 로 presign 요청(수동 fetch) | 404 CUSTOMER_NOT_FOUND (교차 tenant 거부) |
| 2-5 | complete 시 S3 객체 없음/크기 불일치 | 422, `FileUpload.status=FAILED` |
| 2-6 | 동일 uploadId 로 presign/complete 재요청 | 멱등 — 중복 FileItem 미생성, 완료건은 ALREADY_COMPLETED |

## 3. SC-008 — 공유 링크 만료·폐기

| # | 절차 | 기대 결과 |
|---|---|---|
| 3-1 | 파일 선택 후 공유 링크 생성 | token 1회 노출, `/share/{token}` 에서 **선택 파일만** 표시, 다운로드 시 S3 객체 수신 |
| 3-2 | 다른 고객/다른 tenant 파일을 섞어 생성 시도(수동) | FILE_MISMATCH (개수 불일치로 거부) |
| 3-3 | 링크 폐기 후 `/share/{token}` 접근 | "폐기된 링크" 안내, 다운로드 URL 미발급 (410) |
| 3-4 | 만료(7일 경과 또는 DB `expiresAt` 과거로 조정) 후 접근 | "만료된 링크" 안내, 다운로드 미발급 (410) |
| 3-5 | 다운로드 URL 수신 후 15분 경과 재사용 | presigned GET 만료로 S3 거부 |

## 4. SC-009 — 이메일 발송 성공·실패·중복

| # | 절차 | 기대 결과 |
|---|---|---|
| 4-1 | 공개 문의 접수 | OWNER 에게 `inquiry_received` 발송, `NotificationLog` SENT + providerMessageId |
| 4-2 | 공유 링크 생성 | 고객에게 `files_shared` 발송, SENT 기록 |
| 4-3 | Resend 키를 일시적으로 무효화 후 트리거 | `NotificationLog` FAILED + errorCode, **본 동작(문의 접수·공유)은 정상 완료**(비차단) |
| 4-4 | 동일 트리거 재실행(같은 inquiryId/shareLinkId) | 중복 발송 없음 (DB unique + Resend idempotencyKey) |

## 5. NFR 보안·무결성

| NFR | 절차 | 기대 결과 |
|---|---|---|
| NFR-001 | 두 tenant 로 각자 로그인 → 상대 tenant 의 고객/문의/파일/공유/알림 ID 직접 접근 | 모두 미노출/거부 |
| NFR-002 | 클라이언트 번들·네트워크 응답·로그에서 secret·토큰 원문 검색 | AWS/Resend 키·세션·share token 원문 미노출 (token 은 hash 만 저장) |
| NFR-003 | 업로드/다운로드 시 네트워크 추적 | 파일 본문이 앱 서버를 거치지 않고 **브라우저↔S3 직접** 전송 (presigned) |
| NFR-004 | 이메일/S3 실패 상황에서 데이터 확인 | 외부 실패가 Customer/Inquiry 저장을 롤백·손상시키지 않음 |

## 6. E2E (선택) — 실제 S3 포함 실행

`e2e/file-share.spec.ts` 는 평소 `E2E_S3_READY` 미설정으로 skip 된다. staging 자격증명 환경에서:

```bash
E2E_S3_READY=1 E2E_BASE_URL="https://REPLACE_WITH_STAGING_DOMAIN" pnpm test:e2e
```

- 사전: staging 앱 기동 + S3 CORS 적용 + 데모 seed. 업로드~공유~다운로드 흐름이 통과해야 한다.

## 7. 결과 기록 템플릿

검증 완료 후 아래를 채워 `CHANGES.md` (T019 항목) 와 `.Codex/infra.md` §8 에 반영한다.

```text
일시:
환경(도메인/리전/버킷):
SC-007: PASS/FAIL — 증거(스크린샷/로그/S3 key):
SC-008: PASS/FAIL — 증거:
SC-009: PASS/FAIL — 증거(NotificationLog id):
NFR-001~004: PASS/FAIL — 증거:
발견된 잔여 운영 제약:
후속 조치:
```
