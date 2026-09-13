import { motion } from "framer-motion";
import { formatDateline } from "../../utils/formatDate";
import { greetingFor } from "../../utils/dateUtils";
import SunMark from "../ui/SunMark";

/**
 * The greeting.
 *
 * This used to carry a GSAP drift loop, cursor parallax, an oversized date
 * watermark and a word-by-word masked reveal. Four things moving at once on
 * the first screen was too much, so it's now a single settled fade — the
 * dateline and the name are the content, and neither needs choreography.
 */
export default function WelcomeHero({ username = "" }) {
  return (
    <section className="pb-2 pt-1">
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="label-caps mb-4 flex items-center gap-2.5 text-on-surface-variant/70"
      >
        <SunMark className="h-3.5 w-3.5 text-primary" />
        {formatDateline()}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.025em] sm:text-4xl lg:text-5xl"
      >
        {greetingFor()},{" "}
        <span className="text-primary">{username || "there"}.</span>
      </motion.h1>
    </section>
  );
}
