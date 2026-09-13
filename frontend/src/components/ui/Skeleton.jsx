/**
 * Loading placeholders as "paper strips" — warm parchment blocks with a
 * moving sheen, never flat grey boxes.
 */

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`relative overflow-hidden bg-surface-high ${className}`}
      aria-hidden="true"
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-surface-lowest/70 to-transparent" />
    </div>
  );
}

/** A stack of ruled lines, like a page being filled in. */
export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{ width: `${92 - i * (i === lines - 1 ? 34 : 7)}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonJournalCard() {
  return (
    <div className="paper-flat grain-panel p-7">
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
      <SkeletonText lines={4} />
    </div>
  );
}

export function SkeletonFriendCard() {
  return (
    <div className="paper-flat grain-panel p-6">
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      </div>
      <Skeleton className="mb-4 h-5 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default Skeleton;
