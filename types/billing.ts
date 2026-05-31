export type PaymentStatus = "DONE" | "FAILED" | "CANCELED";

export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "PAST_DUE";

export type TossBillingKeyResponse = {
  mId: string;
  customerKey: string;
  billingKey: string;
  method: string;
  cardCompany?: string;
  cardNumber?: string;
  card?: { number?: string };
};

export type TossPaymentResponse = {
  paymentKey: string;
  orderId: string;
  status: string;
  approvedAt?: string;
  method?: string;
  totalAmount: number;
  card?: { number?: string };
  cardCompany?: string;
  receipt?: { url?: string };
  failure?: { message?: string };
};

export type PaymentRecord = {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  paidAt: Date | null;
  failureMessage: string | null;
  createdAt: Date;
};

export type SubscriptionDetails = {
  id: string;
  planType: "FREE" | "PRO";
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  lastPaymentAt: Date | null;
  createdAt: Date;
};
