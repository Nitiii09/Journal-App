import { motion } from "framer-motion";
import { Globe, Lock } from "lucide-react";

/**
 * Public / Private toggle.
 *
 * "Public" means visible to accepted friends only — never to the internet.
 * The helper line says so explicitly, because that distinction is the whole
 * trust model of the product.
 */
const OPTIONS = [
  {
    value: true,
    label: "Public to friends",
    icon: Globe,
    hint: "Your accepted friends can read this once they've written their own.",
  },
  {
    value: false,
    label: "Private",
    icon: Lock,
    hint: "Only you will ever see this entry.",
  },
];

export default function JournalVisibility({ isPublic, onChange, disabled = false }) {
  const active = OPTIONS.find((o) => o.value === isPublic) ?? OPTIONS[0];

  return (
    <div>
      <p className="label-caps mb-3 text-on-surface-variant/70">Visibility</p>

      <div
        role="radiogroup"
        aria-label="Entry visibility"
        className="relative inline-flex border-2 border-on-surface"
      >
        {OPTIONS.map((option) => {
          const selected = option.value === isPublic;

          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className="relative px-5 py-2.5 disabled:opacity-50"
            >
              {selected && (
                <motion.span
                  layoutId="visibility-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 bg-on-surface"
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-2 font-display text-label-caps uppercase transition-colors ${
                  selected ? "text-surface" : "text-on-surface-variant"
                }`}
              >
                <option.icon className="h-3.5 w-3.5" strokeWidth={2.6} />
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      <motion.p
        key={active.label}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 font-journal text-sm italic text-on-surface-variant/70"
      >
        {active.hint}
      </motion.p>
    </div>
  );
}
