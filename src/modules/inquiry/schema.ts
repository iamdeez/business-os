import { z } from "zod";

// Public inquiry submission
export const inquiryFormSchema = z.object({
  requestId: z.string().uuid("유효하지 않은 요청 ID입니다"),
  companyName: z.string().min(1, "회사명을 입력하세요").max(100),
  contactName: z.string().min(1, "담당자명을 입력하세요").max(50),
  email: z.string().email("올바른 이메일을 입력하세요"),
  phone: z
    .string()
    .max(20)
    .optional()
    .or(z.literal("")),
  message: z.string().min(10, "문의 내용을 10자 이상 입력하세요").max(2000),
  honeypot: z.literal(""),
});

export type InquiryFormInput = z.infer<typeof inquiryFormSchema>;

// Admin: status update
export const inquiryStatusSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]),
});

// Admin: connect to existing customer
export const connectCustomerSchema = z.object({
  customerId: z.string().min(1, "고객사를 선택하세요"),
});

export type InquiryStatus = z.infer<typeof inquiryStatusSchema>["status"];
