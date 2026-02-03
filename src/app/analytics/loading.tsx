import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[250px] w-full" />
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[250px] w-full" />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[250px] w-full" />
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[250px] w-full" />
        </div>
      </div>
    </div>
  );
}
