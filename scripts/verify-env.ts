import { config } from "dotenv";

import { getCronSecret } from "../lib/billing/config";

config({ path: ".env.local" });
config();

const REQUIRED = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_BETTER_AUTH_URL",
  "KAKAO_CLIENT_ID",
  "KAKAO_CLIENT_SECRET",
  "TOSS_CLIENT_KEY",
  "TOSS_SECRET_KEY",
  "NEXT_PUBLIC_TOSS_CLIENT_KEY",
  "PRO_MONTHLY_PRICE",
] as const;

function main() {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    console.error("Missing required environment variables:");
    for (const key of missing) {
      console.error(`  - ${key}`);
    }
    process.exit(1);
  }

  try {
    getCronSecret();
  } catch {
    console.error(
      "Missing required environment variables:\n  - CRON_SECRET (또는 VERCEL_CRON_SECRET)",
    );
    process.exit(1);
  }

  const price = Number.parseInt(process.env.PRO_MONTHLY_PRICE!, 10);
  if (!Number.isFinite(price) || price <= 0) {
    console.error("PRO_MONTHLY_PRICE must be a positive integer.");
    process.exit(1);
  }

  console.log("All required environment variables are set.");
}

main();
