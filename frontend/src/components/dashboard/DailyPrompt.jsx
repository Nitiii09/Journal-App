import { motion } from "framer-motion";
import { DAILY_PROMPTS } from "../../utils/constants";
import { istParts } from "../../utils/dateUtils";

/**
 * One rotating question, chosen by IST day-of-year so it is stable for the
 * whole day and identical for everyone — a shared prompt, not a random one.
 */
export default function DailyPrompt({ className = "" }) {
  const { year, month, day } = istParts();
  const dayOfYear = Math.floor(
    (Date.UTC(year, month, day) - Date.UTC(year, 0, 0)) / 86400000
  );
  const prompt = DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];

  return (
    <motion.blockquote
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className={`relative border-l-[3px] border-primary pl-5 ${className}`}
    >
      <p className="font-journal text-journal-quote italic leading-snug text-on-surface-variant text-pretty">
        “{prompt}”
      </p>
      <footer className="label-caps mt-3 text-on-surface-variant/45">
        Today&rsquo;s prompt
      </footer>
    </motion.blockquote>
  );
}
