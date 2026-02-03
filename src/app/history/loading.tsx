import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-6">
        <Skeleton className="h-5 w-20 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>

      {/* Trade Table */}
      <div className="rounded-xl border border-border/50 bg-card/50">
        <div className="p-4 border-b border-border/50">
          <div className="grid grid-cols-7 gap-4">
            {["Date", "Symbol", "Side", "Type", "Size", "Price", "PnL"].map((header) => (
              <Skeleton key={header} className="h-4 w-16" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
