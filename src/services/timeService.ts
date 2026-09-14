/**
 * Time Service: Handles civil date calculation and midnight rollover in Brasília Time (UTC-3).
 * Uses Intl.DateTimeFormat with 'America/Sao_Paulo' for host-timezone-independent accuracy.
 */

const BRASILIA_TIMEZONE = "America/Sao_Paulo";

const brasiliaDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BRASILIA_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Validates strictly that a string is a valid civil calendar date (YYYY-MM-DD),
 * rejecting impossible dates like 2026-02-30 or 2026-13-45.
 */
export function isValidCivilDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Returns the current or reference date formatted as YYYY-MM-DD in Brasília Time.
 */
export function getBrasiliaCycleId(referenceDate: Date = new Date()): string {
  const parts = brasiliaDateFormatter.formatToParts(referenceDate);
  let year = "";
  let month = "";
  let day = "";
  for (const part of parts) {
    if (part.type === "year") year = part.value;
    else if (part.type === "month") month = part.value;
    else if (part.type === "day") day = part.value;
  }
  return `${year}-${month}-${day}`;
}

/**
 * Returns next cycle midnight Date in UTC (which corresponds to 00:00:00 Brasília Time).
 * In Brasília (UTC-3 year-round), midnight of the next day corresponds to 03:00:00 UTC.
 */
export function getNextCycleMidnight(referenceDate: Date = new Date()): Date {
  const cycleId = getBrasiliaCycleId(referenceDate);
  const [year, month, day] = cycleId.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1, 3, 0, 0, 0));
}

/**
 * Returns milliseconds remaining until the next cycle midnight in Brasília.
 */
export function getMillisecondsUntilNextCycle(referenceDate: Date = new Date()): number {
  const nextMidnight = getNextCycleMidnight(referenceDate);
  const diff = nextMidnight.getTime() - referenceDate.getTime();
  return Math.max(0, diff);
}
