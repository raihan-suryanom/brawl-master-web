export function PlayerPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Player Header Skeleton */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-10 w-48 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 w-12 bg-muted rounded" />
          ))}
        </div>
      </div>

      {/* Filter Card Skeleton */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
        <div className="flex gap-4">
          <div className="h-10 flex-1 bg-muted rounded" />
          <div className="h-10 flex-1 bg-muted rounded" />
          <div className="h-10 w-32 bg-muted rounded" />
        </div>
      </div>

      {/* Radar Chart Skeleton */}
      <div className="rounded-lg border p-6">
        <div className="space-y-2 mb-4">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-[450px] bg-muted rounded" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-8 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Combinations Tables Skeleton */}
      {[1, 2].map(i => (
        <div key={i} className="rounded-lg border p-6">
          <div className="space-y-2 mb-4">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-64 bg-muted rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(j => (
              <div key={j} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}