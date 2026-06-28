# syntax=docker/dockerfile:1

# ─── base: Node 24 + pnpm(corepack) ──────────────────────────────────────────
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm" PATH="/pnpm:$PATH"
RUN corepack enable
WORKDIR /app

# ─── deps: 의존성 설치 (lockfile 고정) ───────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ─── builder: Prisma 생성 + Next standalone 빌드 ─────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 빌드 시 env 검증(src/lib/env.ts)을 통과시키기 위한 placeholder.
# 실제 값이 아니며 시크릿이 아니다. 런타임 값은 Railway 환경변수로 주입된다.
# NEXT_PUBLIC_APP_URL 은 서버 런타임에서만 읽으므로 클라이언트 번들에 placeholder 가 박히지 않는다.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    DIRECT_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    BETTER_AUTH_SECRET="build-time-placeholder-not-a-secret" \
    BETTER_AUTH_URL="http://localhost:3000" \
    AWS_REGION="auto" \
    AWS_ACCESS_KEY_ID="placeholder" \
    AWS_SECRET_ACCESS_KEY="placeholder" \
    AWS_S3_BUCKET="placeholder" \
    RESEND_API_KEY="placeholder" \
    EMAIL_FROM="noreply@example.com" \
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
RUN pnpm db:generate && pnpm build

# ─── runner: standalone 서버만 포함한 경량 런타임 ────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
# standalone 서버는 PORT·HOSTNAME 환경변수를 따른다. Railway 가 PORT 를 주입한다.
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
