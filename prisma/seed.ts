import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  // Tenant
  const tenant = await db.tenant.upsert({
    where: { slug: "demo-agency" },
    update: {},
    create: {
      id: "tenant_demo_agency",
      slug: "demo-agency",
      name: "데모 에이전시",
    },
  });

  // OWNER 계정 — Better Auth 형식에 맞춰 id를 고정한다
  // 실제 비밀번호 해시는 T004(Better Auth 구현) 단계에서 확정한다
  const user = await db.user.upsert({
    where: { email: "owner@demo-agency.com" },
    update: {},
    create: {
      id: "user_demo_owner",
      name: "데모 관리자",
      email: "owner@demo-agency.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await db.membership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  console.log("Seed complete:", { tenant: tenant.slug, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
