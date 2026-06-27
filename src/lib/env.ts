import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((i) => i.path.join("."))
    .join(", ");
  throw new Error(`Missing or invalid environment variables: ${missing}`);
}

export const env = parsed.data;
