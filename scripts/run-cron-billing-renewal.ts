import { loadCronBillingEnv } from "./load-cron-env";

const force = process.argv.includes("--force");
const { baseUrl, cronSecret } = loadCronBillingEnv();

const url = new URL("/api/cron/billing-renewal", baseUrl);
if (force) {
  url.searchParams.set("force", "1");
}

async function main() {
  console.log(`Calling ${url.toString()} ...`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  });

  const body = await response.text();
  console.log(`Status: ${response.status}`);
  console.log(body);

  if (!response.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
