const ORDER_NAME = "LinkHub Pro 월간 구독";

export function getProMonthlyPrice(): number {
  const raw = process.env.PRO_MONTHLY_PRICE;
  const price = raw ? Number.parseInt(raw, 10) : NaN;

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("PRO_MONTHLY_PRICE 환경 변수가 올바르지 않습니다.");
  }

  return price;
}

export function getTossClientKey(): string {
  const key =
    process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? process.env.TOSS_CLIENT_KEY;

  if (!key) {
    throw new Error("TOSS_CLIENT_KEY 환경 변수가 설정되지 않았습니다.");
  }

  return key;
}

export function getTossSecretKey(): string {
  const key = process.env.TOSS_SECRET_KEY;

  if (!key) {
    throw new Error("TOSS_SECRET_KEY 환경 변수가 설정되지 않았습니다.");
  }

  return key;
}

const CRON_SECRET_ENV_KEYS = [
  "CRON_SECRET",
  "VERCEL_CRON_SECRET",
  "Vercel_CRON_SECRET",
] as const;

export function getCronSecret(): string {
  for (const key of CRON_SECRET_ENV_KEYS) {
    const secret = process.env[key]?.trim();
    if (secret) {
      return secret;
    }
  }

  throw new Error(
    "CRON_SECRET 환경 변수가 설정되지 않았습니다. .env.local에 CRON_SECRET=... 를 추가하세요.",
  );
}

export function createOrderId(userId: string): string {
  const suffix = userId.replace(/-/g, "").slice(0, 8);
  return `lh_${suffix}_${Date.now()}`;
}

export function getSubscriptionOrderName(): string {
  return ORDER_NAME;
}

export function formatCardMethod(
  cardCompany?: string | null,
  cardNumber?: string | null,
): string {
  if (cardCompany && cardNumber) {
    return `${cardCompany} ${cardNumber}`;
  }

  if (cardNumber) {
    return cardNumber;
  }

  return "카드";
}
