import "server-only";
import { db } from "@/lib/db";

export async function getTenantBySlug(slug: string) {
  return db.tenant.findUnique({ where: { slug } });
}
