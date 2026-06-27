import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const tenant = await db.tenant.upsert({
    where: { slug: "demo-agency" },
    update: {},
    create: {
      id: "tenant_demo_agency",
      slug: "demo-agency",
      name: "데모 에이전시",
    },
  });

  const passwordHash = await hashPassword("demo1234!");

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

  const existingAccount = await db.account.findFirst({
    where: { userId: user.id, providerId: "credential" },
  });
  if (!existingAccount) {
    await db.account.create({
      data: {
        id: `acc_demo_owner`,
        userId: user.id,
        accountId: user.email,
        providerId: "credential",
        password: passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

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
