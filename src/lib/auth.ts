import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { provisionWorkspace } from "@/modules/tenant/provisioning";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    // 자가 가입 허용(SaaS). 가입 시 databaseHooks 로 워크스페이스를 자동 생성한다.
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // 신규 사용자에게 Tenant + OWNER Membership 프로비저닝.
          await provisionWorkspace(user.id, user.name);
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
