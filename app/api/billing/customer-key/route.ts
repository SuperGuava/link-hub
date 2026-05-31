import { NextResponse } from "next/server";

import { ensureCustomerKey } from "@/server/billing/subscription-utils";
import { getSession } from "@/server/auth/session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerKey = await ensureCustomerKey(session.user.id);

  return NextResponse.json({ customerKey });
}
