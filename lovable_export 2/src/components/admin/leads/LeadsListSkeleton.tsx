import { Skeleton } from "@/components/ui/skeleton";

export function LeadsListSkeleton() {
  return (
    <div className="space-y-3">
      {/* Desktop skeleton */}
      <div className="hidden md:block glass rounded-2xl border border-luma-glass-border p-4">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-6 w-[100px] rounded-full" />
              <Skeleton className="h-2 w-[80px]" />
              <Skeleton className="h-6 w-[80px] rounded-full" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile skeleton */}
      <div className="md:hidden space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass rounded-xl border border-luma-glass-border p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <Skeleton className="h-6 w-[70px] rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-[80px] rounded-full" />
              <Skeleton className="h-5 w-[60px] rounded-full" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-luma-glass-border">
              <Skeleton className="h-2 w-[100px]" />
              <Skeleton className="h-7 w-[60px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
