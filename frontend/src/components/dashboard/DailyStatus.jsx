import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Check, PenLine, ArrowRight, Eye, Globe, EyeOff } from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { excerpt, formatISTTime } from "../../utils/formatDate";
import { EASE } from "../../animations/pageVariants";

/**
 * The product's central state display: today is either UNMARKED or MARKED.
 * Everything else on the dashboard follows from this one fact.
 */
export default function DailyStatus({ journal, onReadFriends, className = "" }) {
  const navigate = useNavigate();
  const marked = Boolean(journal);

  return (
    <section
      className={`relative overflow-hidden paper grain-panel ${className}`}
      aria-live="polite"
    >
      {/* washi tape anchoring the card to the page */}
      <span
        className={`washi -left-4 -top-3 h-8 w-28 rotate-[-6deg] ${
          marked ? "bg-tertiary-bright/50" : "bg-primary-fixed/70"
        }`}
      />

      {/* Keyed remount rather than AnimatePresence: this block must always
          show the current state, and a `mode="wait"` exit that can't finish
          (background tab, interrupted animation) would strand the old one. */}
      <motion.div
        key={marked ? "marked" : "unmarked"}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="relative z-10 p-7 md:p-10"
      >
          <p className="label-caps mb-7 flex items-center gap-2 text-on-surface-variant/60">
            <span className="italic">Your daily ritual</span>
            <ArrowRight className="h-3 w-3" strokeWidth={2.6} />
          </p>

          {/* The status seal — lock when closed, check when open. */}
          <div className="mb-7 flex items-start gap-5">
            <motion.span
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.1 }}
              className={`grid h-14 w-14 shrink-0 place-items-center border-2 ${
                marked
                  ? "border-tertiary bg-tertiary-fixed text-tertiary"
                  : "border-primary bg-primary-fixed text-primary"
              }`}
            >
              {marked ? (
                <Check className="h-6 w-6" strokeWidth={3} />
              ) : (
                <Lock className="h-5 w-5" strokeWidth={2.4} />
              )}
            </motion.span>

            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[1.4rem] font-bold uppercase leading-tight tracking-tight md:text-[1.7rem]">
                {marked ? (
                  <>
                    Today is marked{" "}
                    <span className="text-tertiary">✓</span>
                  </>
                ) : (
                  "Today is unmarked"
                )}
              </h2>

              <p className="mt-3 max-w-md font-journal text-journal-body leading-relaxed text-on-surface-variant text-pretty">
                {marked
                  ? "Your friends’ days are unlocked. Go and read what they left behind."
                  : "The page is waiting. Write today’s entry to unlock your friends."}
              </p>
            </div>
          </div>

          {/* Once written, show a preview of the entry itself. */}
          {marked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.15 }}
              className="mb-7 overflow-hidden"
            >
              <div className="border-l-2 border-outline-variant pl-5">
                <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
                  <Badge tone={journal.isPublic ? "secondary" : "neutral"} size="sm"
                    icon={journal.isPublic ? Globe : EyeOff}>
                    {journal.isPublic ? "Public to friends" : "Private"}
                  </Badge>
                  <span className="font-annotation text-[11px] tracking-wider text-on-surface-variant/50">
                    Written {formatISTTime(journal.createdAt)} IST
                  </span>
                </div>

                <p className="font-journal text-[17px] leading-relaxed text-on-surface-variant/90">
                  {excerpt(journal.content, 190)}
                </p>
              </div>
            </motion.div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {marked ? (
              <>
                <Button onClick={onReadFriends} icon={Eye} iconRight={ArrowRight}>
                  Read friends&rsquo; days
                </Button>
                <Button
                  variant="ghost"
                  icon={PenLine}
                  onClick={() => navigate("/journal/write")}
                >
                  Edit today
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                icon={PenLine}
                iconRight={ArrowRight}
                onClick={() => navigate("/journal/write")}
              >
                Write today
              </Button>
            )}
        </div>
      </motion.div>
    </section>
  );
}
