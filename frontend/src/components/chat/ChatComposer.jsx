import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, SendHorizonal } from "lucide-react";

/**
 * The composer: a rounded pill with an italic serif placeholder, matching
 * the chat design. Grows to a few lines, then scrolls.
 *
 * Enter sends; Shift+Enter breaks the line.
 */
export default function ChatComposer({ onSend, disabled = false }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    if (onSend?.(trimmed) !== false) setText("");
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-outline-variant/60 bg-surface/90 px-margin-mobile py-3 frost md:px-8">
      <div className="mx-auto flex max-w-2xl items-end gap-2.5">
        <div className="flex flex-1 items-end gap-3 rounded-full border border-outline-variant/70 bg-surface-lowest px-4 py-2.5">
          <button
            type="button"
            aria-label="Add attachment"
            title="Attachments aren't supported yet"
            disabled
            className="mb-0.5 shrink-0 text-on-surface-variant/40"
          >
            <Plus className="h-5 w-5" strokeWidth={2.2} />
          </button>

          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            placeholder="Write a thought…"
            aria-label="Message"
            className="max-h-[120px] flex-1 resize-none border-0 bg-transparent p-0 font-journal text-[17px] italic leading-relaxed text-on-surface placeholder:text-on-surface-variant/45 focus:ring-0 disabled:opacity-50"
          />
        </div>

        <motion.button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          whileTap={canSend ? { scale: 0.92 } : undefined}
          className="mb-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary transition-opacity disabled:opacity-30"
        >
          <SendHorizonal className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </motion.button>
      </div>
    </div>
  );
}
