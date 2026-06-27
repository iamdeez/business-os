import { notFound } from "next/navigation";
import { resolveSlug } from "@/modules/inquiry/repository";
import { InquiryForm } from "./inquiry-form";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export default async function PublicInquiryPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await resolveSlug(tenantSlug);
  if (!tenant) notFound();

  return (
    <div className="min-h-screen bg-[#fdf7ff] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-[520px]">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6750a4]">
            <span className="text-sm font-bold text-white">B</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1d1b20]">{tenant.name}</h1>
          <p className="mt-2 text-sm text-[#494551]">프로젝트 문의를 보내주세요. 빠르게 연락 드리겠습니다.</p>
        </div>

        <InquiryForm tenantSlug={tenantSlug} />
      </div>
    </div>
  );
}
