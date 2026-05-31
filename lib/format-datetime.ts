const DISPLAY_TIME_ZONE = "Asia/Seoul";

export type DateInput = Date | string | null | undefined;

function parseDateValue(value: DateInput): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatKstParts(
  date: Date,
  options: { includeTime: boolean },
): string {
  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: DISPLAY_TIME_ZONE,
  };

  if (options.includeTime) {
    formatOptions.hour = "numeric";
    formatOptions.minute = "2-digit";
    formatOptions.hour12 = true;
  }

  const parts = new Intl.DateTimeFormat("ko-KR", formatOptions).formatToParts(
    date,
  );

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");

  if (!options.includeTime) {
    return `${year}. ${month}. ${day}.`;
  }

  const hour = get("hour");
  const minute = get("minute");
  const dayPeriod = get("dayPeriod");

  return `${year}. ${month}. ${day}. ${dayPeriod} ${hour}:${minute}`;
}

/** KST 날짜 (예: 2026. 5. 31.) */
export function formatKstDate(value: DateInput): string {
  const date = parseDateValue(value);

  if (!date) {
    return "—";
  }

  return formatKstParts(date, { includeTime: false });
}

/** KST 날짜·시간 (예: 2026. 5. 31. 오후 3:05) */
export function formatKstDateTime(value: DateInput): string {
  const date = parseDateValue(value);

  if (!date) {
    return "—";
  }

  return formatKstParts(date, { includeTime: true });
}

/** @deprecated formatKstDateTime과 동일 — 링크 목록 등 기존 호출 호환 */
export function formatDisplayDateTime(value: DateInput): string {
  const formatted = formatKstDateTime(value);
  return formatted === "—" ? "-" : formatted;
}
