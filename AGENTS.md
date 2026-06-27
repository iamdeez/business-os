# Business OS 프로젝트 작업 지침

## 필수 참조 순서

1. 모든 설계·구현·검증 전에 `.Codex/constitution.md`를 읽는다.
2. 새 spec 설계 전 `.Codex/context.md`를 읽는다.
3. 배포·환경에 영향이 있으면 `.Codex/infra.md`를 읽는다.
4. 현재 우선순위와 진행 상태는 `.Codex/project.md`를 기준으로 확인한다.
5. 제품 기획의 원문은 `.claude/idea.md`를 참조한다.

## Slack 연동

- 프로젝트 채널: `#business_os`
- 채널 ID: `C0BEFPB13QQ`
- 워크스페이스 ID: `T0BD5UTDHB9`
- 링크: https://app.slack.com/client/T0BD5UTDHB9/C0BEFPB13QQ
- 작업 시작 시 채널의 최신 결정·블로커를 확인한다.
- 주요 결정, 마일스톤 완료, 일정 또는 범위 변경, 사용자 확인이 필요한 블로커를 채널에 공유한다.
- 사소한 파일 변경이나 반복적인 진행 로그는 공유하지 않는다.
- Slack 업데이트는 `.Codex/templates/slack-update.md` 형식을 사용한다.
- Slack에서 확정된 결정은 로컬 문서에도 반영한다. 결정은 `.Codex/templates/decision.md` 형식으로 기록하고, 우선순위 변경은 `.Codex/project.md`에 반영한다.
- 토큰, 비밀번호, 고객 개인정보, 비공개 환경변수는 Slack이나 문서에 기록하지 않는다.

## GitHub 연동

- 저장소: `iamdeez/business-os`
- 기본 브랜치: `main`
- `main` 직접 커밋과 직접 푸시를 금지하고 모든 변경은 작업 브랜치와 PR을 거친다.
- 브랜치, 커밋, PR 규칙은 `CONTRIBUTING.md`를 따른다.
- PR 생성·병합, 릴리스, 주요 CI 실패는 Slack `#business_os`에 링크와 함께 공유한다.
- Slack에서 논의된 코드 변경은 관련 GitHub Issue 또는 PR에 결정 요약을 남긴다.

## Codex 세션 연동

- 프로젝트 기준 스레드는 `.Codex/integrations.md`에 기록한다.
- 작업 시작 시 GitHub 원격 상태, Slack 최신 맥락, `.Codex/project.md`를 함께 확인한다.
- Codex에서 변경을 완료하면 작업 보드 갱신 → 검증 → 커밋 → 푸시 → PR → Slack 공유 순서로 마무리한다.
- 별도 작업 스레드를 사용한 경우 기준 스레드 ID와 관련 PR을 작업 기록에 남긴다.

## GitHub 연동

- 저장소: `iamdeez/business-os`
- 기본 브랜치: `main`
- `main` 직접 커밋과 직접 푸시를 금지하고 모든 변경은 작업 브랜치와 PR을 거친다.
- 브랜치, 커밋, PR 규칙은 `CONTRIBUTING.md`를 따른다.
- PR 생성·병합, 릴리스, 주요 CI 실패는 Slack `#business_os`에 링크와 함께 공유한다.
- Slack에서 논의된 코드 변경은 관련 GitHub Issue 또는 PR에 결정 요약을 남긴다.

## Codex 세션 연동

- 프로젝트 기준 스레드는 `.Codex/integrations.md`에 기록한다.
- 작업 시작 시 GitHub 원격 상태, Slack 최신 맥락, `.Codex/project.md`를 함께 확인한다.
- Codex에서 변경을 완료하면 작업 보드 갱신 → 검증 → 커밋 → 푸시 → PR → Slack 공유 순서로 마무리한다.
- 별도 작업 스레드를 사용한 경우 기준 스레드 ID와 관련 PR을 작업 기록에 남긴다.

## 프로젝트 관리 규칙

- `.Codex/project.md`를 프로젝트 관리의 단일 진입점으로 사용한다.
- 새 작업은 목표, 완료 조건, 담당, 상태가 명확해야 시작한다.
- 상태는 `Backlog`, `Ready`, `In Progress`, `Blocked`, `Done` 중 하나만 사용한다.
- 동시에 진행하는 핵심 작업은 하나를 원칙으로 한다.
- 기능 또는 인프라 변경은 `docs/specs/` 아래 spec으로 관리한다.
- 작업 완료 시 검증 결과와 남은 리스크를 기록한 뒤 `Done`으로 이동한다.
- 코드 구조가 바뀌면 `.Codex/context.md`, 인프라가 바뀌면 `.Codex/infra.md`를 함께 갱신한다.

## 템플릿

- 작업 정의: `.Codex/templates/task.md`
- 결정 기록: `.Codex/templates/decision.md`
- Slack 상태 공유: `.Codex/templates/slack-update.md`
- 주간 점검: `.Codex/templates/weekly-review.md`
- PR 설명: `.github/PULL_REQUEST_TEMPLATE.md`
- PR 설명: `.github/PULL_REQUEST_TEMPLATE.md`

## AI 작업 폴더

spec별 중간 분석과 임시 결과물은 해당 spec의 `_ai-workspace/`에 둔다.

```text
docs/specs/v{major}.{minor}.{patch}/{NNN-spec-name}/
├── spec.md
├── plan.md
├── tasks.md
└── _ai-workspace/
```
