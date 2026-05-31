import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlanBadge } from "@/features/auth/components/plan-badge";
import { PLAN_LIMITS } from "@/lib/plan-constants";
import type { PlanEvaluation } from "@/types/plan";

type PlanQuotaCardProps = {
  evaluation: PlanEvaluation;
};

function formatQuota(used: number, limit: number | null) {
  if (limit === null) {
    return {
      primary: String(used),
      secondary: "무제한",
    };
  }

  return {
    primary: `${used} / ${limit}`,
    secondary: `${Math.max(limit - used, 0)}개 남음`,
  };
}

export function PlanQuotaCard({ evaluation }: PlanQuotaCardProps) {
  const { planType, dailyCreated, activeLinks, isNearLimit } = evaluation;
  const limits = PLAN_LIMITS[planType];
  const dailyQuota = formatQuota(dailyCreated, limits.dailyCreateLimit);
  const activeQuota = formatQuota(activeLinks, limits.activeLinkLimit);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>내 플랜</CardTitle>
          <PlanBadge planType={planType} />
        </div>
        <CardDescription>
          {planType === "PRO"
            ? "Pro 플랜으로 링크 생성과 활성 링크 모두 제한 없이 이용할 수 있습니다."
            : `Free 플랜은 하루 ${limits.dailyCreateLimit}개 생성, 활성 링크 ${limits.activeLinkLimit}개까지 이용할 수 있습니다.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">오늘 생성한 링크</p>
            <p className="mt-1 text-2xl font-semibold">{dailyQuota.primary}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {dailyQuota.secondary}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">활성 링크</p>
            <p className="mt-1 text-2xl font-semibold">{activeQuota.primary}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeQuota.secondary}
            </p>
          </div>
        </div>

        {isNearLimit && planType === "FREE" ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
            <p className="font-medium">한도가 거의 찼습니다.</p>
            <p className="mt-1">
              Pro 플랜으로 업그레이드하면 생성 한도와 활성 링크 제한을
              해제할 수 있습니다.{" "}
              <Link href="/pricing" className="font-medium underline">
                요금제 보기
              </Link>
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
