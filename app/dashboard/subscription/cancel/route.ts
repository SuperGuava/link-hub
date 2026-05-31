import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { cancelSubscriptionAtPeriodEnd } from "@/server/billing/cancel";
import { getSession } from "@/server/auth/session";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await cancelSubscriptionAtPeriodEnd(session.user.id);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/subscription");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "구독 취소에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
