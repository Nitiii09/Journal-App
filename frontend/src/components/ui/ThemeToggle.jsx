import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import useTheme from "../../hooks/useTheme";

/** Sun ⇄ moon swap — the icon rotates out as the other rotates in. */
export default function ThemeToggle({ compact = false, className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        group relative flex items-center gap-3 overflow-hidden
        border border-outline-variant/70 bg-surface-container
        transition-colors hover:border-primary/50 hover:bg-surface-high
        ${compact ? "h-9 w-9 justify-center" : "w-full px-3.5 py-2.5"}
        ${className}
      `}
    >
      <span className="relative grid h-4 w-4 shrink-0 place-items-center">
        {/* No `mode="wait"` — the icon must reflect the current theme even if
            the outgoing one's exit animation never completes. */}
        <AnimatePresence initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -80, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 80, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.28 }}
              className="absolute"
            >
              <Moon className="h-4 w-4 text-lavender" strokeWidth={2.2} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 80, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -80, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.28 }}
              className="absolute"
            >
              <Sun className="h-4 w-4 text-primary" strokeWidth={2.2} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {!compact && (
        <span className="label-caps text-on-surface-variant transition-colors group-hover:text-on-surface">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
