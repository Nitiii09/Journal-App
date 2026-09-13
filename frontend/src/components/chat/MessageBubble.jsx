import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { formatISTTime } from "../../utils/formatDate";

/**
 * A single message.
 *
 * Theirs reads as a page from a journal — paper, hairline border, set in
 * Playfair. Yours is a solid coral block in the UI sans. The asymmetry is
 * deliberate: their words are the thing you came to read, yours are just
 * the reply.
 */
export default function MessageBubble({ message, mine, showTail = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          relative max-w-[85%] px-5 py-3.5 sm:max-w-[75%]
          ${
            mine
              ? "rounded-lg bg-primary text-on-primary"
              : "rounded-lg border border-on-surface/80 bg-surface-lowest text-on-surface shadow-paper-sm"
          }
          ${message.pending ? "opacity-70" : ""}
        `}
      >
        <p
          className={
            mine
              ? "font-sans text-[15px] leading-relaxed"
              : "font-journal text-[18px] leading-[1.65]"
          }
        >
          {message.message}
        </p>

        {showTail && (
          <p
            className={`mt-1.5 flex items-center justify-end gap-1 font-display text-[9px] font-bold uppercase tracking-[0.1em] ${
              mine ? "text-on-primary/60" : "text-on-surface-variant/45"
            }`}
          >
            {message.pending ? (
              <>
                <Clock className="h-2.5 w-2.5" strokeWidth={3} />
                Sending
              </>
            ) : (
              <>
                {formatISTTime(message.createdAt)}
                {mine && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
              </>
            )}
          </p>
        )}
      </div>
    </motion.div>
  );
}
