import { motion } from "framer-motion";
import { CarouselPhoto } from "@/hooks/useMinisiteCarousel";

interface PinterestGridProps {
  photos: CarouselPhoto[];
}

export function PinterestGrid({ photos }: PinterestGridProps) {
  return (
    <div className="px-4 sm:px-6">
      <div className="columns-2 sm:columns-3 gap-3 space-y-3">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="break-inside-avoid"
          >
            <div className="rounded-xl overflow-hidden bg-muted">
              <img
                src={photo.thumbnail_url || photo.file_url}
                alt=""
                className="w-full h-auto object-cover"
                loading="lazy"
                draggable={false}
                style={{
                  aspectRatio: photo.width && photo.height 
                    ? `${photo.width} / ${photo.height}` 
                    : 'auto',
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
