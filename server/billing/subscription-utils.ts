import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { subscription, user } from "@/db/schema";
import {
  computeInitialPeriodEnd,
  computeNextPeriodEnd,
  isMonthlyPeriodTooShort,
} from "@/lib/billing/period";
import type { SubscriptionDetails } from "@/types/billing";

type SubscriptionRow = typeof subscription.$inferSelect;

/**
 * 구버전(다음 달 1일) 만료일로 저장된 Pro 구독을
 * 구독 시작일 + 1개월 기준으로 자동 보정한다.
 */
async function repairSubscriptionPeriodIfNeeded(
  sub: SubscriptionRow,
): Promise<SubscriptionRow> {
  if (sub.planType !== "PRO" || !sub.currentPeriodEnd) {
    return sub;
  }

  const anchor =
    sub.currentPeriodStart ?? sub.lastPaymentAt ?? sub.createdAt;
  const expectedEnd = computeInitialPeriodEnd(anchor);

  if (!isMonthlyPeriodTooShort(anchor, sub.currentPeriodEnd)) {
    return sub;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(subscription)
      .set({ currentPeriodEnd: expectedEnd })
      .where(eq(subscription.id, sub.id));

    await tx
      .update(user)
      .set({
        planType: "PRO",
        planExpiresAt: expectedEnd,
        updatedAt: new Date(),
      })
      .where(eq(user.id, sub.userId));
  });

  return { ...sub, currentPeriodEnd: expectedEnd };
}

export async function getSubscriptionByUserId(userId: string) {
  const sub = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  });

  if (!sub) {
    return null;
  }

  return repairSubscriptionPeriodIfNeeded(sub);
}

export function toSubscriptionDetails(
  row: typeof subscription.$inferSelect,
): SubscriptionDetails {
  return {
    id: row.id,
    planType: row.planType,
    status: row.status,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
    currentPeriodStart: row.currentPeriodStart,
    currentPeriodEnd: row.currentPeriodEnd,
    lastPaymentAt: row.lastPaymentAt,
    createdAt: row.createdAt,
  };
}

export async function ensureCustomerKey(userId: string): Promise<string> {
  const existing = await getSubscriptionByUserId(userId);

  if (!existing) {
    throw new Error("구독 정보를 찾을 수 없습니다.");
  }

  if (existing.customerKey) {
    return existing.customerKey;
  }

  const customerKey = crypto.randomUUID();

  await db
    .update(subscription)
    .set({ customerKey })
    .where(eq(subscription.id, existing.id));

  return customerKey;
}

export async function syncUserPlanFromSubscription(userId: string) {
  const sub = await getSubscriptionByUserId(userId);

  if (!sub) {
    return;
  }

  const now = Date.now();
  const isProActive =
    sub.planType === "PRO" &&
    sub.currentPeriodEnd !== null &&
    sub.currentPeriodEnd.getTime() > now;

  if (isProActive) {
    await db
      .update(user)
      .set({
        planType: "PRO",
        planExpiresAt: sub.currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));
    return;
  }

  await db
    .update(user)
    .set({
      planType: "FREE",
      planExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));

  if (sub.planType === "PRO") {
    await db
      .update(subscription)
      .set({ planType: "FREE", status: "ACTIVE", cancelAtPeriodEnd: false })
      .where(eq(subscription.id, sub.id));
  }
}

export function getInitialPeriodStart(now: Date = new Date()): Date {
  return now;
}

export function getInitialPeriodEnd(now: Date = new Date()): Date {
  return computeInitialPeriodEnd(now);
}

export function getNextPeriodEnd(currentEnd: Date): Date {
  return computeNextPeriodEnd(currentEnd);
}
