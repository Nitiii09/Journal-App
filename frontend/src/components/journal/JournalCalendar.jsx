import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildMonthGrid, istParts, isSameISTDay, isTodayIST } from "../../utils/dateUtils";
import { formatMonthYear } from "../../utils/formatDate";

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Month grid of the user's writing history. Filled days are entries; the
 * current day is outlined whether or not it has been written yet.
 */
export default function JournalCalendar({ journals = [], className = "" }) {
  const now = istParts();
  const [cursor, setCursor] = useState({ year: now.year, month: now.month });

  const cells = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month),
    [cursor.year, cursor.month]
  );

  const entryDates = journals.map((j) => ({
    date: j.journalDate,
    isPublic: j.isPublic,
  }));

  const shift = (delta) => {
    setCursor((prev) => {
      const next = new Date(Date.UTC(prev.year, prev.month + delta, 1));
      return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    });
  };

  const monthLabel = formatMonthYear(new Date(Date.UTC(cursor.year, cursor.month, 15)));
  const isCurrentMonth = cursor.year === now.year && cursor.month === now.month;

  return (
    <section className={`paper grain-panel p-6 ${className}`}>
      <header className="mb-5 flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-extrabold tracking-tight">
          {monthLabel}
        </h3>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="grid h-8 w-8 place-items-center border border-outline-variant/70 text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="grid h-8 w-8 place-items-center border border-outline-variant/70 text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:hover:border-outline-variant/70 disabled:hover:text-on-surface-variant"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </header>

      <div className="mb-2.5 grid grid-cols-7 gap-1">
        {WEEK_LABELS.map((label, i) => (
          <span
            key={i}
            className="text-center font-display text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/45"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <span key={`pad-${index}`} />;

          const entry = entryDates.find((e) => isSameISTDay(e.date, date));
          const today = isTodayIST(date);
          const dayNumber = istParts(date).day;

          return (
            <motion.span
              key={date.toISOString()}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: index * 0.008 }}
              title={entry ? (entry.isPublic ? "Public entry" : "Private entry") : undefined}
              className={`grid aspect-square place-items-center font-display text-xs font-bold transition-colors ${
                entry
                  ? entry.isPublic
                    ? "bg-primary text-on-primary"
                    : "bg-tertiary-bright text-on-surface"
                  : today
                    ? "border-2 border-dashed border-primary text-primary"
                    : "text-on-surface-variant/45"
              }`}
            >
              {dayNumber}
            </motion.span>
          );
        })}
      </div>

      <footer className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-outline-variant/50 pt-4">
        {[
          { className: "bg-primary", label: "Public" },
          { className: "bg-tertiary-bright", label: "Private" },
          { className: "border-2 border-dashed border-primary", label: "Today" },
        ].map((item) => (
          <span
            key={item.label}
            className="flex items-center gap-1.5 font-display text-[9px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/55"
          >
            <span className={`h-2.5 w-2.5 ${item.className}`} />
            {item.label}
          </span>
        ))}
      </footer>
    </section>
  );
}
