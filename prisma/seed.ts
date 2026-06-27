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

  // Demo customers
  const customers = [
    { id: "cust_001", companyName: "(주)테크스타트", contactName: "김민준", email: "kim@techstart.co.kr", phone: "010-1234-5678", status: "ACTIVE" as const, memo: "2024년 1월 계약 신규 고객" },
    { id: "cust_002", companyName: "디자인웍스", contactName: "이수연", email: "lee@designworks.kr", phone: "010-2345-6789", status: "ACTIVE" as const },
    { id: "cust_003", companyName: "(주)그린솔루션", contactName: "박지훈", email: "park@greensol.com", phone: "010-3456-7890", status: "ACTIVE" as const, memo: "환경 컨설팅 전문 기업" },
    { id: "cust_004", companyName: "마케팅파트너스", contactName: "최유진", email: "choi@mkpartners.co.kr", status: "INACTIVE" as const },
    { id: "cust_005", companyName: "스마트로지스", contactName: "정태양", email: "jung@smartlogis.kr", phone: "010-5678-9012", status: "ACTIVE" as const },
    { id: "cust_006", companyName: "(주)블루오션미디어", contactName: "한소희", email: "han@blueocean.kr", phone: "010-6789-0123", status: "ACTIVE" as const },
    { id: "cust_007", companyName: "퓨처스케일", contactName: "오동현", email: "oh@futurescale.io", status: "INACTIVE" as const, memo: "프로젝트 일시 중단" },
    { id: "cust_008", companyName: "(주)데이터인사이트", contactName: "임채원", email: "lim@datains.co.kr", phone: "010-8901-2345", status: "ACTIVE" as const },
  ];

  for (const c of customers) {
    await db.customer.upsert({
      where: { id: c.id },
      update: {},
      create: { tenantId: tenant.id, ...c },
    });
  }

  console.log("Seed complete:", { tenant: tenant.slug, user: user.email, customers: customers.length });
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
