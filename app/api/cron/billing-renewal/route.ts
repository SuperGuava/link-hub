import { NextRequest, NextResponse } from "next/server";

import { getCronSecret } from "@/lib/billing/config";
import { shouldRunBillingCron } from "@/lib/billing/period";
import { renewDueSubscriptions } from "@/server/billing/subscribe";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${getCronSecret()}`;

  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "1";
  const ignoreExpiry =
    force && request.nextUrl.searchParams.get("ignoreExpiry") === "1";

  if (!force && !shouldRunBillingCron()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Not within KST billing renewal window",
    });
  }

  const result = await renewDueSubscriptions({
    ignorePeriodEnd: ignoreExpiry,
  });

  return NextResponse.json({
    ok: true,
    skipped: false,
    testMode: ignoreExpiry,
    result,
  });
}
