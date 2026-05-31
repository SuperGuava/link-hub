import { config } from "dotenv";

import { getCronSecret } from "../lib/billing/config";

config({ path: ".env.local" });
config();

export function loadCronBillingEnv() {
  return {
    baseUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:3002",
    cronSecret: getCronSecret(),
  };
}
