import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * Editorial "cut-out" button: sharp corners, a hard offset shadow, and a
 * press that collapses the shadow so the button physically meets the page.
 */

const VARIANTS = {
  primary:
    "bg-primary text-on-primary border-2 border-primary shadow-press-primary hover:bg-primary-bright hover:border-primary-bright",
  solid:
    "bg-on-surface text-surface border-2 border-on-surface shadow-press-primary hover:bg-on-surface/90",
  outline:
    "bg-transparent text-on-surface border-2 border-on-surface hover:bg-on-surface hover:text-surface",
  secondary:
    "bg-secondary text-on-secondary border-2 border-secondary shadow-press-primary hover:bg-secondary-container",
  ghost:
    "bg-transparent text-on-surface-variant border-2 border-transparent hover:text-primary hover:border-outline-variant",
  quiet:
    "bg-surface-container text-on-surface border border-outline-variant/70 hover:bg-surface-high",
  danger:
    "bg-transparent text-error border-2 border-error/60 hover:bg-error hover:text-on-primary hover:border-error",
};

const SIZES = {
  sm: "px-4 py-2 text-label-caps-sm gap-1.5",
  md: "px-6 py-3 text-label-caps gap-2",
  lg: "px-9 py-4 text-[13px] tracking-[0.14em] gap-2.5",
};

/**
 * Wrapping a component in motion() must happen once, not on every render —
 * doing it inline creates a new component type each pass, which makes React
 * unmount and remount the button (losing focus and restarting animations).
 */
const motionCache = new Map();

function asMotion(Component) {
  if (typeof Component === "string" && motion[Component]) return motion[Component];
  if (!motionCache.has(Component)) {
    const create = motion.create ?? motion;
    motionCache.set(Component, create(Component));
  }
  return motionCache.get(Component);
}

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    className = "",
    as: Component = "button",
    ...props
  },
  ref
) {
  const MotionComponent = asMotion(Component);
  const isDisabled = disabled || loading;

  return (
    <MotionComponent
      ref={ref}
      disabled={Component === "button" ? isDisabled : undefined}
      aria-busy={loading || undefined}
      initial={false}
      whileHover={isDisabled ? undefined : { y: -2, x: -1 }}
      whileTap={isDisabled ? undefined : { y: 3, x: 3, boxShadow: "0 0 0 0 transparent" }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative inline-flex items-center justify-center rounded-none
        font-display font-bold uppercase whitespace-nowrap
        transition-colors duration-200
        disabled:opacity-45 disabled:cursor-not-allowed disabled:shadow-none
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${SIZES[size] ?? SIZES.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={2.4} />
      )}
      <span>{children}</span>
      {IconRight && !loading && (
        <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={2.4} />
      )}
    </MotionComponent>
  );
});

export default Button;
