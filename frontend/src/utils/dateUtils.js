import { IST_OFFSET_MINUTES } from "./constants";

/**
 * The backend normalises every journal date to midnight IST (UTC+5:30).
 * The browser's local timezone is irrelevant to what "today" means here —
 * a user in New York writing at 11pm is already on tomorrow's IST page.
 * These helpers mirror backend/src/utils/dateHelper.js exactly.
 */

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;
const IST_MS = IST_OFFSET_MINUTES * MS_PER_MINUTE;

/** The UTC instant corresponding to midnight IST of the given date. */
export function getStartOfISTDay(date = new Date()) {
  const shifted = new Date(date.getTime() + IST_MS);
  return new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - IST_MS
  );
}

/** A Date whose UTC fields read as the IST wall-clock — for display only. */
export function toISTWallClock(date = new Date()) {
  return new Date(new Date(date).getTime() + IST_MS);
}

/** Calendar parts of a date, as seen in IST. */
export function istParts(date = new Date()) {
  const w = toISTWallClock(date);
  return {
    year: w.getUTCFullYear(),
    month: w.getUTCMonth(),
    day: w.getUTCDate(),
    weekday: w.getUTCDay(),
    hour: w.getUTCHours(),
    minute: w.getUTCMinutes(),
  };
}

/** Are these two instants the same IST calendar day? */
export function isSameISTDay(a, b) {
  if (!a || !b) return false;
  return getStartOfISTDay(new Date(a)).getTime() === getStartOfISTDay(new Date(b)).getTime();
}

/** Is this instant today, in IST? */
export function isTodayIST(date) {
  return isSameISTDay(date, new Date());
}

/** Shift by whole IST days. */
export function addISTDays(date, days) {
  return new Date(getStartOfISTDay(date).getTime() + days * MS_PER_DAY);
}

/** Whole IST days between two instants (a - b). */
export function diffISTDays(a, b) {
  return Math.round((getStartOfISTDay(a) - getStartOfISTDay(b)) / MS_PER_DAY);
}

/** "morning" | "afternoon" | "evening" | "night", by IST clock. */
export function greetingPeriod(date = new Date()) {
  const { hour } = istParts(date);
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

export function greetingFor(date = new Date()) {
  return `Good ${greetingPeriod(date)}`;
}

/** The last `count` IST days, oldest first — powers the 7-day activity strip. */
export function lastISTDays(count = 7, from = new Date()) {
  const today = getStartOfISTDay(from);
  return Array.from({ length: count }, (_, i) =>
    new Date(today.getTime() - (count - 1 - i) * MS_PER_DAY)
  );
}

/**
 * Longest run of consecutive IST days ending today (or yesterday — a streak
 * survives until the IST day actually rolls over).
 */
export function computeStreak(dates = []) {
  if (!dates.length) return 0;

  const unique = [
    ...new Set(dates.map((d) => getStartOfISTDay(new Date(d)).getTime())),
  ].sort((a, b) => b - a);

  const today = getStartOfISTDay().getTime();
  if (unique[0] !== today && unique[0] !== today - MS_PER_DAY) return 0;

  let streak = 1;
  for (let i = 1; i < unique.length; i += 1) {
    if (unique[i - 1] - unique[i] === MS_PER_DAY) streak += 1;
    else break;
  }
  return streak;
}

/** Calendar grid (leading blanks + days) for an IST month. */
export function buildMonthGrid(year, month) {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leading = first.getUTCDay();

  const cells = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(Date.UTC(year, month, day) - IST_MS));
  }
  return cells;
}
