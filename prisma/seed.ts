import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPassword } from "better-auth/crypto";
import { hashShareToken } from "../src/lib/share-token";
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

  // Demo inquiries
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const inquiries = [
    {
      id: "inq_001",
      requestId: "req-001-techstart-web",
      companyName: "(주)테크스타트",
      contactName: "김민준",
      email: "kim@techstart.co.kr",
      phone: "010-1234-5678",
      message: "회사 홈페이지 리뉴얼을 검토 중입니다.\n- 프로젝트 유형: 웹사이트 개발\n- 예산 범위: 1,000~2,000만원\n- 희망 일정: 2026년 8월 오픈 목표\n\n현재 홈페이지가 구형이라 모바일 대응과 전체적인 디자인 개편이 필요합니다. 포트폴리오도 함께 검토 부탁드립니다.",
      status: "RESOLVED" as const,
      customerId: "cust_001",
      consentedAt: daysAgo(30),
      createdAt: daysAgo(30),
    },
    {
      id: "inq_002",
      requestId: "req-002-designworks-brand",
      companyName: "디자인웍스",
      contactName: "이수연",
      email: "lee@designworks.kr",
      phone: "010-2345-6789",
      message: "브랜드 아이덴티티 리브랜딩 프로젝트를 의뢰하고 싶습니다.\n- 프로젝트 유형: 브랜딩 / CI 개발\n- 예산 범위: 500~800만원\n- 희망 일정: 협의 가능\n\n로고, 색상 가이드, 명함 및 각종 서식 디자인 포함해서 견적 부탁드립니다.",
      status: "IN_PROGRESS" as const,
      customerId: "cust_002",
      consentedAt: daysAgo(14),
      createdAt: daysAgo(14),
    },
    {
      id: "inq_003",
      requestId: "req-003-green-app",
      companyName: "(주)그린솔루션",
      contactName: "박지훈",
      email: "park@greensol.com",
      phone: "010-3456-7890",
      message: "환경 데이터 모니터링 앱 개발 의뢰드립니다.\n- 프로젝트 유형: 모바일 앱 개발 (iOS/Android)\n- 예산 범위: 3,000~5,000만원\n- 희망 일정: 2026년 10월 베타 출시\n\n실시간 대기질, 수질 데이터를 시각화하는 앱입니다. 관리자 웹 대시보드도 함께 개발을 원합니다.",
      status: "IN_PROGRESS" as const,
      customerId: "cust_003",
      consentedAt: daysAgo(7),
      createdAt: daysAgo(7),
    },
    {
      id: "inq_004",
      requestId: "req-004-smartlogis-erp",
      companyName: "스마트로지스",
      contactName: "정태양",
      email: "jung@smartlogis.kr",
      phone: "010-5678-9012",
      message: "물류 관리 ERP 시스템 커스터마이징 문의드립니다.\n- 프로젝트 유형: 웹 시스템 개발\n- 예산 범위: 미정 (견적 요청)\n- 희망 일정: 가능한 빠르게\n\n현재 엑셀로 운영 중인 입출고, 재고, 배송 현황을 통합 관리하는 시스템이 필요합니다.",
      status: "NEW" as const,
      consentedAt: daysAgo(3),
      createdAt: daysAgo(3),
    },
    {
      id: "inq_005",
      requestId: "req-005-blueocean-sns",
      companyName: "(주)블루오션미디어",
      contactName: "한소희",
      email: "han@blueocean.kr",
      phone: "010-6789-0123",
      message: "SNS 콘텐츠 제작 및 마케팅 자동화 플랫폼 개발을 원합니다.\n- 프로젝트 유형: 웹 서비스 개발\n- 예산 범위: 2,000~3,000만원\n- 희망 일정: 2026년 9월\n\n인스타그램, 유튜브, 블로그 콘텐츠를 일괄 스케줄링하고 성과를 분석하는 툴입니다.",
      status: "NEW" as const,
      consentedAt: daysAgo(2),
      createdAt: daysAgo(2),
    },
    {
      id: "inq_006",
      requestId: "req-006-datains-dashboard",
      companyName: "(주)데이터인사이트",
      contactName: "임채원",
      email: "lim@datains.co.kr",
      phone: "010-8901-2345",
      message: "내부 데이터 분석 대시보드 구축 문의드립니다.\n- 프로젝트 유형: 데이터 시각화 / BI 대시보드\n- 예산 범위: 1,500~2,500만원\n- 희망 일정: 2026년 7월 말\n\nPostgreSQL DB에 연결하여 판매, 고객, 운영 KPI를 실시간으로 시각화하는 관리자 전용 대시보드가 필요합니다.",
      status: "NEW" as const,
      consentedAt: daysAgo(1),
      createdAt: daysAgo(1),
    },
    {
      id: "inq_007",
      requestId: "req-007-newco-inquiry",
      companyName: "퍼스트무버코리아",
      contactName: "송하준",
      email: "song@firstmover.kr",
      message: "스타트업 MVP 개발 견적을 받고 싶습니다.\n- 프로젝트 유형: 웹 서비스 (MVP)\n- 예산 범위: 800~1,200만원\n- 희망 일정: 3개월 이내\n\nO2O 서비스 MVP를 빠르게 개발하고 싶습니다. 기획은 완료된 상태이며 디자인과 개발 모두 의뢰 원합니다.",
      status: "NEW" as const,
      consentedAt: daysAgo(0),
      createdAt: new Date(),
    },
  ];

  for (const inq of inquiries) {
    const { customerId, createdAt, ...rest } = inq;
    await db.inquiry.upsert({
      where: { id: inq.id },
      update: {},
      create: {
        ...rest,
        tenantId: tenant.id,
        ...(customerId ? { customerId } : {}),
        createdAt,
        updatedAt: createdAt,
      },
    });
  }

  // Demo file metadata (FileUpload COMPLETED + FileItem).
  // s3Key 규칙: {tenantId}/customers/{customerId}/{yyyy}/{mm}/{uploadId}
  // 실제 S3 객체는 없는 metadata-only 데모 데이터다.
  const files = [
    { uploadId: "upl_demo_001", id: "file_001", customerId: "cust_001", displayName: "홈페이지_기획안_v2.pdf", mimeType: "application/pdf", size: 2_400_000 },
    { uploadId: "upl_demo_002", id: "file_002", customerId: "cust_001", displayName: "와이어프레임.png", mimeType: "image/png", size: 1_100_000 },
    { uploadId: "upl_demo_003", id: "file_003", customerId: "cust_002", displayName: "브랜드_가이드.pdf", mimeType: "application/pdf", size: 5_300_000 },
    { uploadId: "upl_demo_004", id: "file_004", customerId: "cust_003", displayName: "앱_요구사항정의서.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 880_000 },
  ];

  for (const f of files) {
    const s3Key = `${tenant.id}/customers/${f.customerId}/2026/06/${f.uploadId}`;
    await db.fileUpload.upsert({
      where: { uploadId: f.uploadId },
      update: {},
      create: {
        uploadId: f.uploadId,
        tenantId: tenant.id,
        customerId: f.customerId,
        s3Key,
        displayName: f.displayName,
        mimeType: f.mimeType,
        size: f.size,
        status: "COMPLETED",
      },
    });
    await db.fileItem.upsert({
      where: { id: f.id },
      update: {},
      create: {
        id: f.id,
        tenantId: tenant.id,
        customerId: f.customerId,
        uploadId: f.uploadId,
        displayName: f.displayName,
        s3Key,
        size: f.size,
        mimeType: f.mimeType,
      },
    });
  }

  // Demo share link (cust_001 의 file_001·file_002). 토큰 원문은 데모 용도로 공개한다.
  const DEMO_SHARE_TOKEN = "demo_share_techstart_0001";
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await db.shareLink.upsert({
    where: { id: "share_001" },
    update: {},
    create: {
      id: "share_001",
      tenantId: tenant.id,
      customerId: "cust_001",
      tokenHash: hashShareToken(DEMO_SHARE_TOKEN),
      expiresAt: sevenDaysLater,
    },
  });
  for (const fileItemId of ["file_001", "file_002"]) {
    await db.shareLinkFile.upsert({
      where: { shareLinkId_fileItemId: { shareLinkId: "share_001", fileItemId } },
      update: {},
      create: { shareLinkId: "share_001", fileItemId },
    });
  }

  console.log("Seed complete:", {
    tenant: tenant.slug,
    user: user.email,
    customers: customers.length,
    inquiries: inquiries.length,
    files: files.length,
    shareLink: `/share/${DEMO_SHARE_TOKEN}`,
  });
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
