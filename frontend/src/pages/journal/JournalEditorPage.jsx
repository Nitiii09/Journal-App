import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Unlock, ArrowRight } from "lucide-react";

import JournalEditor from "../../components/journal/JournalEditor";
import PageTransition from "../../components/layout/PageTransition";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import { toast } from "../../components/ui/Toast";
import useJournal from "../../hooks/useJournal";
import { playUnlockSequence } from "../../animations/gsapAnimations";
import { LOADING_MESSAGES } from "../../utils/constants";

/**
 * Write (or edit) today's entry.
 *
 * The backend allows exactly one entry per IST day, so this page decides
 * between POST /journals/create and PATCH /journals/today/edit based on
 * whether today's entry already exists — and a 409 from the server is
 * handled as a normal outcome, not a crash.
 */
export default function JournalEditorPage() {
  const navigate = useNavigate();
  const { todayJournal, stats, loading, create, editToday, reload } = useJournal();

  const [saving, setSaving] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Nodes handed to the GSAP timeline.
  const buttonRef = useRef(null);
  const spinnerRef = useRef(null);
  const checkRef = useRef(null);
  const lockWrapRef = useRef(null);
  const lockShackleRef = useRef(null);
  const waveRefs = useRef([]);
  const particleRefs = useRef([]);
  const headingRef = useRef(null);
  const cardRefs = useRef([]);
  const timelineRef = useRef(null);

  useEffect(() => () => timelineRef.current?.kill(), []);

  const isEditing = Boolean(todayJournal);

  const handleSave = async ({ content, isPublic }) => {
    setSaving(true);

    try {
      if (isEditing) {
        await editToday({ content, isPublic });
        toast.success("Today's page updated.", "Your friends see the new version.");
        setSaving(false);
        navigate("/", { replace: true });
        return;
      }

      await create({ content, isPublic });

      // Saved. Now play the signature sequence before revealing the feed.
      setUnlocked(true);
      timelineRef.current = playUnlockSequence(
        {
          button: buttonRef.current,
          spinner: spinnerRef.current,
          check: checkRef.current,
          lockWrap: lockWrapRef.current,
          lockShackle: lockShackleRef.current,
          waves: waveRefs.current.filter(Boolean),
          particles: particleRefs.current.filter(Boolean),
          heading: headingRef.current,
          cards: cardRefs.current.filter(Boolean),
        },
        {
          onComplete: () => toast.unlock("Today unlocked.", "Your friends' days are open."),
        }
      );
    } catch (error) {
      setSaving(false);

      // 409 — a page for today already exists. Recover into edit mode
      // instead of showing a dead end.
      if (error.status === 409) {
        toast.error("Today's page already exists.", "Switching you to editing it.");
        await reload();
        return;
      }

      toast.error("Couldn't save that.", error.message ?? "Try again in a moment.");
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <Loader message={LOADING_MESSAGES.journal} />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="relative">
      {/* Close — writing is a focused mode you step out of. */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Close editor"
        className="mb-8 inline-flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
      >
        <X className="h-4 w-4" strokeWidth={2.6} />
        Close
      </button>

      <JournalEditor
        initialContent={todayJournal?.content ?? ""}
        initialIsPublic={todayJournal?.isPublic ?? true}
        isEditing={isEditing}
        streak={stats.streak}
        saving={saving}
        saved={unlocked}
        onSave={handleSave}
        saveRefs={{ button: buttonRef, spinner: spinnerRef, check: checkRef }}
      />

      {/* ---------- The DAY UNLOCK overlay ---------- */}
      <AnimatePresence>
        {unlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-surface/95 frost px-6"
          >
            {/* expanding waves */}
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                ref={(el) => (waveRefs.current[i] = el)}
                className="pointer-events-none absolute h-48 w-48 rounded-full border-2 border-primary/40 opacity-0"
                aria-hidden="true"
              />
            ))}

            {/* scattering particles */}
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                ref={(el) => (particleRefs.current[i] = el)}
                className={`pointer-events-none absolute h-2 w-2 opacity-0 ${
                  ["bg-primary", "bg-secondary", "bg-tertiary-bright", "bg-lavender"][i % 4]
                }`}
                aria-hidden="true"
              />
            ))}

            {/* the lock */}
            <div ref={lockWrapRef} className="relative z-10 mb-10 opacity-0">
              <svg viewBox="0 0 64 64" className="h-24 w-24 text-primary" fill="none">
                <path
                  ref={lockShackleRef}
                  d="M20 28V19a12 12 0 0 1 24 0v9"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <rect
                  x="13"
                  y="28"
                  width="38"
                  height="30"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="5"
                />
                <circle cx="32" cy="41" r="3.5" fill="currentColor" />
                <path
                  d="M32 44v6"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div ref={headingRef} className="relative z-10 max-w-lg text-center opacity-0">
              <span className="mb-6 inline-flex items-center gap-2 border border-primary/30 bg-primary-fixed/60 px-4 py-2 font-display text-label-caps uppercase text-primary">
                <Unlock className="h-3.5 w-3.5" strokeWidth={2.6} />
                Today unlocked
              </span>

              <h2 className="font-display text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.03em] md:text-6xl">
                Friends&rsquo; days
              </h2>

              <p className="mx-auto mt-6 max-w-sm font-journal text-journal-body italic leading-relaxed text-on-surface-variant">
                You marked today. Their pages are open to you now.
              </p>
            </div>

            {/* the cards that reveal in sequence, step 11 */}
            <div className="relative z-10 mt-10 flex gap-4">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  ref={(el) => (cardRefs.current[i] = el)}
                  className="h-16 w-24 border border-outline-variant/60 bg-surface-lowest opacity-0 shadow-paper-sm md:h-20 md:w-32"
                  aria-hidden="true"
                />
              ))}
            </div>

            <Button
              iconRight={ArrowRight}
              size="lg"
              onClick={() => navigate("/", { replace: true })}
              className="relative z-10 mt-12"
            >
              Read their days
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
