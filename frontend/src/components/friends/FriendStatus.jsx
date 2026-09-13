/**
 * The only per-friend status this product has: did they write today?
 * Filled dot = written, hollow ring = not.
 */
export default function FriendStatus({ wroteToday, size = "md", showLabel = true }) {
  const dot = size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2";

  return (
    <span
      className={`inline-flex items-center gap-2 font-display uppercase tracking-[0.1em] ${
        size === "sm" ? "text-[9px]" : "text-label-caps-sm"
      } ${wroteToday ? "text-tertiary" : "text-on-surface-variant/45"}`}
    >
      {/* A plain dot. This used to pulse on a two-second loop, which meant
          every friend in a grid was animating continuously. */}
      <span
        className={`shrink-0 rounded-full ${dot} ${
          wroteToday
            ? "bg-tertiary"
            : "border border-on-surface-variant/40 bg-transparent"
        }`}
      />

      {showLabel && (wroteToday ? "Wrote today" : "Has not written")}
    </span>
  );
}
