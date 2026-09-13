import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { formatLong } from "../../utils/formatDate";

/**
 * The backend User model stores only `username` and `createdAt`. No email,
 * no display name, no bio — so none are invented here.
 */
export default function ProfileHeader({ user, streak = 0, className = "" }) {
  return (
    <header className={`relative overflow-hidden ${className}`}>
      <span
        className="watermark absolute -right-4 -top-10 hidden text-[12rem] md:block"
        aria-hidden="true"
      >
        {user?.username?.slice(0, 3).toUpperCase()}
      </span>

      <div className="relative z-10 flex flex-col items-start gap-7 sm:flex-row sm:items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative"
        >
          <Avatar username={user?.username ?? ""} size="2xl" />
          <span className="absolute -bottom-2 -right-4 rotate-[-6deg] px-2 py-1 font-display text-[11px] font-bold text-on-secondary">
            @{user?.username}
          </span>
        </motion.div>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[1.9rem] font-bold uppercase leading-tight tracking-[-0.02em] md:text-4xl">
            {user?.username}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {streak > 0 && <Badge tone="primary">{streak} day streak</Badge>}

            {user?.createdAt && (
              <span className="flex items-center gap-2 font-display text-label-caps uppercase text-on-surface-variant/60">
                <CalendarDays className="h-3.5 w-3.5" strokeWidth={2.4} />
                Marking days since {formatLong(user.createdAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
