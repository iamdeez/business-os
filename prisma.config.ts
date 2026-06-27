import { defineConfig } from "@prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx ./prisma/seed.ts",
  },
  datasource: {
    // CLI 작업(db push/migrate)은 세션 모드 직접 연결 사용. pgbouncer 트랜잭션 모드는 DDL 미지원.
    // 앱 런타임 PrismaClient는 DATABASE_URL(pooler) 환경변수를 직접 사용.
    url: process.env.DIRECT_URL!,
  },
});
