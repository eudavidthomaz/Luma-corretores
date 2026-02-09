import { Skeleton } from "@/components/ui/skeleton";

function GalleryCardSkeleton() {
  return (
    <div className="glass rounded-2xl border border-luma-glass-border overflow-hidden">
      {/* Cover */}
      <Skeleton className="h-40 w-full rounded-none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Date */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <GalleryCardSkeleton key={i} />
      ))}
    </div>
  );
}
