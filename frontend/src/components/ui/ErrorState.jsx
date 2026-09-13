import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import Button from "./Button";
import { ERROR_COPY } from "../../utils/constants";

/**
 * Designed error states. Every status the backend can return maps to copy
 * that stays in the product's voice — the user should never see a raw
 * "Request failed with status code 500".
 */
export default function ErrorState({ error, onRetry, className = "" }) {
  const status = error?.status ?? "default";
  const copy = ERROR_COPY[status] ?? ERROR_COPY.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden border-2 border-error/25 bg-error-container/25 px-8 py-16 text-center ${className}`}
      role="alert"
    >
      <span
        className="watermark absolute -right-4 top-0 text-[9rem] text-error/[0.07] md:text-[13rem]"
        aria-hidden="true"
      >
        {status === "default" ? "!" : status}
      </span>

      <div className="relative z-10 mx-auto max-w-md">
        <p className="label-caps mb-4 text-error">Error {status !== "default" ? status : ""}</p>

        <h3 className="font-display text-2xl font-extrabold uppercase leading-tight tracking-tight md:text-3xl">
          {copy.title}
        </h3>

        <p className="mt-4 font-journal text-lg italic leading-relaxed text-on-surface-variant">
          {copy.body}
        </p>

        {/* Surface the server's own words too — useful, and honest. */}
        {error?.message && (
          <p className="mt-5 border-t border-error/20 pt-4 font-annotation text-xs text-on-surface-variant/60">
            {error.message}
          </p>
        )}

        {onRetry && (
          <Button onClick={onRetry} icon={RotateCw} className="mt-8">
            {copy.action}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
