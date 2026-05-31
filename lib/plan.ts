import { and, count, eq, gte } from "drizzle-orm";

import { db } from "@/db/client";
import { link, user } from "@/db/schema";
import {
  getEffectivePlanType,
  PLAN_LIMITS,
} from "@/lib/plan-constants";
import type {
  CanCreateLinkResult,
  PlanEvaluation,
} from "@/types/plan";

export { getEffectivePlanType, PLAN_LIMITS } from "@/lib/plan-constants";

const NEAR_LIMIT_RATIO = 0.8;

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

async function countDailyCreatedLinks(userId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(link)
    .where(and(eq(link.userId, userId), gte(link.createdAt, startOfTodayUtc())));

  return result?.value ?? 0;
}

async function countActiveLinks(userId: string): Promise<number> {
  const [result] = await db
    .select({ value: count() })
    .from(link)
    .where(and(eq(link.userId, userId), eq(link.status, "active")));

  return result?.value ?? 0;
}

export async function evaluatePlanLimits(
  userId: string,
): Promise<PlanEvaluation> {
  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  const planType = getEffectivePlanType({
    planType: dbUser?.planType,
    planExpiresAt: dbUser?.planExpiresAt,
  });

  const limits = PLAN_LIMITS[planType];
  const dailyCreated = await countDailyCreatedLinks(userId);
  const activeLinks = await countActiveLinks(userId);

  const remainingDailyCreates =
    limits.dailyCreateLimit === null
      ? null
      : Math.max(limits.dailyCreateLimit - dailyCreated, 0);

  const remainingActiveLinks =
    limits.activeLinkLimit === null
      ? null
      : Math.max(limits.activeLinkLimit - activeLinks, 0);

  const isNearLimit =
    planType === "FREE" &&
    ((remainingDailyCreates !== null &&
      remainingDailyCreates <=
        limits.dailyCreateLimit! * (1 - NEAR_LIMIT_RATIO)) ||
      (remainingActiveLinks !== null &&
        remainingActiveLinks <=
          limits.activeLinkLimit! * (1 - NEAR_LIMIT_RATIO)));

  return {
    planType,
    dailyCreated,
    activeLinks,
    remainingDailyCreates,
    remainingActiveLinks,
    isNearLimit,
  };
}

export async function canCreateLink(
  userId: string,
): Promise<CanCreateLinkResult> {
  const evaluation = await evaluatePlanLimits(userId);

  if (evaluation.planType === "PRO") {
    return { allowed: true };
  }

  if (
    evaluation.remainingDailyCreates !== null &&
    evaluation.remainingDailyCreates <= 0
  ) {
    return {
      allowed: false,
      reason: "Free 플랜의 오늘 링크 생성 한도(5개)에 도달했습니다.",
    };
  }

  if (
    evaluation.remainingActiveLinks !== null &&
    evaluation.remainingActiveLinks <= 0
  ) {
    return {
      allowed: false,
      reason: "Free 플랜의 활성 링크 한도(30개)에 도달했습니다.",
    };
  }

  return { allowed: true };
}
