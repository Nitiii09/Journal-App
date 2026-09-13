import { accentFor } from "../../utils/constants";

/**
 * The backend stores only a username — no avatar URLs exist. Rather than
 * inventing a photo field, we derive a stable monogram and accent colour
 * from the username itself, so every user has a consistent identity.
 */

const SIZES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-[11px]",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
  "2xl": "h-32 w-32 text-4xl",
};

const ACCENT_CLASSES = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-fixed text-secondary",
  tertiary: "bg-tertiary-fixed text-tertiary",
  lavender: "bg-lavender-fixed text-lavender",
  mint: "bg-mint-fixed text-mint",
};

function initials(name = "") {
  const parts = name.replace(/[._-]+/g, " ").trim().split(/\s+/);
  if (!parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function Avatar({
  username = "",
  size = "md",
  ring = false,
  active = false,
  className = "",
}) {
  const accent = accentFor(username);

  return (
    <span
      className={`
        relative inline-flex shrink-0 items-center justify-center
        rounded-lg font-display font-extrabold uppercase tracking-tight
        select-none
        ${SIZES[size] ?? SIZES.md}
        ${ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.primary}
        ${ring ? "ring-2 ring-offset-2 ring-offset-surface ring-outline-variant" : ""}
        ${className}
      `}
      title={username}
      aria-label={username}
    >
      {initials(username)}

      {/* "Wrote today" pip. Static — a permanently pinging dot on every
          avatar in a grid is a lot of motion for a status that doesn't change
          while you're looking at it. */}
      {active && (
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-tertiary" />
      )}
    </span>
  );
}
