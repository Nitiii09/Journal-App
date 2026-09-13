/**
 * The Daymark "sun-stroke" symbol — a sun rising over a horizon line.
 * Per the design system it recurs across the app: as a watermark, a list
 * marker, and a section separator.
 */
export default function SunMark({ className = "", strokeWidth = 1.6 }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      <circle
        cx="24"
        cy="24"
        r="7.5"
        stroke="currentColor"
        strokeWidth={strokeWidth * 1.4}
      />
      {/* rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const inner = 12;
        const outer = 17.5;
        return (
          <line
            key={angle}
            x1={24 + Math.cos(rad) * inner}
            y1={24 + Math.sin(rad) * inner}
            x2={24 + Math.cos(rad) * outer}
            y2={24 + Math.sin(rad) * outer}
            stroke="currentColor"
            strokeWidth={strokeWidth * 1.3}
            strokeLinecap="round"
          />
        );
      })}
      {/* horizon */}
      <path
        d="M4 39.5h40"
        stroke="currentColor"
        strokeWidth={strokeWidth * 1.6}
        strokeLinecap="round"
      />
      <path
        d="M10 44h28"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

/** Separator: a hairline broken by the mark in the middle. */
export function SunDivider({ className = "" }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden="true">
      <span className="hairline flex-1" />
      <SunMark className="h-4 w-4 shrink-0 text-primary/50" />
      <span className="hairline flex-1" />
    </div>
  );
}
