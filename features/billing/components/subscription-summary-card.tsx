import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatKstDate } from "@/lib/format-datetime";
import type { SubscriptionDetails } from "@/types/billing";
import { getEffectivePlanType } from "@/lib/plan-constants";

type SubscriptionSummaryCardProps = {
  subscription: SubscriptionDetails | null;
  userPlanType: string | null | undefined;
  userPlanExpiresAt: Date | string | null | undefined;
};

function statusLabel(status: SubscriptionDetails["status"], cancelAtPeriodEnd: boolean) {
  if (cancelAtPeriodEnd && status === "CANCELED") {
    return "취소 예약";
  }

  switch (status) {
    case "ACTIVE":
      return "활성";
    case "CANCELED":
      return "취소됨";
    case "PAST_DUE":
      return "결제 실패";
    default:
      return status;
  }
}

export function SubscriptionSummaryCard({
  subscription,
  userPlanType,
  userPlanExpiresAt,
}: SubscriptionSummaryCardProps) {
  const effectivePlan = getEffectivePlanType({
    planType: userPlanType,
    planExpiresAt: userPlanExpiresAt,
  });

  const isPro = effectivePlan === "PRO";
  const periodEnd = subscription?.currentPeriodEnd ?? userPlanExpiresAt ?? null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">구독</CardTitle>
          <CardDescription>
            {isPro ? "Pro 월간 구독" : "Free 플랜 이용 중"}
          </CardDescription>
        </div>
        <Badge variant={isPro ? "pro" : "free"}>{isPro ? "Pro" : "Free"}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm">
          {isPro && subscription ? (
            <>
              <p>
                상태:{" "}
                <span className="font-medium">
                  {statusLabel(subscription.status, subscription.cancelAtPeriodEnd)}
                </span>
              </p>
              <p>
                이용 만료일:{" "}
                <span className="font-medium">{formatKstDate(periodEnd)} 23:59까지</span>
              </p>
              {subscription.cancelAtPeriodEnd ? (
                <p className="text-muted-foreground">
                  만료일까지 Pro 기능을 이용할 수 있습니다.
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground">
              Pro로 업그레이드하면 링크 생성·고급 옵션을 무제한 이용할 수
              있습니다.
            </p>
          )}
        </div>
        <ButtonLink variant="outline" href="/dashboard/subscription">
          구독 관리
        </ButtonLink>
      </CardContent>
    </Card>
  );
}
