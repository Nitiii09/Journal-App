import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  BookOpen,
  Users,
  UserPlus,
  Compass,
  CircleUser,
  MessageSquare,
  LogOut,
  PenLine,
} from "lucide-react";
import Button from "../ui/Button";
import ThemeToggle from "../ui/ThemeToggle";
import Badge from "../ui/Badge";
import useAuth from "../../hooks/useAuth";

export const NAV_ITEMS = [
  { to: "/", label: "Today", icon: CalendarDays, end: true },
  { to: "/journal", label: "My Journal", icon: BookOpen },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/requests", label: "Requests", icon: UserPlus },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/profile", label: "Profile", icon: CircleUser },
];

function NavItem({ item, requestCount, unreadCount }) {
  const location = useLocation();
  const isActive = item.end
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to);

  const count =
    item.to === "/requests" ? requestCount : item.to === "/messages" ? unreadCount : 0;
  const showCount = count > 0;

  return (
    <NavLink
      to={item.to}
      end={item.end}
      className="group relative flex items-center gap-3.5 px-4 py-3 outline-offset-[-2px]"
    >
      {/* The animated pill travels between items via a shared layoutId. */}
      {isActive && (
        <motion.span
          layoutId="sidebar-active-pill"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="absolute inset-0 border-r-[3px] border-primary bg-primary-fixed/55"
        />
      )}

      <item.icon
        className={`relative z-10 h-[18px] w-[18px] shrink-0 transition-colors ${
          isActive
            ? "text-primary"
            : "text-on-surface-variant/70 group-hover:text-on-surface"
        }`}
        strokeWidth={isActive ? 2.4 : 1.9}
      />

      <span
        className={`relative z-10 flex-1 text-left font-display text-sm tracking-wide transition-colors ${
          isActive
            ? "font-bold text-primary"
            : "font-medium text-on-surface-variant group-hover:text-on-surface"
        }`}
      >
        {item.label}
      </span>

      {showCount && (
        <Badge tone="primary" size="sm" className="relative z-10">
          {count}
        </Badge>
      )}
    </NavLink>
  );
}

export default function Sidebar({ requestCount = 0, unreadCount = 0 }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-sidebar flex-col border-r border-outline-variant/70 bg-surface-low lg:flex">
      {/* faint vertical gradient + grain give the rail its own material */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-fixed/25 via-transparent to-secondary-fixed/20" />
      <div className="grain-panel pointer-events-none absolute inset-0" />

      {/* decorative vertical type running down the rail edge */}
      <span
        className="writing-vertical watermark absolute -right-1 top-1/2 -translate-y-1/2 text-[11px] tracking-[0.4em] text-on-surface/20"
        aria-hidden="true"
      >
        DIGITAL EPHEMERA
      </span>

      <div className="relative z-10 flex h-full flex-col">
        <div className="px-7 pb-8 pt-8">
          <NavLink to="/" className="block">
            <h1 className="font-display text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-primary">
              Daymark
            </h1>
            <p className="label-caps mt-2 text-on-surface-variant/55">
              Digital Ephemera
            </p>
          </NavLink>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              requestCount={requestCount}
              unreadCount={unreadCount}
            />
          ))}
        </nav>

        <div className="space-y-3 px-5 pb-7 pt-5">
          <Button
            onClick={() => navigate("/journal/write")}
            icon={PenLine}
            size="md"
            className="w-full"
          >
            Write Now
          </Button>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="grid h-[42px] w-[42px] shrink-0 place-items-center border border-outline-variant/70 bg-surface-container text-on-surface-variant transition-colors hover:border-error/50 hover:bg-error-container/50 hover:text-error"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>

          {user && (
            <p className="pt-1 font-annotation text-[11px] text-on-surface-variant/50">
              Signed in as{" "}
              <span className="text-on-surface-variant">@{user.username}</span>
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
