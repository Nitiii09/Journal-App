import { toISTWallClock, istParts, diffISTDays } from "./dateUtils";
import { stripMarkdown } from "./markdown";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * All formatters read the IST wall-clock, never the browser's locale clock,
 * so the date shown always matches the day the backend filed the entry under.
 */

/** "SUNDAY · AUGUST 16 · 2026" — the dashboard dateline. */
export function formatDateline(date = new Date()) {
  const { year, month, day, weekday } = istParts(date);
  return `${WEEKDAYS[weekday]} · ${MONTHS[month]} ${day} · ${year}`.toUpperCase();
}

/** "August 16, 2026" */
export function formatLong(date) {
  if (!date) return "";
  const { year, month, day } = istParts(date);
  return `${MONTHS[month]} ${day}, ${year}`;
}

/** "Aug 16" */
export function formatShort(date) {
  if (!date) return "";
  const { month, day } = istParts(date);
  return `${MONTHS[month].slice(0, 3)} ${day}`;
}

/** { month: "Oct", day: "12" } — for the timeline date markers. */
export function formatStacked(date) {
  if (!date) return { month: "", day: "" };
  const { month, day } = istParts(date);
  return { month: MONTHS[month].slice(0, 3), day: String(day) };
}

/** Single letter weekday — the 7-day activity strip. */
export function formatWeekdayInitial(date) {
  if (!date) return "";
  return WEEKDAYS[istParts(date).weekday].charAt(0);
}

export function formatMonthYear(date) {
  const { month, year } = istParts(date);
  return `${MONTHS[month]} ${year}`;
}

/** "2 HOURS AGO" / "JUST NOW" / "YESTERDAY" — feed timestamps. */
export function formatRelative(date) {
  if (!date) return "";
  const then = new Date(date);
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);

  if (seconds < 60) return "JUST NOW";
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} MINUTE${m === 1 ? "" : "S"} AGO`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} HOUR${h === 1 ? "" : "S"} AGO`;
  }

  const days = diffISTDays(new Date(), then);
  if (days === 1) return "YESTERDAY";
  if (days < 7) return `${days} DAYS AGO`;
  return formatShort(then).toUpperCase();
}

/** "9:42 PM" in IST. */
export function formatISTTime(date) {
  if (!date) return "";
  const w = toISTWallClock(date);
  const hours = w.getUTCHours();
  const minutes = String(w.getUTCMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${minutes} ${period}`;
}

/**
 * Trim journal content to a preview without cutting mid-word.
 *
 * Entries are Markdown, so the syntax is removed first — a card preview
 * reading "## My Day - Went to **college**" would expose the markup the
 * reader is meant never to see.
 */
export function excerpt(text = "", max = 180) {
  const clean = stripMarkdown(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export function wordCount(text = "") {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Rough reading time, floored at one minute. Counts prose, not syntax. */
export function readingTime(text = "") {
  return Math.max(1, Math.round(wordCount(stripMarkdown(text)) / 200));
}
