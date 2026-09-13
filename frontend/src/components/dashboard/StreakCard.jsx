import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Flame, PenLine } from "lucide-react";
import { countUp } from "../../animations/gsapAnimations";
import { lastISTDays, isSameISTDay } from "../../utils/dateUtils";
import { formatWeekdayInitial, formatShort } from "../../utils/formatDate";

/**
 * Oversized numeral + a 7-day activity strip. The number counts up via GSAP;
 * each day in the strip is filled, hollow, or (today) outlined and waiting.
 */
export default function StreakCard({ streak = 0, journals = [], className = "" }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const tween = countUp(streak, setShown, { duration: 1.5, delay: 0.35 });
    return () => tween?.kill();
  }, [streak]);

  const week = lastISTDays(7);
  const writtenDates = journals.map((j) => j.journalDate);

  return (
    <section className={`relative overflow-hidden paper grain-panel p-7 ${className}`}>
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-tertiary-fixed/40 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <p className="label-caps mb-5 flex items-center gap-2 text-on-surface-variant/60">
          <Flame className="h-3.5 w-3.5 text-primary" strokeWidth={2.6} />
          Current momentum
        </p>

        <div className="mb-2 flex items-end gap-4">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-5xl font-bold leading-none tracking-[-0.03em] text-primary tabular-nums"
          >
            {shown}
          </motion.span>
          <span className="pb-1.5 font-display text-base font-bold uppercase leading-tight tracking-tight">
            Day
            <br />
            Streak
          </span>
        </div>

        <p className="mb-7 font-journal text-[15px] italic leading-snug text-on-surface-variant">
          {streak > 0
            ? `${streak} day${streak === 1 ? "" : "s"} of showing up for yourself.`
            : "No streak yet. Today is a good place to start."}
        </p>

        {/* 7-day activity strip */}
        <div className="flex items-end justify-between gap-1.5">
          {week.map((date, index) => {
            const written = writtenDates.some((d) => isSameISTDay(d, date));
            const isToday = index === week.length - 1;

            return (
              <div key={date.toISOString()} className="flex flex-1 flex-col items-center gap-2">
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 22,
                    delay: 0.5 + index * 0.055,
                  }}
                  title={`${formatShort(date)}${written ? " — written" : ""}`}
                  className={`grid aspect-square w-full max-w-[38px] place-items-center border-2 transition-colors ${
                    written
                      ? "border-primary bg-primary text-on-primary"
                      : isToday
                        ? "border-dashed border-primary/70 bg-primary-fixed/40 text-primary"
                        : "border-outline-variant/70 bg-surface-container text-transparent"
                  }`}
                >
                  <PenLine className="h-3.5 w-3.5" strokeWidth={2.6} />
                </motion.span>

                <span
                  className={`font-display text-[10px] font-bold uppercase tracking-wider ${
                    isToday ? "text-primary" : "text-on-surface-variant/45"
                  }`}
                >
                  {formatWeekdayInitial(date)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
