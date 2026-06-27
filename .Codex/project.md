# Business OS 프로젝트 허브

> 이 문서는 프로젝트 진행 상태의 단일 진입점이다.
> 상세 제품 기획은 `.claude/idea.md`, 구현 요구사항은 `docs/specs/`에서 관리한다.

## 목표

크몽에서 판매 가능한 Business OS MVP와 재사용 가능한 모듈 기반을 만든다.

- **첫 포트폴리오 업종**: B2B 에이전시
- **첫 MVP 흐름**: 문의 접수 → 고객사 관리 → 파일 공유 → 이메일 알림 → 현황 확인

## 현재 단계

- **단계**: Implementation / B2B 에이전시 MVP
- **상태**: In Progress
- **현재 초점**: `DEV-002` T004 — Better Auth + tenant membership 경계 구현
- **다음 마일스톤**: M1 Core 기반 구현 완료 (인증·tenant·관리자 레이아웃)

## 성공 기준

- 크몽 기본형 데모가 가능한 핵심 흐름이 동작한다.
- 고객 문의 접수부터 관리자 확인, 파일 공유, 이메일 알림까지 검증된다.
- tenant 데이터 격리와 민감정보 보호 원칙이 검증된다.
- 새 고객 프로젝트가 Core와 모듈 조합으로 재사용 가능하다.

## 로드맵

| ID | 마일스톤 | 상태 | 완료 조건 |
|---|---|---|---|
| M0 | 프로젝트 기반 구성 | Done | 관리 문서, 템플릿, Slack 연동 규칙 완성 |
| M1 | Core 기반 | In Progress | 프로젝트 세팅, 인증, tenant, 관리자 레이아웃 검증 |
| M2 | 판매 가능 MVP | Backlog | CRM, 문의, 파일 공유, 이메일, 대시보드 E2E 검증 |
| M3 | 표준형 확장 | Backlog | 예약, 프로젝트 상태, 고객 포털 검증 |
| M4 | 포트폴리오 출시 | Backlog | 데모 데이터, 상세페이지, 운영 문서 완성 |

## 작업 보드

### In Progress

- [ ] `DEV-002` 환경·데이터·tenant 인증 기반 구현 (`T002~T004`)
- [ ] `DEV-005` 파일 업로드·공유 구현 — T010 S3 업로드 예약·확정·파일 정책 (T011~T012 잔여)

### Ready

- (없음)

### Backlog

- [ ] `DEV-003` 고객 CRM 구현
- [ ] `DEV-004` 공개 문의 접수와 관리자 인박스 구현
- [ ] `DEV-006` 이메일 알림과 발송 로그 구현
- [ ] `DEV-007` 기본 대시보드 구현
- [ ] `OPS-001` 개발·배포 환경과 관측성 정의
- [ ] `OPS-003` Slack 결정·범위 변경 요청 워크플로우
- [ ] `OPS-004` Slack 블로커 신고 워크플로우
- [ ] `OPS-005` Slack 주간 리뷰 예약 워크플로우
- [ ] `OPS-006` Slack 채널 탭과 워크플로우 진입점 정리
- [ ] `PORT-001` 업종별 데모 데이터와 시나리오 제작

### Blocked

- 없음

### Done

- [x] `PM-001` 프로젝트 관리 문서와 템플릿 초기화
- [x] `PM-002` GitHub 저장소와 협업 규칙 구성 ([PR #1](https://github.com/iamdeez/business-os/pull/1))
- [x] `SPEC-001` B2B 에이전시 MVP 설계 ([문서](../docs/specs/v1.0.0/001-b2b-agency-mvp/spec.md))
- [x] `DEV-001` Next.js 프로젝트 및 개발 도구 초기화 (`T001`)
- [x] `OPS-002` GitHub PR·workflow·배포 Slack 알림 연동

## 결정 로그

| ID | 날짜 | 결정 | 기록 |
|---|---|---|---|
| DEC-001 | 2026-06-28 | 프로젝트 협업 채널로 Slack `#business_os` 사용 | `AGENTS.md` |
| DEC-002 | 2026-06-28 | 로컬 문서를 기준 상태로 두고 주요 이벤트를 Slack에 동기화 | `AGENTS.md` |
| DEC-003 | 2026-06-28 | GitHub `main` 변경은 작업 브랜치와 PR을 필수로 사용 | `CONTRIBUTING.md` |
| DEC-004 | 2026-06-28 | 솔로 개발 중 PR 승인은 0명, 협업자 합류 시 1명 이상으로 강화 | `CONTRIBUTING.md` |
| DEC-005 | 2026-06-28 | 첫 포트폴리오 업종을 B2B 에이전시로 확정 | `SPEC-001` |
| DEC-006 | 2026-06-28 | 2주 MVP는 문의·CRM·파일·이메일·대시보드로 제한 | `SPEC-001` |
| DEC-007 | 2026-06-28 | 애플리케이션 기준 런타임을 Node.js 24·pnpm 11·Next.js 16.2로 고정 | `DEV-001` |
| DEC-008 | 2026-06-28 | Slack 워크플로우를 GitHub 알림 → 결정 요청 → 블로커 신고 → 주간 리뷰 → 채널 탭 순서로 적용 | `OPS-002~OPS-006` |
| DEC-009 | 2026-06-28 | PostgreSQL 서비스는 Supabase 사용. CLI는 DIRECT_URL(port 5432), 앱 런타임은 DATABASE_URL(pgbouncer port 6543) | `DEV-002` |
| DEC-010 | 2026-06-28 | Prisma 7 런타임 PrismaClient는 `@prisma/adapter-pg` driver adapter 필수 (`datasourceUrl` 생성자 옵션 제거됨) | `DEV-002` |

## 리스크와 확인 필요 사항

| 우선순위 | 항목 | 다음 행동 |
|---|---|---|
| 높음 | tenant 격리 검증 방식 미정 | 인증·데이터 접근 테스트 기준 정의 |
| 중간 | 외부 서비스 비용과 계정 준비 상태 미확인 | 인프라 spec에서 확인 |
| 중간 | API·템플릿 버전 정책 미정 | 첫 공개 전 정책 결정 |
| 중간 | 비공개 저장소의 GitHub Ruleset은 현재 요금제에서 사용 불가 | Pro 전환 또는 공개 여부 결정 전 절차 규칙과 PR CI로 운영 |

## 운영 리듬

- 작업 시작: 이 문서와 Slack 최신 맥락 확인
- 작업 중: 상태·블로커·결정 즉시 갱신
- 작업 완료: 검증 결과 기록, 보드 이동, 관련 context/infra 갱신
- 주간: `.Codex/templates/weekly-review.md`로 범위·리스크·다음 우선순위 점검
