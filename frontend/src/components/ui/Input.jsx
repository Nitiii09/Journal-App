import { forwardRef, useId, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

/**
 * Ruled-notebook input: no box, just a heavy bottom border that inks in to
 * the primary colour on focus. The label sits above in caps, like a form
 * printed on paper.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    success,
    adornment,
    icon: Icon,
    type = "text",
    className = "",
    containerClassName = "",
    ...props
  },
  ref
) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";
  const resolvedType = isPassword && revealed ? "text" : type;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={id}
          className="label-caps mb-1 block text-on-surface-variant/80"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/60"
            strokeWidth={2}
            aria-hidden="true"
          />
        )}

        <input
          ref={ref}
          id={id}
          type={resolvedType}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={`
            rule-input font-sans text-[15px]
            ${Icon ? "pl-7" : ""}
            ${isPassword || adornment ? "pr-10" : ""}
            ${error ? "border-error focus:border-error" : ""}
            ${success && !error ? "border-tertiary focus:border-tertiary" : ""}
            ${className}
          `}
          {...props}
        />

        {/* Live status slot — spinner / tick / cross for async validation. */}
        {adornment && !isPassword && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2">
            {adornment}
          </span>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-on-surface-variant/60 transition-colors hover:text-primary"
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {/* The focus rule inks in from the left, like a pen stroke. */}
        <motion.span
          layout
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-primary origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 0 }}
          style={{ width: "100%" }}
        />
      </div>

      {/* Keyed remount, not AnimatePresence: only one message may ever be
          visible, and a stalled exit would leave a stale hint sitting next to
          a live error. */}
      {(error || success || hint) && (
        <motion.p
          id={`${id}-msg`}
          key={error || success || hint}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`mt-2 font-annotation text-xs ${
            error
              ? "text-error"
              : success
                ? "text-tertiary"
                : "text-on-surface-variant/70"
          }`}
        >
          {error || success || hint}
        </motion.p>
      )}
    </div>
  );
});

export default Input;
