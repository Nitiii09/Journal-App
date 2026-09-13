import { motion } from "framer-motion";
import { Globe, EyeOff, Clock, Pencil } from "lucide-react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
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
 * Full-entry reading view — a single column of large serif text with wide
 * margins. Everything else recedes so the writing can be read.
 */
export default function JournalReader({ journal, author, onEdit, canEdit = false }) {
  if (!journal) return null;

  const username =
    author ??
    (typeof journal.userId === "object" ? journal.userId?.username : null);

  const edited =
    journal.updatedAt &&
    journal.createdAt &&
    new Date(journal.updatedAt).getTime() - new Date(journal.createdAt).getTime() > 60000;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-3xl"
    >
      <header className="mb-9">
        <p className="label-caps mb-4 text-primary">
          {formatLong(journal.journalDate)}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-6">
          <div className="flex items-center gap-3.5">
            {username && <Avatar username={username} size="md" />}
            <div>
              {username && (
                <p className="font-display text-lg font-extrabold tracking-tight">
                  @{username}
                </p>
              )}
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-annotation text-[11px] tracking-[0.12em] text-on-surface-variant/55">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" strokeWidth={2.4} />
                  {formatISTTime(journal.createdAt)} IST
                </span>
                <span>{wordCount(stripMarkdown(journal.content))} words</span>
                <span>{readingTime(journal.content)} min read</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              tone={journal.isPublic ? "secondary" : "neutral"}
              icon={journal.isPublic ? Globe : EyeOff}
            >
              {journal.isPublic ? "Public to friends" : "Private"}
            </Badge>

            {canEdit && (
              <Button variant="ghost" size="sm" icon={Pencil} onClick={onEdit}>
                Edit
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* The entry itself. */}
      <div className="relative bg-surface-lowest px-7 py-10 shadow-paper md:px-14 md:py-14">
        <SunMark className="pointer-events-none absolute right-6 top-6 h-9 w-9 text-outline-variant/35" />

        {/* Entries are Markdown; render them formatted rather than raw. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Markdown>{journal.content}</Markdown>
        </motion.div>
      </div>

      {edited && (
        <p className="mt-5 text-right font-annotation text-[11px] italic tracking-wider text-on-surface-variant/45">
          Edited {formatISTTime(journal.updatedAt)} IST
        </p>
      )}
    </motion.article>
  );
}
