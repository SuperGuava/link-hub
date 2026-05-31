import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { activateSubscriptionFromBillingAuth } from "@/server/billing/subscribe";
import { requireSession } from "@/server/auth/session";

function parseBillingSuccessQuery(params: Record<string, string | string[] | undefined>) {
  const customerKey =
    typeof params.customerKey === "string" ? params.customerKey : null;
  const authKey = typeof params.authKey === "string" ? params.authKey : null;

  if (!customerKey || customerKey.length < 2 || customerKey.length > 300) {
    return null;
  }

  if (!authKey || authKey.length < 1 || authKey.length > 300) {
    return null;
  }

  return { customerKey, authKey };
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BillingSuccessPage({ searchParams }: PageProps) {
  const session = await requireSession();
  const params = await searchParams;

  const parsed = parseBillingSuccessQuery(params);

  if (!parsed) {
    return (
      <div className="mx-auto max-w-lg py-12">
        <Card>
          <CardHeader>
            <CardTitle>결제 정보 오류</CardTitle>
            <CardDescription>
              카드 등록 결과를 확인할 수 없습니다. 다시 시도해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ButtonLink href="/pricing">요금제로 돌아가기</ButtonLink>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    await activateSubscriptionFromBillingAuth({
      userId: session.user.id,
      customerKey: parsed.customerKey,
      authKey: parsed.authKey,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "구독 활성화에 실패했습니다.";

    return (
      <div className="mx-auto max-w-lg py-12">
        <Card>
          <CardHeader>
            <CardTitle>구독 활성화 실패</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <ButtonLink href="/pricing">다시 시도</ButtonLink>
            <ButtonLink variant="outline" href="/dashboard">
              대시보드
            </ButtonLink>
          </CardContent>
        </Card>
      </div>
    );
  }

  redirect("/dashboard?subscribed=1");
}
