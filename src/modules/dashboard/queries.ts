import "server-only";
import { db } from "@/lib/db";

const RECENT_INQUIRY_LIMIT = 5;

// tenant 범위 집계와 최근 문의를 한 번에 조회한다.
// 무제한 row 로드를 피하기 위해 집계는 count, 목록은 take 로 제한한다.
export async function getDashboardData(tenantId: string) {
  const [customerCount, newInquiryCount, fileCount, recentInquiries] = await Promise.all([
    db.customer.count({ where: { tenantId } }),
    db.inquiry.count({ where: { tenantId, status: "NEW" } }),
    db.fileItem.count({ where: { tenantId } }),
    db.inquiry.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: RECENT_INQUIRY_LIMIT,
      select: {
        id: true,
        companyName: true,
        contactName: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return { customerCount, newInquiryCount, fileCount, recentInquiries };
}
