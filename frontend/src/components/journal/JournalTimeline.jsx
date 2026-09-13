import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, EyeOff, ArrowRight } from "lucide-react";
import Badge from "../ui/Badge";
import { excerpt, formatStacked, readingTime } from "../../utils/formatDate";
import { timelineItem } from "../../animations/cardAnimations";
import { staggerContainer } from "../../animations/staggerAnimations";
import { isTodayIST } from "../../utils/dateUtils";

/**
 * Chronological archive.
 *
 * Mobile stacks a small date chip above a full-width card — a 375px screen
 * can't spare ~90px for a date column. Desktop keeps the vertical rail with
 * large stacked date markers.
 *
 * Two ways to open an entry:
 *   `linkable` — navigate to /journal/:id (only valid for your own archive,
 *                since the API has no route for someone else's by id)
 *   `onSelect` — hand the entry back to the parent, which opens the reader
 *                using content already in memory (friends' archives)
 */
export default function JournalTimeline({
  journals = [],
  linkable = true,
  onSelect,
  className = "",
}) {
  const openable = Boolean(linkable || onSelect);
  const Entry = onSelect ? "button" : linkable ? Link : "div";

  return (
    <motion.ol
      variants={staggerContainer(0.07)}
      initial="initial"
      animate="animate"
      className={`relative ${className}`}
    >
      {/* the rail — desktop only */}
      <span
        className="absolute bottom-6 left-[3.35rem] top-6 hidden w-px bg-outline-variant lg:block"
        aria-hidden="true"
      />

      {journals.map((journal) => {
        const { month, day } = formatStacked(journal.journalDate);
        const today = isTodayIST(journal.journalDate);

        return (
          <motion.li
            key={journal._id}
            variants={timelineItem}
            className="relative pb-8 lg:flex lg:gap-8"
          >
            {/* ---- Mobile: date chip above the card ---- */}
            <div className="relative mb-3 flex items-center gap-2.5 lg:hidden">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  today ? "bg-primary" : "bg-outline-variant"
                }`}
                aria-hidden="true"
              />
              <span className="relative">
                <span className="relative font-display text-label-caps uppercase tracking-[0.12em] text-on-surface">
                  {month} {day}
                </span>
              </span>
            </div>

            {/* ---- Desktop: stacked date marker on the rail ---- */}
            <div className="relative z-10 hidden shrink-0 lg:block">
              <div
                className={`flex h-[6.7rem] w-[6.7rem] flex-col items-center justify-center border-2 ${
                  today
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant bg-surface-lowest text-primary"
                }`}
              >
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] opacity-70">
                  {month}
                </span>
                <span className="font-display text-4xl font-extrabold leading-none tracking-tight">
                  {day}
                </span>
              </div>
            </div>

            {/* ---- The entry ---- */}
            <Entry
              {...(onSelect
                ? { type: "button", onClick: () => onSelect(journal) }
                : linkable
                  ? { to: `/journal/${journal._id}` }
                  : {})}
              className={`group relative block w-full min-w-0 flex-1 text-left paper grain-panel p-5 sm:p-6 lg:p-7 ${
                openable ? "transition-shadow duration-300 hover:shadow-paper-lg" : ""
              }`}
            >
              <div className="relative z-10">
                <div className="mb-3 flex flex-wrap items-center gap-2.5 lg:mb-4">
                  <Badge
                    tone={journal.isPublic ? "secondary" : "neutral"}
                    size="sm"
                    icon={journal.isPublic ? Globe : EyeOff}
                  >
                    {journal.isPublic ? "Public" : "Private"}
                  </Badge>
                  {today && (
                    <Badge tone="primary" size="sm">
                      Today
                    </Badge>
                  )}
                  <span className="font-annotation text-[11px] tracking-[0.12em] text-on-surface-variant/45">
                    {readingTime(journal.content)} min read
                  </span>
                </div>

                <p className="font-journal text-[17px] leading-relaxed text-on-surface text-pretty sm:text-journal-body">
                  {excerpt(journal.content, 240)}
                </p>

                {openable && (
                  <span className="mt-4 flex items-center gap-1.5 font-display text-label-caps-sm uppercase text-on-surface-variant/55 transition-colors group-hover:text-primary lg:mt-5">
                    Read full entry
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                      strokeWidth={2.6}
                    />
                  </span>
                )}
              </div>
            </Entry>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
