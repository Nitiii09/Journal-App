import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { countUp } from "../../animations/gsapAnimations";
import { staggerContainer, staggerItem } from "../../animations/staggerAnimations";

/** One oversized numeral per stat, counted up on mount. */
function Stat({ value, label, sublabel, accent = "primary", suffix = "" }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const tween = countUp(value, setShown, { duration: 1.3, delay: 0.3 });
    return () => tween?.kill();
  }, [value]);

  const accentClass = {
    primary: "text-primary",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
    lavender: "text-lavender",
    mint: "text-mint",
  }[accent];

  return (
    <motion.div
      variants={staggerItem}
      className="relative border-t border-outline-variant pt-5"
    >
      <div className="flex items-baseline gap-1">
        <span
          className={`font-display text-4xl font-bold leading-none tracking-[-0.03em] tabular-nums md:text-5xl ${accentClass}`}
        >
          {shown}
        </span>
        {suffix && (
          <span className={`font-display text-2xl font-extrabold ${accentClass}`}>
            {suffix}
          </span>
        )}
      </div>

      <p className="label-caps mt-3 text-on-surface">{label}</p>
      {sublabel && (
        <p className="mt-1.5 font-journal text-sm italic text-on-surface-variant/70">
          {sublabel}
        </p>
      )}
    </motion.div>
  );
}

export default function ProfileStats({ stats, friendCount = 0, className = "" }) {
  return (
    <motion.div
      variants={staggerContainer(0.09)}
      initial="initial"
      animate="animate"
      className={`grid gap-gutter sm:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      <Stat
        value={stats.total}
        label="Entries"
        sublabel="Days you showed up."
        accent="primary"
      />
      <Stat
        value={stats.streak}
        label="Day streak"
        sublabel="Consecutive days written."
        accent="tertiary"
      />
      <Stat
        value={friendCount}
        label="Friends"
        sublabel="People in your circle."
        accent="secondary"
      />
      <Stat
        value={stats.consistency}
        suffix="%"
        label="Consistency"
        sublabel="Since your first entry."
        accent="lavender"
      />
    </motion.div>
  );
}
