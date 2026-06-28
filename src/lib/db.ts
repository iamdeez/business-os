import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  // 관리형 PostgreSQL(Supabase 등)은 SSL 연결이 필요하다. raw pg.Pool 은 기본적으로 SSL 을
  // 켜지 않으므로(prisma CLI 와 달리) 비-로컬 호스트에는 명시적으로 SSL 을 활성화한다.
  // 로컬·CI 의 localhost PostgreSQL 은 SSL 미지원이므로 제외한다.
  const isLocal = !!connectionString && /(localhost|127\.0\.0\.1)/.test(connectionString);
  const pool = new Pool({
    connectionString,
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
