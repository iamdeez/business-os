# Project Integrations

## GitHub

- **Repository**: https://github.com/iamdeez/business-os
- **Owner**: `iamdeez`
- **Visibility**: private
- **Default branch**: `main`
- **Workflow**: 작업 브랜치 → PR → 정책 검사 → 병합 → Slack 공유
- **Rules**: `CONTRIBUTING.md`
- **Merge settings**: squash only, delete head branch after merge
- **Server-side main protection**: pending — private repository rulesets require GitHub Pro

## Slack

- **Workspace ID**: `T0BD5UTDHB9`
- **Channel**: `#business_os`
- **Channel ID**: `C0BEFPB13QQ`
- **Channel URL**: https://app.slack.com/client/T0BD5UTDHB9/C0BEFPB13QQ
- **공유 이벤트**: PR 생성·병합, 마일스톤, 릴리스, 주요 CI 실패, 블로커
- **공유 제외**: 사소한 커밋, 로컬 중간 로그, 민감정보
- **워크플로우 명세**: `.Codex/slack-workflows.md`
- **적용 순서**: GitHub 알림 → 결정 요청 → 블로커 신고 → 주간 리뷰 → 채널 탭

## Codex

- **Project thread title**: `Business OS · GitHub·Slack 프로젝트 허브`
- **Thread ID**: `019f0a19-b39b-7a33-9254-859f80fa134b`
- **Workspace**: `/Users/krystal/workspace/kmong`
- **상태**: pinned
- **역할**: GitHub·Slack·로컬 프로젝트 상태를 조율하는 기준 세션

## 동기화 순서

```text
Codex 기준 세션
  ↓ 작업 선택 및 로컬 문서 갱신
GitHub 브랜치·커밋·PR
  ↓ PR/병합/블로커 이벤트 공유
Slack #business_os
  ↓ 확정된 결정 회수
Codex 기준 세션 및 로컬 문서
```

## 일관성 규칙

1. 작업 ID를 `.Codex/project.md`, 브랜치, PR에서 동일하게 사용한다.
2. GitHub가 코드 변경과 리뷰의 기준 기록이다.
3. `.Codex/project.md`가 우선순위와 진행 상태의 기준 기록이다.
4. Slack은 알림과 빠른 의사결정 채널이며, 확정 결정은 GitHub 또는 로컬 문서에 남긴다.
5. Codex 기준 세션은 세 시스템의 불일치를 발견하면 먼저 기준 기록을 갱신한다.

## 보류 중인 연동

- GitHub 서버 측 `main` 보호: GitHub Pro 전환 또는 저장소 공개 결정 필요
- `OPS-002` GitHub 앱 기반 Slack 자동 알림: Slack 워크스페이스 앱 설치·비공개 저장소 구독 권한 필요
- `OPS-003~OPS-006` Slack Workflow Builder와 채널 탭 구성: `.Codex/slack-workflows.md` 순서대로 적용
- 위 연동이 준비되기 전에는 Codex 기준 세션이 PR·병합·CI 이벤트를 `#business_os`에 공유한다.
