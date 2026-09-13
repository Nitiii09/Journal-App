import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, PenLine, ArrowRight } from "lucide-react";
import Button from "../ui/Button";

/**
 * The gate.
 *
 * Before the user has written today, their friends' entries exist but must
 * stay unreadable. We render *decoy* cards — plausible shapes with no real
 * content — under a frosted layer. Nothing sensitive is ever in the DOM,
 * so blurred text can't be recovered by inspecting the page.
 */

const DECOY_LINES = [
  [92, 78, 86, 54],
  [88, 94, 62],
  [76, 90, 84, 70, 48],
  [95, 66],
];

function DecoyCard({ lines, index }) {
  return (
    <div
      className={`paper-flat grain-panel p-6 ${index % 2 === 1 ? "md:translate-y-8" : ""}`}
      aria-hidden="true"
    >
      <div className="mb-5 flex items-center gap-3 border-b border-outline-variant/40 pb-4">
        <span className="h-9 w-9 rounded-lg bg-surface-high" />
        <div className="flex-1 space-y-2">
          <span className="block h-2.5 w-24 bg-surface-high" />
          <span className="block h-2 w-14 bg-surface-high/70" />
        </div>
      </div>

      <div className="space-y-3.5">
        {lines.map((width, i) => (
          <span
            key={i}
            className="block h-3 bg-surface-high"
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function LockedJournalFeed({ friendCount = 0, className = "" }) {
  const navigate = useNavigate();
  return (
    <section className={`relative ${className}`}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-xl font-bold uppercase tracking-tight md:text-2xl">
          Their words are waiting.
        </h2>
        <p className="font-journal text-[15px] italic text-on-surface-variant/70">
          Write yours first to unlock the circle.
        </p>
      </div>

      <div className="relative overflow-hidden border border-outline-variant/60">
        {/* Decoy content — blurred, inert, and empty of real words. */}
        <div className="grid select-none gap-gutter p-6 blur-[7px] md:grid-cols-2 lg:grid-cols-3 lg:p-8">
          {DECOY_LINES.concat(DECOY_LINES.slice(0, 2)).map((lines, i) => (
            <DecoyCard key={i} lines={lines} index={i} />
          ))}
        </div>

        {/* Frosted lock layer */}
        <div className="absolute inset-0 flex items-center justify-center bg-surface/75 frost">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-md px-6 py-16 text-center"
          >
            {/* The lock. Previously ringed by a looping pulse — the gate is
                already clear from the blur and the copy, so it sits still. */}
            <div className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-lg border border-primary/50 bg-surface-lowest text-primary">
              <Lock className="h-6 w-6" strokeWidth={2} />
            </div>

            <h3 className="font-display text-2xl font-bold uppercase leading-tight tracking-tight md:text-3xl">
              Write yours first.
            </h3>

            <p className="mx-auto mt-5 max-w-sm font-journal text-journal-body italic leading-relaxed text-on-surface-variant text-pretty">
              {friendCount > 0
                ? `${friendCount} ${friendCount === 1 ? "friend has" : "friends have"} already marked today. The circle is quiet until you speak.`
                : "Your friends’ words are waiting. The circle is quiet until you speak."}
            </p>

            <Button
              size="lg"
              icon={PenLine}
              iconRight={ArrowRight}
              onClick={() => navigate("/journal/write")}
              className="mt-9"
            >
              Write today
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
