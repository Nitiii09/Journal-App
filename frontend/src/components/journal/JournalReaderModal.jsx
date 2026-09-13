import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Globe, EyeOff, Clock, ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Markdown from "../ui/Markdown";
import SunMark from "../ui/SunMark";
import {
  formatLong,
  formatISTTime,
  readingTime,
  wordCount,
} from "../../utils/formatDate";
import { stripMarkdown } from "../../utils/markdown";

/**
 * Full-entry reader.
 *
 * Cards truncate at 300 characters for layout; the complete text is already
 * in memory from the list request, so opening this costs no extra round-trip.
 * That matters because the API has no "fetch one journal by id" route —
 * without this, a friend's long entry simply could not be read in full.
 *
 * Rendered in a portal so it escapes any card's overflow/transform context.
 */
export default function JournalReaderModal({
  journal,
  authorName,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) {
  // Escape closes; arrows move between entries in the feed.
  useEffect(() => {
    if (!journal) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key === "ArrowLeft" && hasPrev) onPrev?.();
      if (event.key === "ArrowRight" && hasNext) onNext?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [journal, onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!journal) return null;

  const author =
    authorName ??
    (typeof journal.userId === "object" ? journal.userId?.username : null);

  const friendId =
    typeof journal.userId === "object" ? journal.userId?._id : journal.userId;

  const edited =
    journal.updatedAt &&
    journal.createdAt &&
    new Date(journal.updatedAt).getTime() - new Date(journal.createdAt).getTime() >
      60000;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto p-4 py-8 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="fixed inset-0 bg-on-surface/50 frost"
      />

      <motion.article
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={`Entry by ${author ?? "you"}`}
        className="relative z-10 w-full max-w-3xl bg-surface-lowest shadow-paper-lg grain-panel"
      >

        {/* Header */}
        <header className="relative z-10 flex flex-wrap items-start justify-between gap-4 border-b border-outline-variant/60 px-6 py-5 md:px-10">
          <div className="flex min-w-0 items-center gap-3.5">
            {author && <Avatar username={author} size="md" />}
            <div className="min-w-0">
              {author && (
                <p className="truncate font-display text-base font-extrabold tracking-tight">
                  @{author}
                </p>
              )}
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-annotation text-[11px] tracking-[0.12em] text-on-surface-variant/60">
                <span>{formatLong(journal.journalDate)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" strokeWidth={2.4} />
                  {formatISTTime(journal.createdAt)} IST
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Badge
              tone={journal.isPublic ? "secondary" : "neutral"}
              size="sm"
              icon={journal.isPublic ? Globe : EyeOff}
            >
              {journal.isPublic ? "Public" : "Private"}
            </Badge>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center border border-outline-variant/70 text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary"
            >
              <X className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        </header>

        {/* The entry, in full — no truncation here. */}
        <div className="relative z-10 px-6 py-9 md:px-14 md:py-12">
          <SunMark className="pointer-events-none absolute right-5 top-5 h-8 w-8 text-outline-variant/30" />

          {/* Entries are Markdown; render them formatted rather than raw. */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <Markdown>{journal.content}</Markdown>
          </motion.div>

          <p className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-outline-variant/50 pt-5 font-annotation text-[11px] tracking-[0.12em] text-on-surface-variant/50">
            <span>{wordCount(stripMarkdown(journal.content))} words</span>
            <span>{readingTime(journal.content)} min read</span>
            {edited && <span className="italic">Edited {formatISTTime(journal.updatedAt)} IST</span>}
          </p>
        </div>

        {/* Footer: paging through the feed, and a way to the author's archive */}
        <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/60 px-6 py-4 md:px-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              className="flex items-center gap-1.5 border border-outline-variant/70 px-3 py-2 font-display text-label-caps-sm uppercase text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:hover:border-outline-variant/70 disabled:hover:text-on-surface-variant"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.6} />
              Prev
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-1.5 border border-outline-variant/70 px-3 py-2 font-display text-label-caps-sm uppercase text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:hover:border-outline-variant/70 disabled:hover:text-on-surface-variant"
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.6} />
            </button>
          </div>

          {author && friendId && (
            <Link
              to={`/friends/${friendId}`}
              onClick={onClose}
              className="group flex items-center gap-1.5 font-display text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
            >
              All of @{author}&rsquo;s pages
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                strokeWidth={2.6}
              />
            </Link>
          )}
        </footer>
      </motion.article>
    </div>,
    document.body
  );
}
