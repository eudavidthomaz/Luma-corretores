import { motion } from "framer-motion";

export function GalleryLoadingSkeleton() {
  // Generate random heights for masonry effect
  const skeletonItems = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    height: [200, 280, 220, 300, 240, 260][i % 6],
  }));

  return (
    <div className="min-h-screen bg-gallery-background">
      {/* Hero Skeleton */}
      <div className="relative h-[70vh] flex items-center justify-center px-6">
        <div className="w-full max-w-xl mx-auto">
          <div className="gallery-glass-card rounded-2xl p-8 md:p-12 space-y-6">
            {/* Date */}
            <div className="flex justify-center">
              <div className="gallery-skeleton h-4 w-32 rounded-full" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="gallery-skeleton h-10 w-full rounded-lg" />
              <div className="gallery-skeleton h-10 w-3/4 mx-auto rounded-lg" />
            </div>

            {/* Description */}
            <div className="gallery-skeleton h-4 w-48 mx-auto rounded-full" />

            {/* CTA */}
            <div className="flex justify-center pt-4">
              <div className="gallery-skeleton h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="px-4 md:px-6 lg:px-8 pb-24">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {skeletonItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="mb-4 break-inside-avoid"
            >
              <div
                className="gallery-skeleton rounded-lg"
                style={{ height: item.height }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
