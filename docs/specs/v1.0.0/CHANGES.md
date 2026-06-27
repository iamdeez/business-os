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
