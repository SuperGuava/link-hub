const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** UTC Date → KST wall-clock parts */
function getKstParts(date: Date) {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return {
    year: kst.getUTCFullYear(),
    month: kst.getUTCMonth(),
    date: kst.getUTCDate(),
    hour: kst.getUTCHours(),
    minute: kst.getUTCMinutes(),
  };
}

/** KST wall-clock → UTC Date */
function fromKstParts(
  year: number,
  month: number,
  date: number,
  hour: number,
  minute: number,
  second: number,
  ms: number,
): Date {
  return new Date(
    Date.UTC(year, month, date, hour, minute, second, ms) - KST_OFFSET_MS,
  );
}

function daysInKstMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/**
 * KST 기준으로 months개월 더한 뒤, 해당일 23:59:59.999 KST 반환.
 * (5/31 + 1개월 → 6/30 23:59:59 KST)
 */
function addMonthsKstEndOfDay(from: Date, months: number): Date {
  const { year, month, date } = getKstParts(from);
  let targetYear = year;
  let targetMonth = month + months;

  while (targetMonth > 11) {
    targetMonth -= 12;
    targetYear += 1;
  }

  while (targetMonth < 0) {
    targetMonth += 12;
    targetYear -= 1;
  }

  const targetDate = Math.min(date, daysInKstMonth(targetYear, targetMonth));

  return fromKstParts(targetYear, targetMonth, targetDate, 23, 59, 59, 999);
}

/** 구독 시작 시점 + 1개월 (KST, 해당일 23:59:59까지 이용) */
export function computeInitialPeriodEnd(from: Date = new Date()): Date {
  return addMonthsKstEndOfDay(from, 1);
}

/** 갱신: 현재 만료일 + 1개월 */
export function computeNextPeriodEnd(currentEnd: Date): Date {
  return addMonthsKstEndOfDay(currentEnd, 1);
}

/** 월간 구독 최소 이용 기간(일) — 이보다 짧으면 잘못된 만료일로 간주 */
const MIN_MONTHLY_PERIOD_DAYS = 25;

export function isMonthlyPeriodTooShort(
  periodStart: Date,
  periodEnd: Date,
): boolean {
  const durationMs = periodEnd.getTime() - periodStart.getTime();
  return durationMs < MIN_MONTHLY_PERIOD_DAYS * 24 * 60 * 60 * 1000;
}

/** 매일 03:00 KST ±30분 — 자동 갱신 Cron 실행 윈도우 */
export function shouldRunBillingCron(now: Date = new Date()): boolean {
  const { hour, minute } = getKstParts(now);

  if (hour === 3) {
    return true;
  }

  if (hour === 2 && minute >= 30) {
    return true;
  }

  if (hour === 4 && minute <= 30) {
    return true;
  }

  return false;
}
