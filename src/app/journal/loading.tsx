import { Skeleton } from "@/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Calendar and Stats */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-[200px] w-full" />
          </div>
          <div className="rounded-xl border border-border/50 bg-card/50 p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Journal Entries */}
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/50 p-4">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
