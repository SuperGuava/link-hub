import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateLinkForm } from "@/features/links/components/create-link-form";
import { LinkList } from "@/features/links/components/link-list";
import { SubscriptionSummaryCard } from "@/features/billing/components/subscription-summary-card";
import { PlanQuotaCard } from "@/features/auth/components/plan-quota-card";
import { canCreateLink, evaluatePlanLimits } from "@/lib/plan";
import { listLinksByUser } from "@/server/links/list-links";
import {
  getSubscriptionByUserId,
  toSubscriptionDetails,
} from "@/server/billing/subscription-utils";
import { requireSession } from "@/server/auth/session";

export default async function DashboardPage() {
  const session = await requireSession();
  const [evaluation, links, createPermission, subRow] = await Promise.all([
    evaluatePlanLimits(session.user.id),
    listLinksByUser(session.user.id),
    canCreateLink(session.user.id),
    getSubscriptionByUserId(session.user.id),
  ]);

  const subscription = subRow ? toSubscriptionDetails(subRow) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">대시보드</h1>
        <p className="mt-1 text-muted-foreground">
          안녕하세요, {session.user.name}님. 링크를 만들고 목록에서 관리하세요.
        </p>
      </div>

      <SubscriptionSummaryCard
        subscription={subscription}
        userPlanType={session.user.planType}
        userPlanExpiresAt={session.user.planExpiresAt}
      />

      <PlanQuotaCard evaluation={evaluation} />

      <CreateLinkForm
        planType={evaluation.planType}
        canCreate={createPermission.allowed}
        disabledReason={
          createPermission.allowed ? undefined : createPermission.reason
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>내 링크</CardTitle>
          <CardDescription>
            생성한 단축 링크 {links.length}개
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkList links={links} />
        </CardContent>
      </Card>
    </div>
  );
}
