import { and, eq, lte } from "drizzle-orm";

import { db } from "@/db/client";
import { payment, subscription, user } from "@/db/schema";
import { createOrderId, getProMonthlyPrice } from "@/lib/billing/config";
import {
  getInitialPeriodEnd,
  getInitialPeriodStart,
  getNextPeriodEnd,
  getSubscriptionByUserId,
} from "@/server/billing/subscription-utils";
import { chargeBilling, issueBillingKey, TossApiError } from "@/server/billing/toss";

export async function activateSubscriptionFromBillingAuth(input: {
  userId: string;
  customerKey: string;
  authKey: string;
}) {
  const sub = await getSubscriptionByUserId(input.userId);

  if (!sub) {
    throw new Error("구독 정보를 찾을 수 없습니다.");
  }

  if (sub.customerKey !== input.customerKey) {
    throw new Error("customerKey가 일치하지 않습니다.");
  }

  const billing = await issueBillingKey({
    authKey: input.authKey,
    customerKey: input.customerKey,
  });

  const amount = getProMonthlyPrice();
  const orderId = createOrderId(input.userId);
  const now = new Date();
  const periodStart = getInitialPeriodStart(now);
  const periodEnd = getInitialPeriodEnd(now);

  const charge = await chargeBilling({
    billingKey: billing.billingKey,
    customerKey: input.customerKey,
    amount,
    orderId,
  });

  await db.transaction(async (tx) => {
    await tx
      .update(subscription)
      .set({
        planType: "PRO",
        status: "ACTIVE",
        billingKey: billing.billingKey,
        cancelAtPeriodEnd: false,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        lastPaymentAt: charge.approvedAt,
      })
      .where(eq(subscription.id, sub.id));

    await tx.insert(payment).values({
      userId: input.userId,
      subscriptionId: sub.id,
      orderId: charge.orderId,
      paymentKey: charge.paymentKey,
      amount: charge.totalAmount,
      method: charge.method,
      status: "DONE",
      paidAt: charge.approvedAt,
    });

    await tx
      .update(user)
      .set({
        planType: "PRO",
        planExpiresAt: periodEnd,
        updatedAt: new Date(),
      })
      .where(eq(user.id, input.userId));
  });

  return { periodEnd };
}

export type RenewalResult = {
  processed: number;
  succeeded: number;
  failed: number;
  expired: number;
};

export type RenewalOptions = {
  /** true면 currentPeriodEnd 미만료 구독도 갱신 결제 시도 (Cron 테스트 전용) */
  ignorePeriodEnd?: boolean;
};

export async function renewDueSubscriptions(
  options: RenewalOptions = {},
): Promise<RenewalResult> {
  const { ignorePeriodEnd = false } = options;
  const now = new Date();
  const dueSubs = await db.query.subscription.findMany({
    where: and(
      eq(subscription.planType, "PRO"),
      eq(subscription.status, "ACTIVE"),
      eq(subscription.cancelAtPeriodEnd, false),
    ),
  });

  const result: RenewalResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    expired: 0,
  };

  for (const sub of dueSubs) {
    if (!sub.billingKey || !sub.customerKey) {
      continue;
    }

    if (
      !sub.currentPeriodEnd ||
      (!ignorePeriodEnd && sub.currentPeriodEnd.getTime() > now.getTime())
    ) {
      continue;
    }

    result.processed += 1;

    const orderId = createOrderId(sub.userId);
    const amount = getProMonthlyPrice();

    try {
      const charge = await chargeBilling({
        billingKey: sub.billingKey,
        customerKey: sub.customerKey,
        amount,
        orderId,
      });

      const nextEnd = getNextPeriodEnd(sub.currentPeriodEnd);

      await db.transaction(async (tx) => {
        await tx
          .update(subscription)
          .set({
            status: "ACTIVE",
            currentPeriodStart: sub.currentPeriodEnd,
            currentPeriodEnd: nextEnd,
            lastPaymentAt: charge.approvedAt,
          })
          .where(eq(subscription.id, sub.id));

        await tx.insert(payment).values({
          userId: sub.userId,
          subscriptionId: sub.id,
          orderId: charge.orderId,
          paymentKey: charge.paymentKey,
          amount: charge.totalAmount,
          method: charge.method,
          status: "DONE",
          paidAt: charge.approvedAt,
        });

        await tx
          .update(user)
          .set({
            planType: "PRO",
            planExpiresAt: nextEnd,
            updatedAt: new Date(),
          })
          .where(eq(user.id, sub.userId));
      });

      result.succeeded += 1;
    } catch (error) {
      const message =
        error instanceof TossApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "알 수 없는 오류";

      await db.transaction(async (tx) => {
        await tx
          .update(subscription)
          .set({ status: "PAST_DUE" })
          .where(eq(subscription.id, sub.id));

        await tx.insert(payment).values({
          userId: sub.userId,
          subscriptionId: sub.id,
          orderId,
          amount,
          method: "카드",
          status: "FAILED",
          failureMessage: message,
        });
      });

      result.failed += 1;
    }
  }

  result.expired += await expireEndedSubscriptions(now);

  return result;
}

export async function expireEndedSubscriptions(now: Date = new Date()): Promise<number> {
  const ended = await db.query.subscription.findMany({
    where: and(
      eq(subscription.planType, "PRO"),
      lte(subscription.currentPeriodEnd, now),
    ),
  });

  let count = 0;

  for (const sub of ended) {
    if (!sub.currentPeriodEnd) {
      continue;
    }

    await db.transaction(async (tx) => {
      await tx
        .update(subscription)
        .set({
          planType: "FREE",
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
          billingKey: null,
          customerKey: sub.customerKey,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          lastPaymentAt: null,
        })
        .where(eq(subscription.id, sub.id));

      await tx
        .update(user)
        .set({
          planType: "FREE",
          planExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, sub.userId));
    });

    count += 1;
  }

  return count;
}
