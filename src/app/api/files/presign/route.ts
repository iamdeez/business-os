import { NextResponse } from "next/server";
import { getTenantAccess } from "@/modules/tenant/access";
import { presignInputSchema } from "@/modules/file/schema";
import { reserveUpload } from "@/modules/file/service";

export async function POST(req: Request) {
  const access = await getTenantAccess();
  if (!access) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문입니다" }, { status: 400 });
  }

  const parsed = presignInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((e) => e.message).join(", ") },
      { status: 400 }
    );
  }

  const result = await reserveUpload(access.tenantId, parsed.data);
  if (!result.ok) {
    const status =
      result.code === "CUSTOMER_NOT_FOUND"
        ? 404
        : result.code === "ALREADY_COMPLETED" || result.code === "UPLOAD_CONFLICT"
          ? 409
          : 400;
    return NextResponse.json({ error: result.message, code: result.code }, { status });
  }

  return NextResponse.json({
    uploadId: result.uploadId,
    uploadUrl: result.uploadUrl,
    s3Key: result.s3Key,
    expiresIn: result.expiresIn,
  });
}
