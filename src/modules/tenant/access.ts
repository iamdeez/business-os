import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}

export async function requireTenantAccess() {
  const session = await requireSession();

  const membership = await db.membership.findFirst({
    where: { userId: session.user.id },
    include: { tenant: true },
  });

  if (!membership) redirect("/login");

  return {
    session,
    tenantId: membership.tenantId,
    tenant: membership.tenant,
    role: membership.role,
  };
}

// Route Handler 용 비-redirect 변형. 미인증·미소속 시 null 을 반환해
// API 가 redirect 대신 401 JSON 으로 응답할 수 있게 한다.
export async function getTenantAccess() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const membership = await db.membership.findFirst({
    where: { userId: session.user.id },
    include: { tenant: true },
  });
  if (!membership) return null;

  return {
    session,
    tenantId: membership.tenantId,
    tenant: membership.tenant,
    role: membership.role,
  };
}
