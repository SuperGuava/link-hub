import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  account,
  session,
  subscription,
  user,
  verification,
} from "@/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    "http://localhost:3002",
    "http://127.0.0.1:3002",
  ].filter((origin): origin is string => Boolean(origin)),
  account: {
    // OAuth state를 DB+쿠키 이중 저장 대신 쿠키만 사용 (Next.js dev에서 state_mismatch 방지)
    storeStateStrategy: "cookie",
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  socialProviders: {
    kakao: {
      clientId: process.env.KAKAO_CLIENT_ID as string,
      clientSecret: process.env.KAKAO_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        const kakaoProfile = profile as {
          id: string | number;
          properties?: { nickname?: string; profile_image?: string };
          kakao_account?: {
            email?: string;
            is_email_verified?: boolean;
            profile?: { nickname?: string; profile_image_url?: string };
          };
        };

        const kakaoId = String(kakaoProfile.id);
        const nickname =
          kakaoProfile.properties?.nickname ??
          kakaoProfile.kakao_account?.profile?.nickname ??
          "Kakao User";
        const email =
          kakaoProfile.kakao_account?.email ??
          `${kakaoId}@kakao.linkhub.local`;
        const image =
          kakaoProfile.properties?.profile_image ??
          kakaoProfile.kakao_account?.profile?.profile_image_url ??
          undefined;

        return {
          name: nickname,
          email,
          emailVerified: Boolean(kakaoProfile.kakao_account?.is_email_verified),
          image,
        };
      },
    },
  },
  user: {
    additionalFields: {
      planType: {
        type: "string",
        required: false,
        defaultValue: "FREE",
        input: false,
      },
      planExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          await db.insert(subscription).values({
            userId: createdUser.id,
            planType: "FREE",
            status: "ACTIVE",
          });
        },
      },
      update: {
        before: async (data) => {
          if (!data.id) {
            return { data };
          }

          const existing = await db.query.user.findFirst({
            where: eq(user.id, data.id),
          });

          if (!existing) {
            return { data };
          }

          return {
            data: {
              ...data,
              planType: existing.planType ?? "FREE",
              planExpiresAt: existing.planExpiresAt ?? null,
            },
          };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
