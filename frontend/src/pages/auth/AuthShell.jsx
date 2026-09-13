import { motion } from "framer-motion";
import SunMark from "../../components/ui/SunMark";
import ThemeToggle from "../../components/ui/ThemeToggle";

/**
 * Shared split layout for login and signup: a statement on the left, the
 * form on the right.
 *
 * Previously this had drifting watermark words, cursor parallax and two
 * blurred colour washes. All of it moved while you were trying to type a
 * password, so it's gone — a single angled sheet is enough to suggest paper.
 */
export default function AuthShell({ headline, subline, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-[8%] top-[6%] hidden h-[70%] w-[38%] rotate-[3deg] border border-outline-variant/30 bg-surface-lowest/30 lg:block" />
      </div>

      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle compact />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-14 px-6 py-14 md:px-10 lg:grid-cols-[1.05fr_minmax(0,26rem)] lg:gap-20 lg:px-margin-desktop">
        {/* Left — the statement */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 inline-flex items-center gap-2.5"
          >
            <SunMark className="h-7 w-7 text-primary" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">
              Daymark
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl font-display text-[2rem] font-bold uppercase leading-[1.05] tracking-[-0.025em] sm:text-4xl xl:text-5xl"
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-8 max-w-md font-journal text-journal-quote italic leading-snug text-on-surface-variant text-pretty"
          >
            {subline}
          </motion.p>
        </div>

        {/* Right — the form sheet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full"
        >
          <div className="relative rounded-lg border border-outline-variant/60 bg-surface-lowest px-7 py-9 shadow-paper md:px-9 md:py-11">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
