"use client";

import { useActionState, useId, useState } from "react";
import { submitInquiryAction, type SubmitInquiryState } from "@/modules/inquiry/actions";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  tenantSlug: string;
}

const initialState: SubmitInquiryState = { status: "idle" };

export function InquiryForm({ tenantSlug }: Props) {
  const formId = useId();
  const [requestId] = useState(() => crypto.randomUUID());

  const action = submitInquiryAction.bind(null, tenantSlug);
  const [state, formAction, isPending] = useActionState(action, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
        <h2 className="mb-2 text-lg font-bold text-green-900">문의가 접수되었습니다</h2>
        <p className="text-sm text-green-700">
          담당자가 영업일 기준 1~2일 내 연락 드리겠습니다.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Hidden idempotency key */}
      <input type="hidden" name="requestId" value={requestId} />
      {/* Honeypot — bots fill this, humans don't */}
      <input
        type="text"
        name="honeypot"
        defaultValue=""
        tabIndex={-1}
        aria-hidden="true"
        className="absolute -left-[9999px]"
        autoComplete="off"
      />

      {state.status === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="rounded-2xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#7a7582]">
          회사 정보
        </p>
        <div className="space-y-4">
          <Field
            id={`${formId}-companyName`}
            label="회사명"
            name="companyName"
            required
            placeholder="주식회사 예시"
          />
          <Field
            id={`${formId}-contactName`}
            label="담당자명"
            name="contactName"
            required
            placeholder="홍길동"
          />
          <Field
            id={`${formId}-email`}
            label="이메일"
            name="email"
            type="email"
            required
            placeholder="contact@example.com"
          />
          <Field
            id={`${formId}-phone`}
            label="연락처"
            name="phone"
            type="tel"
            placeholder="010-0000-0000 (선택)"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#cbc4d2]/60 bg-white p-6 shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#7a7582]">
          문의 내용
        </p>
        <div>
          <label htmlFor={`${formId}-message`} className="mb-1.5 block text-sm font-medium text-[#1d1b20]">
            문의 내용 <span className="text-[#ba1a1a]">*</span>
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            required
            rows={5}
            placeholder="프로젝트 유형, 예산 범위, 희망 일정, 요청 사항 등을 자유롭게 적어주세요."
            className="w-full resize-none rounded-xl border border-[#cbc4d2] bg-white px-4 py-3 text-sm text-[#1d1b20] placeholder:text-[#7a7582] outline-none transition-all focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/10"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4f378a] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3b2571] disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            접수 중...
          </>
        ) : (
          "문의 보내기"
        )}
      </button>

      <p className="text-center text-xs text-[#7a7582]">
        제출 시 수집된 정보는 문의 처리 목적으로만 사용됩니다.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#1d1b20]">
        {label} {required && <span className="text-[#ba1a1a]">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-[#cbc4d2] bg-white px-4 text-sm text-[#1d1b20] placeholder:text-[#7a7582] outline-none transition-all focus:border-[#4f378a] focus:ring-2 focus:ring-[#4f378a]/10"
      />
    </div>
  );
}
