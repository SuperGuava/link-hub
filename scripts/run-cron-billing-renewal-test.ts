/**
 * Cron 갱신 결제 테스트 스크립트.
 *
 * 구독 만료일(currentPeriodEnd)이 아직 지나지 않았어도
 * ACTIVE Pro 구독에 대해 갱신 결제를 시도합니다.
 *
 * 사용법: pnpm cron:billing:test
 * 전제: pnpm dev 로 개발 서버가 실행 중이어야 합니다.
 */
import { loadCronBillingEnv } from "./load-cron-env";

const { baseUrl, cronSecret } = loadCronBillingEnv();

const url = new URL("/api/cron/billing-renewal", baseUrl);
url.searchParams.set("force", "1");
url.searchParams.set("ignoreExpiry", "1");

async function main() {
  console.log("=== Cron billing TEST mode ===");
  console.log("만료일과 관계없이 ACTIVE Pro 구독에 갱신 결제를 시도합니다.");
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
