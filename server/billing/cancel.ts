import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { subscription } from "@/db/schema";
import { getSubscriptionByUserId } from "@/server/billing/subscription-utils";

export async function cancelSubscriptionAtPeriodEnd(userId: string) {
  const sub = await getSubscriptionByUserId(userId);

  if (!sub) {
    throw new Error("구독 정보를 찾을 수 없습니다.");
  }

  if (sub.planType !== "PRO") {
    throw new Error("Pro 구독이 아닙니다.");
  }

  if (sub.cancelAtPeriodEnd) {
    return { currentPeriodEnd: sub.currentPeriodEnd };
  }

  await db
    .update(subscription)
    .set({
      status: "CANCELED",
      cancelAtPeriodEnd: true,
    })
    .where(eq(subscription.id, sub.id));

  return { currentPeriodEnd: sub.currentPeriodEnd };
}

export async function resumeSubscription(userId: string) {
  const sub = await getSubscriptionByUserId(userId);

  if (!sub) {
    throw new Error("구독 정보를 찾을 수 없습니다.");
  }

  if (sub.planType !== "PRO" || !sub.cancelAtPeriodEnd) {
    throw new Error("취소 예약된 구독이 아닙니다.");
  }

  await db
    .update(subscription)
    .set({
      status: "ACTIVE",
      cancelAtPeriodEnd: false,
    })
    .where(eq(subscription.id, sub.id));
}
