import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, EyeOff, ArrowRight, Pencil } from "lucide-react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { excerpt, formatRelative, formatShort, readingTime } from "../../utils/formatDate";
import { paperDrop } from "../../animations/staggerAnimations";
import { accentFor } from "../../utils/constants";
import { stripMarkdown } from "../../utils/markdown";

/**
 * A single journal entry.
 *
 * Two modes:
 *  - `feed`  — a friend's entry: identity row on top, content is the hero.
 *  - `own`   — your own archive entry: date-led, with visibility state.
 *
 * The written words are always the largest thing on the card. Decoration
 * frames them; it never competes with them.
 */
const JournalCard = forwardRef(function JournalCard(
  { journal, mode = "feed", authorName, to, onClick, index = 0, className = "" },
  ref
) {
  // Only some endpoints populate the author: /journals/friends/today returns
  // userId as { _id, username }, while /journals/friend/:id/today returns a
  // bare ObjectId. `authorName` lets the caller supply the name it already
  // knows, so the card never renders an empty "@".
  const author =
    typeof journal.userId === "object" && journal.userId !== null ? journal.userId : null;
  const username = authorName ?? author?.username ?? "";
  const accent = accentFor(username || journal._id);

  // 300 is the excerpt limit. Measured after stripping Markdown, since the
  // excerpt is too — otherwise syntax-heavy entries would claim to be
  // truncated when the visible text actually fits.
  const isTruncated = stripMarkdown(journal.content).length > 300;

  const Wrapper = onClick ? "button" : to ? Link : "div";
  const wrapperProps = onClick
    ? { type: "button", onClick }
    : to
      ? { to }
      : {};

  // Only promise "read full entry" when there is something more to read and
  // an actual way to open it.
  const canOpen = Boolean(onClick || to);
  const showFooter = canOpen && (isTruncated || mode === "own");

  return (
    <motion.article
      ref={ref}
      variants={paperDrop}
      whileHover={{ y: -5, x: -2 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative break-inside-avoid ${className}`}
    >
      <Wrapper
        {...wrapperProps}
        className="block w-full text-left paper grain-panel transition-shadow duration-300 group-hover:shadow-paper-lg"
      >
        {/* thin accent rule along the top edge */}
        <span
          className={`absolute inset-x-0 top-0 h-[3px] ${
            {
              primary: "bg-primary",
              secondary: "bg-secondary",
              tertiary: "bg-tertiary-bright",
              lavender: "bg-lavender",
              mint: "bg-mint",
            }[accent]
          }`}
          aria-hidden="true"
        />

        <div className="relative z-10 p-6 md:p-7">
          {mode === "feed" ? (
            <header className="mb-5 flex items-center gap-3 border-b border-outline-variant/50 pb-4">
              <Avatar username={username} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold tracking-tight">
                  @{username}
                </p>
                <p className="mt-0.5 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/50">
                  {formatRelative(journal.createdAt)}
                </p>
              </div>
            </header>
          ) : (
            <header className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-2xl font-extrabold leading-none tracking-tight text-primary">
                  {formatShort(journal.journalDate)}
                </span>
                <span className="font-annotation text-[11px] tracking-[0.12em] text-on-surface-variant/45">
                  {readingTime(journal.content)} min read
                </span>
              </div>

              <Badge
                tone={journal.isPublic ? "secondary" : "neutral"}
                size="sm"
                icon={journal.isPublic ? Globe : EyeOff}
              >
                {journal.isPublic ? "Public" : "Private"}
              </Badge>
            </header>
          )}

          {/* The content — the primary visual element. */}
          <p className="font-journal text-journal-body leading-relaxed text-on-surface text-pretty">
            {excerpt(journal.content, 300)}
          </p>

          {showFooter && (
            <footer className="mt-6 flex items-center justify-between border-t border-outline-variant/50 pt-4">
              <span className="flex items-center gap-1.5 font-display text-label-caps-sm uppercase text-on-surface-variant/60 transition-colors group-hover:text-primary">
                {mode === "own" ? (
                  <>
                    <Pencil className="h-3 w-3" strokeWidth={2.6} />
                    Read full entry
                  </>
                ) : (
                  "Read full entry"
                )}
              </span>
              <ArrowRight
                className="h-4 w-4 text-on-surface-variant/50 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
                strokeWidth={2.4}
              />
            </footer>
          )}
        </div>
      </Wrapper>
    </motion.article>
  );
});

export default JournalCard;
