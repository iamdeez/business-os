import { NextResponse } from "next/server";
import { getDownloadUrl } from "@/modules/file/service";

// 공개 엔드포인트: 공유 token 으로 검증 후 presigned GET 으로 redirect.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const fileItemId = url.searchParams.get("fileItemId");

  if (!token || !fileItemId) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const result = await getDownloadUrl(token, fileItemId);
  if (!result.ok) {
    const status =
      result.code === "EXPIRED" || result.code === "REVOKED"
        ? 410
        : 404;
    return NextResponse.json({ error: "다운로드할 수 없는 링크입니다", code: result.code }, { status });
  }

  return NextResponse.redirect(result.url, 302);
}
