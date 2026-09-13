/**
 * "Washi tape" chips — low-opacity blocks that read as stuck onto the page.
 * Sharp corners keep them in the editorial cut-out language.
 */

const TONES = {
  neutral: "bg-surface-high text-on-surface-variant border-outline-variant/60",
  primary: "bg-primary-fixed text-primary border-primary/25",
  secondary: "bg-secondary-fixed text-secondary border-secondary/25",
  tertiary: "bg-tertiary-fixed text-tertiary border-tertiary/30",
  lavender: "bg-lavender-fixed text-lavender border-lavender/25",
  mint: "bg-mint-fixed text-mint border-mint/25",
  solid: "bg-on-surface text-surface border-on-surface",
  outline: "bg-transparent text-on-surface-variant border-outline-variant",
};

const SIZES = {
  sm: "px-2 py-0.5 text-label-caps-sm gap-1",
  md: "px-2.5 py-1 text-label-caps gap-1.5",
};

export default function Badge({
  children,
  tone = "neutral",
  size = "md",
  icon: Icon,
  dot = false,
  className = "",
}) {
  return (
    <span
      className={`
        inline-flex items-center rounded-none border font-display
        uppercase tracking-[0.1em] whitespace-nowrap
        ${TONES[tone] ?? TONES.neutral}
        ${SIZES[size] ?? SIZES.md}
        ${className}
      `}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {Icon && <Icon className="h-3 w-3" strokeWidth={2.6} aria-hidden="true" />}
      {children}
    </span>
  );
}
