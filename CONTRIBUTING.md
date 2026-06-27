# Contributing to Business OS

## 1. 기본 원칙

- `main`은 항상 공유 가능한 상태로 유지한다.
- `main`에 직접 커밋하거나 직접 푸시하지 않는다.
- 하나의 PR은 하나의 목표만 다룬다.
- 작업 시작 전에 `.Codex/project.md`에 작업 ID와 완료 조건을 등록한다.

## 2. 브랜치 규칙

형식:

```text
{type}/{TASK-ID}-{short-description}
```

허용 type:

| type | 용도 |
|---|---|
| `feat` | 사용자 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `chore` | 설정·도구·반복 작업 |
| `refactor` | 동작 변경 없는 구조 개선 |
| `test` | 테스트 추가·수정 |
| `hotfix` | 운영 긴급 수정 |

예시:

```text
chore/PM-002-github-setup
feat/DEV-003-customer-crm
fix/DEV-004-inquiry-status
```

- 영문 소문자와 숫자, 하이픈만 사용한다.
- 브랜치는 최신 `main`에서 만든다.
- 병합 후 원격 작업 브랜치를 삭제한다.
- `hotfix`도 PR과 검증을 생략하지 않는다.

## 3. 커밋 규칙

Conventional Commits 형식을 사용한다.

```text
{type}({scope}): {summary}
```

예시:

```text
docs(project): add GitHub and Slack workflow
feat(crm): add tenant-scoped customer list
fix(inquiry): prevent invalid status transition
```

- 제목은 명령형 영어로 작성하고 마침표를 붙이지 않는다.
- 한 커밋에는 되돌릴 수 있는 하나의 논리 변경만 담는다.
- `main`에 들어갈 최종 커밋에는 깨진 빌드나 미완성 비밀값이 없어야 한다.
- breaking change는 본문에 `BREAKING CHANGE:`와 마이그레이션 방법을 적는다.

## 4. PR 규칙

PR 제목은 커밋과 같은 형식을 사용한다.

```text
{type}({scope}): {summary}
```

필수 조건:

- 작업 ID와 관련 문서 또는 Issue를 연결한다.
- 변경 이유, 범위, 검증 방법, 리스크를 작성한다.
- Constitution Gates를 확인한다.
- 정책 검사와 향후 추가될 필수 CI를 통과한다.
- 리뷰 대화를 모두 해결한 뒤 병합한다.
- 애플리케이션 UI 변경은 전후 스크린샷 또는 영상을 첨부한다.
- DB·API·환경 변경은 마이그레이션 또는 롤백 방법을 적는다.

병합 방식:

- 기본은 **Squash and merge**를 사용한다.
- squash 제목은 PR 제목 규칙을 유지한다.
- `main`의 merge commit과 force push를 금지한다.

## 5. 리뷰·보호 규칙

- 솔로 개발 단계: PR은 필수지만 승인 수는 0명으로 둔다.
- 협업자 합류 시: 최소 1명 승인을 요구하고 마지막 푸시 후 이전 승인을 무효화한다.
- 모든 단계에서 대화 해결, 선형 히스토리, 강제 푸시 금지, 브랜치 삭제 금지를 유지한다.
- 관리자도 긴급 상황 외에는 동일한 규칙을 따른다.

## 6. Slack·Codex 연동

- PR 생성 시: 목적, 주요 변경, 검증 상태, PR 링크를 `#business_os`에 공유한다.
- PR 병합 시: 결과, 남은 리스크, 다음 작업을 공유한다.
- CI 실패가 작업을 막으면 오류 요약과 필요한 도움을 공유한다.
- Slack에서 확정된 변경 요청은 PR 설명 또는 결정 기록에 반영한다.
- Codex 기준 세션은 `.Codex/integrations.md`에 기록된 스레드를 사용한다.

## 7. 권장 작업 흐름

```text
1. .Codex/project.md에서 작업을 In Progress로 이동
2. 최신 main에서 규칙에 맞는 브랜치 생성
3. 작은 단위로 구현·검증·커밋
4. 원격 푸시 후 PR 생성
5. Slack에 PR 링크 공유
6. 정책 검사와 리뷰 대화 해결
7. Squash merge
8. Slack과 .Codex/project.md에 완료 상태 반영
```

