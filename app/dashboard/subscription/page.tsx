import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CancelSubscriptionButton } from "@/features/billing/components/cancel-subscription-button";
import { PaymentHistoryTable } from "@/features/billing/components/payment-history-table";
import { ResumeSubscriptionButton } from "@/features/billing/components/resume-subscription-button";
import { PlanQuotaCard } from "@/features/auth/components/plan-quota-card";
import { formatKstDate, formatKstDateTime } from "@/lib/format-datetime";
import { evaluatePlanLimits } from "@/lib/plan";
import { getEffectivePlanType } from "@/lib/plan-constants";
import { listPaymentsByUserId } from "@/server/billing/list-payments";
import {
  getSubscriptionByUserId,
  toSubscriptionDetails,
} from "@/server/billing/subscription-utils";
import { requireSession } from "@/server/auth/session";

export default async function SubscriptionPage() {
  const session = await requireSession();
  const [subRow, payments, evaluation] = await Promise.all([
    getSubscriptionByUserId(session.user.id),
    listPaymentsByUserId(session.user.id),
    evaluatePlanLimits(session.user.id),
  ]);

  const subscription = subRow ? toSubscriptionDetails(subRow) : null;
  const effectivePlan = getEffectivePlanType({
    planType: session.user.planType,
    planExpiresAt: session.user.planExpiresAt,
  });

  const isPro = effectivePlan === "PRO";
  const periodEndLabel = formatKstDate(subscription?.currentPeriodEnd);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">구독 관리</h1>
        <p className="mt-1 text-muted-foreground">
          플랜 정보, 결제 이력, 구독 취소를 관리합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>현재 플랜</CardTitle>
            <Badge variant={isPro ? "pro" : "free"}>
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
          <CardDescription>
            {isPro ? "월간 자동 갱신 구독" : "무료 플랜"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">구독 시작일</dt>
              <dd className="font-medium">
                {subscription?.currentPeriodStart
                  ? formatKstDate(subscription.currentPeriodStart)
                  : subscription?.createdAt && isPro
                    ? formatKstDate(subscription.createdAt)
                    : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">이용 만료일</dt>
              <dd className="font-medium">
                {isPro ? `${periodEndLabel} 23:59까지` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">마지막 결제일</dt>
              <dd className="font-medium">
                {subscription?.lastPaymentAt
                  ? formatKstDateTime(subscription.lastPaymentAt)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">구독 상태</dt>
              <dd className="font-medium">
                {subscription?.cancelAtPeriodEnd
                  ? `취소 예약 (${periodEndLabel}까지 이용)`
                  : subscription?.status === "PAST_DUE"
                    ? "결제 실패 (유예 중)"
                    : isPro
                      ? "활성"
                      : "Free"}
              </dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            {isPro &&
            subscription?.status === "ACTIVE" &&
            !subscription.cancelAtPeriodEnd ? (
              <CancelSubscriptionButton periodEndLabel={periodEndLabel} />
            ) : null}
            {isPro && subscription?.cancelAtPeriodEnd ? (
              <ResumeSubscriptionButton />
            ) : null}
            {!isPro ? (
              <ButtonLink href="/pricing">Pro 업그레이드</ButtonLink>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {!isPro ? (
        <PlanQuotaCard evaluation={evaluation} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>결제 이력</CardTitle>
          <CardDescription>최근 20건</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentHistoryTable payments={payments} />
        </CardContent>
      </Card>
    </div>
  );
}
