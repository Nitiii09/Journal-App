import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import MessageBubble from "./MessageBubble";
import Loader from "../ui/Loader";
import { senderIdOf } from "../../services/chatService";
import { isSameISTDay, isTodayIST } from "../../utils/dateUtils";
import { formatLong, formatISTTime } from "../../utils/formatDate";

/** "TODAY, 2:41 PM" — the divider that opens each run of messages. */
function DayDivider({ date }) {
  const label = isTodayIST(date) ? "Today" : formatLong(date);

  return (
    <div className="flex items-center gap-4 py-6">
      <span className="hairline flex-1" />
      <span className="label-caps whitespace-nowrap text-on-surface-variant/50">
        {label}, {formatISTTime(date)}
      </span>
      <span className="hairline flex-1" />
    </div>
  );
}

export default function MessageThread({ messages, loading, myId, className = "" }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Stick to the newest message, but don't yank the view if the reader has
  // scrolled up to re-read something.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 200) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  if (loading) {
    return <Loader message="Opening the conversation…" className={className} />;
  }

  if (!messages.length) {
    return (
      <div
        className={`flex flex-1 flex-col items-center justify-center px-8 py-20 text-center ${className}`}
      >
        <span className="mb-6 grid h-14 w-14 place-items-center border-2 border-outline-variant/70 text-on-surface-variant/50">
          <MessageSquare className="h-6 w-6" strokeWidth={1.7} />
        </span>
        <h3 className="font-display text-xl font-extrabold uppercase tracking-tight">
          Nothing said yet.
        </h3>
        <p className="mt-3 max-w-xs font-journal text-[17px] italic leading-relaxed text-on-surface-variant/70">
          Write the first thought. It doesn&rsquo;t have to be profound.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto px-margin-mobile py-2 md:px-8 ${className}`}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-2.5">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const mine = senderIdOf(message) === String(myId);

          // A divider whenever the day rolls over.
          const newDay =
            !previous || !isSameISTDay(previous.createdAt, message.createdAt);

          // Only the last message of a run carries the timestamp.
          const next = messages[index + 1];
          const endOfRun =
            !next || senderIdOf(next) !== senderIdOf(message);

          return (
            <div key={message._id}>
              {newDay && <DayDivider date={message.createdAt} />}
              <MessageBubble message={message} mine={mine} showTail={endOfRun} />
            </div>
          );
        })}
      </div>
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}
