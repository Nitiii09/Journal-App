import { motion } from "framer-motion";
import Button from "./Button";
import { fadeUp } from "../../animations/pageVariants";

/**
 * Empty states carry the product voice — a headline in display caps, a line
 * of serif copy, and one clear way forward.
 */
export default function EmptyState({
  icon: Icon,
  title,
  body,
  actionLabel,
  onAction,
  actionTo,
  actionAs,
  secondary,
  className = "",
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className={`relative overflow-hidden border border-dashed border-outline-variant px-8 py-20 text-center ${className}`}
    >
      {/* oversized watermark behind the copy */}
      <span
        className="watermark absolute -right-6 -top-8 text-[10rem] md:text-[14rem]"
        aria-hidden="true"
      >
        ✳
      </span>

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
        {Icon && (
          <span className="mb-7 grid h-16 w-16 place-items-center border-2 border-outline-variant/70 text-on-surface-variant/60">
            <Icon className="h-7 w-7" strokeWidth={1.6} />
          </span>
        )}

        <h3 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-balance md:text-3xl">
          {title}
        </h3>

        {body && (
          <p className="mt-4 font-journal text-lg italic leading-relaxed text-on-surface-variant text-pretty">
            {body}
          </p>
        )}

        {actionLabel && (
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button as={actionAs} to={actionTo} onClick={onAction} size="md">
              {actionLabel}
            </Button>
            {secondary}
          </div>
        )}
      </div>
    </motion.div>
  );
}
