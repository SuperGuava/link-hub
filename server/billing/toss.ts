import {
  createOrderId,
  formatCardMethod,
  getProMonthlyPrice,
  getSubscriptionOrderName,
  getTossSecretKey,
} from "@/lib/billing/config";
import type {
  TossBillingKeyResponse,
  TossPaymentResponse,
} from "@/types/billing";

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

export class TossApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "TossApiError";
  }
}

function getAuthorizationHeader(): string {
  const secretKey = getTossSecretKey();
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

async function tossFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${TOSS_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: getAuthorizationHeader(),
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = (await response.json().catch(() => ({}))) as T & {
    code?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new TossApiError(
      body.message ?? `Toss API 오류 (${response.status})`,
      body.code,
      response.status,
    );
  }

  return body;
}

export async function issueBillingKey(input: {
  authKey: string;
  customerKey: string;
}): Promise<{
  billingKey: string;
  method: string;
  cardLabel: string;
}> {
  const data = await tossFetch<TossBillingKeyResponse>(
    "/billing/authorizations/issue",
    {
      method: "POST",
      body: JSON.stringify({
        authKey: input.authKey,
        customerKey: input.customerKey,
      }),
    },
  );

  const cardNumber = data.card?.number ?? data.cardNumber;

  return {
    billingKey: data.billingKey,
    method: data.method,
    cardLabel: formatCardMethod(data.cardCompany, cardNumber),
  };
}

export async function chargeBilling(input: {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName?: string;
}): Promise<{
  paymentKey: string;
  orderId: string;
  approvedAt: Date;
  method: string;
  totalAmount: number;
  receiptUrl?: string;
}> {
  const data = await tossFetch<TossPaymentResponse>(
    `/billing/${encodeURIComponent(input.billingKey)}`,
    {
      method: "POST",
      body: JSON.stringify({
        customerKey: input.customerKey,
        amount: input.amount,
        orderId: input.orderId,
        orderName: input.orderName ?? getSubscriptionOrderName(),
      }),
    },
  );

  const cardNumber = data.card?.number;
  const method = formatCardMethod(data.cardCompany, cardNumber ?? data.method);

  return {
    paymentKey: data.paymentKey,
    orderId: data.orderId,
    approvedAt: data.approvedAt ? new Date(data.approvedAt) : new Date(),
    method,
    totalAmount: data.totalAmount,
    receiptUrl: data.receipt?.url,
  };
}

export { createOrderId, getProMonthlyPrice, getSubscriptionOrderName };
