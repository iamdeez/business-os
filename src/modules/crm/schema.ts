import { z } from "zod";

export const customerSchema = z.object({
  companyName: z.string().min(1, "회사명을 입력하세요").max(100),
  contactName: z.string().min(1, "담당자명을 입력하세요").max(50),
  email: z.string().email("올바른 이메일을 입력하세요"),
  phone: z.string().max(20).optional().or(z.literal("")),
  memo: z.string().max(1000).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type CustomerInput = z.infer<typeof customerSchema>;
