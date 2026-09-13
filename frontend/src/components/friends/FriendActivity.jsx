import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import Avatar from "../ui/Avatar";
import { Skeleton } from "../ui/Skeleton";
import { staggerContainer, staggerItem } from "../../animations/staggerAnimations";

/**
 * "YOUR PEOPLE" — a horizontally scrolling row of friend avatars with live
 * write-status. Friends who wrote today are sorted to the front.
 */
export default function FriendActivity({ friends = [], loading = false, className = "" }) {
  const sorted = [...friends].sort(
    (a, b) => Number(b.wroteToday) - Number(a.wroteToday)
  );

  return (
    <section className={className}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight md:text-2xl">
            Your people
          </h2>
          <p className="mt-1.5 font-annotation text-xs tracking-[0.12em] text-on-surface-variant/55">
            {loading
              ? "…"
              : `${friends.filter((f) => f.wroteToday).length} of ${friends.length} wrote today`}
          </p>
        </div>

        <Link
          to="/friends"
          className="group flex shrink-0 items-center gap-1.5 font-display text-label-caps uppercase text-on-surface-variant transition-colors hover:text-primary"
        >
          All friends
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
            strokeWidth={2.6}
          />
        </Link>
      </div>

      {loading ? (
        <div className="flex gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex w-20 shrink-0 flex-col items-center gap-2.5">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-2 w-10" />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex items-center gap-3 border border-dashed border-outline-variant px-5 py-8">
          <Users className="h-5 w-5 text-on-surface-variant/50" strokeWidth={1.8} />
          <p className="font-journal text-[15px] italic text-on-surface-variant/70">
            No friends yet —{" "}
            <Link to="/friends" className="text-primary underline underline-offset-4">
              add someone
            </Link>{" "}
            to see their days here.
          </p>
        </div>
      ) : (
        <motion.ul
          variants={staggerContainer(0.06)}
          initial="initial"
          animate="animate"
          className="no-scrollbar -mx-1 flex gap-5 overflow-x-auto px-1 pb-2"
        >
          {sorted.map((friend) => (
            <motion.li key={friend._id} variants={staggerItem} className="shrink-0">
              <Link
                to={`/friends/${friend._id}`}
                className="group flex w-[5.5rem] flex-col items-center gap-2.5 text-center"
              >
                <motion.span whileHover={{ y: -4 }} transition={{ duration: 0.25 }}>
                  <Avatar
                    username={friend.username}
                    size="lg"
                    active={friend.wroteToday}
                    className={
                      friend.wroteToday
                        ? "ring-2 ring-tertiary-bright ring-offset-2 ring-offset-surface"
                        : "opacity-60 grayscale transition group-hover:opacity-100 group-hover:grayscale-0"
                    }
                  />
                </motion.span>

                <span className="w-full truncate font-display text-[11px] font-bold tracking-tight">
                  {friend.username}
                </span>

                <span
                  className={`font-display text-[8.5px] font-bold uppercase leading-tight tracking-[0.1em] ${
                    friend.wroteToday ? "text-tertiary" : "text-on-surface-variant/40"
                  }`}
                >
                  {friend.wroteToday ? "Wrote today" : "Has not written"}
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}
