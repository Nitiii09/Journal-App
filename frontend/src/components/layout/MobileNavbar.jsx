import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  BookOpen,
  Users,
  MessageSquare,
  CircleUser,
  PenLine,
} from "lucide-react";

/**
 * Mobile navigation — a floating rounded pill, inset from the screen edges
 * with the same hard coral offset shadow used on paper elsewhere.
 *
 * Five destinations, icon-only: adding Messages made labels too tight to
 * read at 375px, and the chat design shows this row unlabelled with the
 * active item as a filled coral circle. Each item carries an aria-label so
 * the meaning survives without visible text.
 *
 * Friend requests live in the top bar's bell rather than here.
 */
const MOBILE_ITEMS = [
  { to: "/", label: "Today", icon: CalendarDays, end: true },
  { to: "/journal", label: "My journal", icon: BookOpen },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: CircleUser },
];

export default function MobileNavbar({ unreadCount = 0 }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Writing and chatting are focused modes with their own bottom bars;
  // stacking two fixed bars would overlap them.
  const hidden =
    location.pathname === "/journal/write" ||
    /^\/messages\/.+/.test(location.pathname);

  if (hidden) return null;

  return (
    <>
      <motion.button
        type="button"
        onClick={() => navigate("/journal/write")}
        aria-label="Write today's entry"
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 24, delay: 0.3 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-28 right-5 z-50 grid h-14 w-14 place-items-center rounded-full border-2 border-primary bg-primary text-on-primary shadow-press-primary lg:hidden"
      >
        <PenLine className="h-5 w-5" strokeWidth={2.6} />
      </motion.button>

      <nav
        aria-label="Main"
        className="fixed inset-x-margin-mobile bottom-6 z-40 mx-auto flex h-16 max-w-md items-center justify-around rounded-full border border-outline-variant/40 bg-surface-container/90 frost shadow-[4px_4px_0_0_rgb(var(--primary)/0.2)] lg:hidden"
      >
        {MOBILE_ITEMS.map((item) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              className="relative grid h-11 w-11 place-items-center rounded-full active:translate-y-0.5"
            >
              {/* The filled circle slides between items. */}
              {isActive && (
                <motion.span
                  layoutId="mobile-active-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-primary"
                />
              )}

              <item.icon
                className={`relative z-10 h-[21px] w-[21px] transition-colors ${
                  isActive ? "text-on-primary" : "text-on-surface-variant/70"
                }`}
                strokeWidth={isActive ? 2.4 : 1.9}
              />

              {item.to === "/messages" && unreadCount > 0 && !isActive && (
                <span className="absolute right-1 top-1 z-10 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 font-display text-[9px] font-bold text-on-primary">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
