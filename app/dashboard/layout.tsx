import Link from "next/link";

import { PlanBadge } from "@/features/auth/components/plan-badge";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { getEffectivePlanType } from "@/lib/plan-constants";
import { requireSession } from "@/server/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const planType = getEffectivePlanType({
    planType: session.user.planType,
    planExpiresAt: session.user.planExpiresAt,
  });

  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-lg font-semibold">
              LinkHub
            </Link>
            <PlanBadge planType={planType} />
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/subscription"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              구독 관리
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
