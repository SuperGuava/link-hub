import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { payment } from "@/db/schema";
import type { PaymentRecord } from "@/types/billing";

export async function listPaymentsByUserId(
  userId: string,
  limit = 20,
): Promise<PaymentRecord[]> {
  const rows = await db.query.payment.findMany({
    where: eq(payment.userId, userId),
    orderBy: [desc(payment.createdAt)],
    limit,
  });

  return rows.map((row) => ({
    id: row.id,
    orderId: row.orderId,
    amount: row.amount,
    method: row.method,
    status: row.status,
    paidAt: row.paidAt,
    failureMessage: row.failureMessage,
    createdAt: row.createdAt,
  }));
}
