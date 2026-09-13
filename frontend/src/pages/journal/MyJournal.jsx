import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, PenLine } from "lucide-react";

import PageTransition from "../../components/layout/PageTransition";
import JournalTimeline from "../../components/journal/JournalTimeline";
import JournalCalendar from "../../components/journal/JournalCalendar";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Loader from "../../components/ui/Loader";
import { SunDivider } from "../../components/ui/SunMark";
import useJournal from "../../hooks/useJournal";
import { LOADING_MESSAGES } from "../../utils/constants";

function StatPip({ value, label, tone = "tertiary" }) {
  const dot = {
    tertiary: "bg-tertiary-bright",
    primary: "bg-primary",
    secondary: "bg-secondary",
  }[tone];

  return (
    <span className="flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {value} {label}
    </span>
  );
}

export default function MyJournal() {
  const navigate = useNavigate();
  const { journals, stats, loading, error, reload } = useJournal();

  if (loading) {
    return (
      <PageTransition>
        <Loader message={LOADING_MESSAGES.journal} />
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <ErrorState error={error} onRetry={reload} />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-7xl">
      <header className="relative mb-12">
        <span
          className="watermark absolute -left-2 -top-10 hidden text-[11rem] lg:block"
          aria-hidden="true"
        >
          {stats.total}
        </span>

        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="font-display text-[2rem] font-bold uppercase leading-[1.05] tracking-[-0.025em] text-primary sm:text-4xl lg:text-5xl"
          >
            Your story
          </motion.h1>

          {/* Mobile: oversized numerals side by side, per the mobile design. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex items-start gap-10 lg:hidden"
          >
            {[
              { value: stats.total, label: stats.total === 1 ? "Entry" : "Entries" },
              { value: stats.streak, label: "Day Streak" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl font-bold leading-none tracking-[-0.03em] tabular-nums">
                  {stat.value}
                </p>
                <p className="label-caps mt-1.5 text-on-surface-variant/70">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 hidden flex-wrap items-center gap-x-7 gap-y-3 lg:flex"
          >
            <StatPip
              value={stats.total}
              label={stats.total === 1 ? "Entry" : "Entries"}
              tone="tertiary"
            />
            <StatPip value={stats.streak} label="Day streak" tone="primary" />
            <StatPip value={`${stats.consistency}%`} label="Consistency" tone="secondary" />
          </motion.div>
        </div>
      </header>

      {journals.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Your story is still blank."
          body="Your first page is waiting. It doesn't have to be good — it just has to be today."
          actionLabel="Write today"
          onAction={() => navigate("/journal/write")}
        />
      ) : (
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-gutter">
          <JournalTimeline journals={journals} />

          {/* Context panel — sticky on desktop, stacked above on mobile. */}
          <aside className="order-first lg:order-last">
            <div className="lg:sticky lg:top-24 lg:space-y-6">
              <JournalCalendar journals={journals} />

              <button
                type="button"
                onClick={() => navigate("/journal/write")}
                className="hidden w-full items-center justify-center gap-2 border-2 border-primary bg-primary px-6 py-3.5 font-display text-label-caps uppercase text-on-primary shadow-press-primary transition-colors hover:bg-primary-bright lg:flex"
              >
                <PenLine className="h-4 w-4" strokeWidth={2.6} />
                Write today
              </button>
            </div>
          </aside>
        </div>
      )}

      <SunDivider className="mt-16" />
    </PageTransition>
  );
}
