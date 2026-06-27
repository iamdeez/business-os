# Project Integrations

## GitHub

- **Repository**: https://github.com/iamdeez/business-os
- **Owner**: `iamdeez`
- **Visibility**: private
- **Default branch**: `main`
- **Workflow**: 작업 브랜치 → PR → 정책 검사 → 병합 → Slack 공유
- **Rules**: `CONTRIBUTING.md`

## Slack

- **Workspace ID**: `T0BD5UTDHB9`
- **Channel**: `#business_os`
- **Channel ID**: `C0BEFPB13QQ`
- **Channel URL**: https://app.slack.com/client/T0BD5UTDHB9/C0BEFPB13QQ
- **공유 이벤트**: PR 생성·병합, 마일스톤, 릴리스, 주요 CI 실패, 블로커
- **공유 제외**: 사소한 커밋, 로컬 중간 로그, 민감정보

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

