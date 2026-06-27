import "server-only";
import { db } from "@/lib/db";

// uploadId 로 tenant 범위 내 업로드 예약을 조회한다.
export async function findUploadById(tenantId: string, uploadId: string) {
  return db.fileUpload.findFirst({ where: { tenantId, uploadId } });
}

export async function createUpload(data: {
  uploadId: string;
  tenantId: string;
  customerId: string;
  s3Key: string;
  displayName: string;
  mimeType: string;
  size: number;
}) {
  return db.fileUpload.create({ data });
}

export async function markUploadFailed(uploadId: string) {
  return db.fileUpload.update({
    where: { uploadId },
    data: { status: "FAILED" },
  });
}

// uploadId 로 확정된 FileItem 을 조회한다 (complete 멱등성).
export async function findFileItemByUploadId(tenantId: string, uploadId: string) {
  return db.fileItem.findFirst({ where: { tenantId, uploadId } });
}

// FileItem 생성과 FileUpload 상태 전이를 단일 transaction 으로 확정한다.
export async function confirmUpload(data: {
  tenantId: string;
  customerId: string;
  uploadId: string;
  displayName: string;
  s3Key: string;
  size: number;
  mimeType: string;
}) {
  return db.$transaction(async (tx) => {
    const fileItem = await tx.fileItem.create({
      data: {
        tenantId: data.tenantId,
        customerId: data.customerId,
        uploadId: data.uploadId,
        displayName: data.displayName,
        s3Key: data.s3Key,
        size: data.size,
        mimeType: data.mimeType,
      },
    });
    await tx.fileUpload.update({
      where: { uploadId: data.uploadId },
      data: { status: "COMPLETED" },
    });
    return fileItem;
  });
}
