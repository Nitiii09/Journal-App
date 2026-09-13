import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import Avatar from "../ui/Avatar";
import { dismissCard } from "../../animations/cardAnimations";
import { staggerItem } from "../../animations/staggerAnimations";
import { formatRelative } from "../../utils/formatDate";

/**
 * A knock at the door. Accepting slides the card right, declining slides it
 * left — direction carries the meaning before the toast even appears.
 */
// forwardRef is required: AnimatePresence mode="popLayout" measures the
// exiting card, so it must be able to attach a ref to this component.
const FriendRequestCard = forwardRef(function FriendRequestCard(
  { request, onAccept, onReject },
  ref
) {
  const [resolving, setResolving] = useState(null);

  const sender = request.senderId ?? {};

  const handle = async (action) => {
    setResolving(action);
    try {
      if (action === "accept") await onAccept?.(request._id, sender.username);
      else await onReject?.(request._id, sender.username);
    } catch {
      setResolving(null);
    }
  };

  return (
    <motion.article
      ref={ref}
      layout
      variants={staggerItem}
      initial="initial"
      animate="animate"
      exit={resolving === "reject" ? dismissCard(-1) : dismissCard(1)}
      className="relative overflow-hidden paper grain-panel"
    >

      <div className="relative z-10 p-6">
        <div className="mb-5 flex items-start gap-4">
          <Avatar username={sender.username ?? ""} size="lg" />

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="truncate font-display text-lg font-extrabold tracking-tight">
              @{sender.username}
            </h3>
            <p className="label-caps mt-1 text-on-surface-variant/50">
              {formatRelative(request.createdAt)}
            </p>
          </div>
        </div>

        {request.note && (
          <blockquote className="mb-6 border-l-2 border-outline-variant pl-4">
            <p className="font-journal text-[17px] italic leading-relaxed text-on-surface-variant">
              “{request.note}”
            </p>
          </blockquote>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handle("accept")}
            disabled={Boolean(resolving)}
            className="flex items-center justify-center gap-2 border-2 border-on-surface bg-on-surface px-4 py-3 font-display text-label-caps uppercase text-surface transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
            Accept
          </button>

          <button
            type="button"
            onClick={() => handle("reject")}
            disabled={Boolean(resolving)}
            className="flex items-center justify-center gap-2 border-2 border-outline-variant px-4 py-3 font-display text-label-caps uppercase text-on-surface-variant transition-colors hover:border-error hover:text-error disabled:opacity-40"
          >
            <X className="h-4 w-4" strokeWidth={3} />
            Decline
          </button>
        </div>
      </div>
    </motion.article>
  );
});

export default FriendRequestCard;
