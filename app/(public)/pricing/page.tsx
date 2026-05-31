import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubscribeButton } from "@/features/billing/components/subscribe-button";
import { getTossClientKey, getProMonthlyPrice } from "@/lib/billing/config";
import { formatKstDate } from "@/lib/format-datetime";
import { getEffectivePlanType } from "@/lib/plan-constants";
import {
  getSubscriptionByUserId,
  toSubscriptionDetails,
} from "@/server/billing/subscription-utils";
import { getSession } from "@/server/auth/session";

export default async function PricingPage() {
  const session = await getSession();
  const monthlyPrice = getProMonthlyPrice();
  const clientKey = getTossClientKey();

  let planType: "FREE" | "PRO" = "FREE";
  let periodEnd: Date | null = null;

  if (session) {
    planType = getEffectivePlanType({
      planType: session.user.planType,
      planExpiresAt: session.user.planExpiresAt,
    });

    const sub = await getSubscriptionByUserId(session.user.id);
    if (sub) {
      periodEnd = toSubscriptionDetails(sub).currentPeriodEnd;
    }
  }

  const formattedPrice = new Intl.NumberFormat("ko-KR").format(monthlyPrice);

  return (
    <div className="mx-auto flex min-h-full max-w-4xl flex-col gap-8 px-4 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">요금제</h1>
        <p className="text-muted-foreground">
          월간 자동 갱신 · 언제든 취소 가능 · 취소 시 만료일까지 Pro 이용
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Free</CardTitle>
              <Badge variant="free">기본</Badge>
            </div>
            <CardDescription>개인·소규모 캠페인 시작용</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>하루 링크 생성 5개</p>
            <p>활성 링크 30개</p>
            <p>자동 슬러그</p>
          </CardContent>
          <CardFooter>
            <p className="text-lg font-semibold">무료</p>
          </CardFooter>
        </Card>

        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pro</CardTitle>
              <Badge variant="pro">추천</Badge>
            </div>
            <CardDescription>팀·반복 캠페인 운영용</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>링크 생성·활성 링크 무제한</p>
            <p>커스텀 슬러그, 만료일, 클릭 제한</p>
            <p className="text-muted-foreground">
              구독 시작일 기준 1개월 · 매일 03:00 (KST) 자동 갱신
            </p>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-3">
            <p className="text-lg font-semibold">₩{formattedPrice}/월</p>
            {!session ? (
              <ButtonLink href="/login?callbackUrl=/pricing">
                카카오로 시작하기
              </ButtonLink>
            ) : planType === "PRO" ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  현재 Pro 이용 중
                  {periodEnd ? ` · 만료 ${formatKstDate(periodEnd)}` : ""}
                </p>
                <ButtonLink variant="outline" href="/dashboard/subscription">
                  구독 관리
                </ButtonLink>
              </div>
            ) : (
              <SubscribeButton
                clientKey={clientKey}
                customerEmail={session.user.email}
                customerName={session.user.name}
                className="w-full"
              />
            )}
          </CardFooter>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        결제는 Toss Payments 자동결제(빌링)로 안전하게 처리됩니다.
      </p>

      <p className="text-center text-sm">
        <Link href={session ? "/dashboard" : "/login"} className="underline">
          {session ? "대시보드로" : "로그인으로"} 돌아가기
        </Link>
      </p>
    </div>
  );
}
