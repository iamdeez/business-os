import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";

// 표시 이름에서 URL-safe slug base 를 만든다. ASCII 만 남기고, 없으면 "workspace".
export function baseSlug(name?: string | null): string {
  const ascii = (name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return ascii || "workspace";
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

/**
 * 신규 가입 사용자에게 Tenant + OWNER Membership 을 생성한다.
 * 이미 소속이 있으면 건너뛴다(멱등). slug 충돌 시 재시도한다.
 */
export async function provisionWorkspace(userId: string, displayName?: string | null): Promise<void> {
  const existing = await db.membership.findFirst({ where: { userId } });
  if (existing) return;

  const name = displayName?.trim() || "내 워크스페이스";
  const base = baseSlug(displayName);

  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = `${base}-${randomBytes(3).toString("hex")}`;
    try {
      await db.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({ data: { slug, name } });
        await tx.membership.create({ data: { tenantId: tenant.id, userId, role: "OWNER" } });
      });
      return;
    } catch (error) {
      if (isUniqueViolation(error)) continue; // slug 충돌 → 재생성
      throw error;
    }
  }
  throw new Error("워크스페이스 생성에 실패했습니다");
}
