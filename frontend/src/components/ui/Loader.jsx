import { motion } from "framer-motion";
import { LOADING_MESSAGES } from "../../utils/constants";

/**
 * Three paper strips filling in sequence, above a piece of designed copy.
 * The message is part of the product voice — never "Loading…".
 */
export default function Loader({ message = LOADING_MESSAGES.generic, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 py-20 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-2.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-2 bg-primary/70"
            initial={{ width: 18, opacity: 0.3 }}
            animate={{ width: [18, 84, 18], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.18,
            }}
          />
        ))}
      </div>

      <p className="label-caps text-on-surface-variant/75">{message}</p>
    </div>
  );
}

/** Full-viewport variant used while auth state is resolving. */
export function FullPageLoader({ message = LOADING_MESSAGES.generic }) {
  return (
    <div className="grid min-h-screen place-items-center bg-surface">
      <div className="flex flex-col items-center gap-8">
        <motion.p
          className="font-display text-display-md text-primary"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Daymark
        </motion.p>
        <Loader message={message} className="py-0" />
      </div>
    </div>
  );
}
