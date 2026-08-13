export function Skeleton({ className = "", style }) {
  return (
    <div
      className={`animate-pulse bg-guild-800 rounded ${className}`}
      style={style}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-guild-800 via-guild-700 to-guild-800 animate-shimmer" />
    </div>
  );
}

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`card-surface rounded-xl p-4 space-y-3 ${className}`}>
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-4 w-1/2 rounded" />
      <Skeleton className="h-4 w-5/6 rounded" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  );
}

export function SkeletonProfile({ className = "" }) {
  return (
    <div className={`card-surface rounded-2xl p-6 space-y-6 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
      </div>
    </div>
  );
}

export function SkeletonGuild({ className = "" }) {
  return (
    <div className={`card-surface rounded-xl p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonMediaGrid({ count = 6, className = "" }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface rounded-xl overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ count = 5, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface rounded-xl p-4 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-3 w-1/4 rounded" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonLeaderboard({ count = 10, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface rounded-xl p-3 flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded font-bold text-center flex items-center justify-center" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
          <div className="flex gap-4 text-right">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonButton({ className = "", ...props }) {
  return (
    <button
      disabled
      className={`animate-pulse bg-guild-800 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all border border-guild-700 ${className}`}
      {...props}
    >
      <div className="h-4 w-20 bg-gradient-to-r from-guild-800 via-guild-700 to-guild-800 animate-shimmer rounded" />
    </button>
  );
}

export function SkeletonInput({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse bg-guild-900 rounded-lg border border-guild-700 px-3 py-2 ${className}`}
      {...props}
    >
      <div className="h-4 w-3/4 bg-gradient-to-r from-guild-800 via-guild-700 to-guild-800 animate-shimmer rounded" />
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-guild-950 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-10 w-48 rounded-lg mb-8 mx-auto" />
      <div className="max-w-4xl mx-auto space-y-6">
        <SkeletonProfile />
        <SkeletonGuild />
        <SkeletonMediaGrid count={6} />
      </div>
    </div>
  );
}

export function PageHeaderSkeleton({ className = "" }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>
      <SkeletonButton className="w-full sm:w-auto" />
    </div>
  );
}