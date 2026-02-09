import { motion } from "framer-motion";

export function ProposalLoadingSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="relative py-12 sm:py-16">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="h-20 w-20 rounded-full bg-gallery-glass mx-auto gallery-skeleton" />
            <div className="h-4 w-32 rounded bg-gallery-glass mx-auto gallery-skeleton" />
            <div className="h-10 w-72 rounded bg-gallery-glass mx-auto gallery-skeleton" />
            <div className="h-4 w-48 rounded bg-gallery-glass mx-auto gallery-skeleton" />
          </motion.div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="gallery-glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gallery-glass gallery-skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 rounded bg-gallery-glass gallery-skeleton" />
                <div className="h-4 w-32 rounded bg-gallery-glass gallery-skeleton" />
              </div>
              <div className="h-6 w-24 rounded bg-gallery-glass gallery-skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
