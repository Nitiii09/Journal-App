import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, PenLine } from "lucide-react";
import Avatar from "../ui/Avatar";
import SunMark from "../ui/SunMark";
import ThemeToggle from "../ui/ThemeToggle";
import useAuth from "../../hooks/useAuth";
import { NAV_ITEMS } from "./Sidebar";
import { formatDateline } from "../../utils/formatDate";

/**
 * Two distinct headers sharing one bar.
 *
 * Mobile follows the mobile design: sun-mark, the wordmark set in italic
 * coral, and the avatar — nothing else, because the screen is narrow and the
 * bottom pill already handles navigation. The bell lives here since friend
 * requests were dropped from that pill.
 *
 * Desktop keeps the section label and live IST dateline, where there's room.
 */
export default function Topbar({ requestCount = 0 }) {
  const location = useLocation();
  const { user } = useAuth();

  const current =
    NAV_ITEMS.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label ?? "Daymark";

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/60 bg-surface/80 frost">
      {/* ---------- Mobile ---------- */}
      <div className="flex h-16 items-center justify-between gap-3 px-margin-mobile lg:hidden">
        <Link to="/" aria-label="Daymark home" className="shrink-0 active:scale-95">
          <SunMark className="h-6 w-6 text-primary" strokeWidth={2} />
        </Link>

        <Link
          to="/"
          className="font-display text-[1.75rem] font-extrabold italic leading-none tracking-[-0.045em] text-primary"
        >
          Daymark
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/requests"
            aria-label={`Friend requests${requestCount ? ` (${requestCount} pending)` : ""}`}
            className="relative grid h-9 w-9 place-items-center rounded-full text-on-surface-variant active:scale-95"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2.1} />
            {requestCount > 0 && (
              <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 font-display text-[9px] font-bold text-on-primary">
                {requestCount}
              </span>
            )}
          </Link>

          <Link to="/profile" aria-label="Your profile">
            <Avatar username={user?.username ?? ""} size="sm" className="rounded-full" />
          </Link>
        </div>
      </div>

      {/* ---------- Desktop ---------- */}
      <div className="hidden h-16 items-center justify-between gap-4 px-8 lg:flex lg:px-margin-desktop">
        <div className="flex min-w-0 items-baseline gap-3">
          <motion.span
            key={current}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="label-caps text-on-surface"
          >
            {current}
          </motion.span>
          <span className="h-3 w-px bg-outline-variant" aria-hidden="true" />
          <span className="truncate font-annotation text-[11px] tracking-[0.14em] text-on-surface-variant/60">
            {formatDateline()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/journal/write"
            className="hidden items-center gap-2 border-2 border-on-surface px-4 py-2 font-display text-label-caps-sm uppercase transition-colors hover:bg-on-surface hover:text-surface md:inline-flex lg:hidden"
          >
            <PenLine className="h-3.5 w-3.5" strokeWidth={2.6} />
            Write
          </Link>

          <Link
            to="/requests"
            aria-label={`Friend requests${requestCount ? ` (${requestCount} pending)` : ""}`}
            className="relative grid h-9 w-9 place-items-center border border-outline-variant/70 bg-surface-container text-on-surface-variant transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Bell className="h-4 w-4" strokeWidth={2.1} />
            {requestCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 font-display text-[9px] font-bold text-on-primary">
                {requestCount}
              </span>
            )}
          </Link>

          <ThemeToggle compact />

          <Link to="/profile" aria-label="Your profile" className="ml-1">
            <Avatar username={user?.username ?? ""} size="sm" />
          </Link>
        </div>
      </div>
    </header>
  );
}
