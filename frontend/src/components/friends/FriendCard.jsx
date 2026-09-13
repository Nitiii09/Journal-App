import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import FriendStatus from "./FriendStatus";
import { staggerItem } from "../../animations/staggerAnimations";

/**
 * A friend.
 *
 * This card previously carried a coloured tint block, a coloured avatar ring
 * and a staggered vertical offset. In a grid that repeats eight times, all
 * three read as noise — the cards are now aligned and plain, and colour is
 * reserved for the one thing that varies: whether they wrote today.
 */
export default function FriendCard({ friend }) {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link
        to={`/friends/${friend._id}`}
        className="relative block overflow-hidden rounded-lg border border-outline-variant/60 bg-surface-lowest p-4 transition-colors duration-200 hover:border-outline-variant sm:p-6"
      >
        {/* Mobile: portrait, centred. Desktop: identity row, then actions. */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <Avatar
            username={friend.username}
            size="xl"
            active={friend.wroteToday}
            className="rounded-lg lg:hidden"
          />
          <Avatar
            username={friend.username}
            size="lg"
            active={friend.wroteToday}
            className="hidden lg:inline-flex"
          />

          <h3 className="mt-3 w-full truncate font-display text-base font-bold leading-tight tracking-tight lg:mt-4 lg:text-lg">
            {friend.username}
          </h3>

          <p className="label-caps mt-1 hidden w-full truncate text-on-surface-variant/60 lg:block">
            @{friend.username}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 lg:mt-4 lg:justify-start lg:gap-3">
            {friend.streak > 0 && (
              <Badge tone="neutral" size="sm" icon={Flame}>
                {friend.streak} day{friend.streak === 1 ? "" : "s"}
              </Badge>
            )}
            <FriendStatus wroteToday={friend.wroteToday} size="sm" />
          </div>

          {/* The whole card is the tap target on mobile, so this reads as a
              label there and only becomes a bordered button on desktop. */}
          <span className="mt-4 hidden w-full items-center justify-between rounded border border-outline-variant px-4 py-2.5 font-display text-label-caps uppercase text-on-surface-variant transition-colors group-hover:border-on-surface group-hover:text-on-surface lg:flex">
            View journal
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2.4}
            />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
