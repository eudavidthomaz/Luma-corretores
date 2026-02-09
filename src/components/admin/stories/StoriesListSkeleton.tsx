import { Skeleton } from "@/components/ui/skeleton";

export function StoriesListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Quota Card */}
        <div className="lg:col-span-1">
          <Skeleton className="h-[200px] rounded-2xl" />
        </div>
        
        {/* Metrics Card */}
        <div className="lg:col-span-3">
          <Skeleton className="h-[200px] rounded-2xl" />
        </div>
      </div>

      {/* Pipeline Skeleton */}
      <Skeleton className="h-24 rounded-2xl" />

      {/* Filter Skeleton */}
      <Skeleton className="h-20 rounded-2xl" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            className="aspect-[3/4] rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}
