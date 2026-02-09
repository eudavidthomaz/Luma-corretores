import { useMemo } from "react";
import { motion } from "framer-motion";
import { CarouselPhoto } from "@/hooks/useMinisiteCarousel";

interface AnimatedCarouselProps {
  photos: CarouselPhoto[];
}

export function AnimatedCarousel({ photos }: AnimatedCarouselProps) {
  // Duplicate photos for seamless infinite scroll
  const duplicatedPhotos = useMemo(() => {
    return [...photos, ...photos, ...photos];
  }, [photos]);

  const animationDuration = photos.length * 4; // 4 seconds per photo

  return (
    <div className="relative w-full overflow-hidden">
      <motion.div
        className="flex gap-4"
        animate={{
          x: [`0%`, `-${100 / 3}%`],
        }}
        transition={{
          x: {
            duration: animationDuration,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {duplicatedPhotos.map((photo, index) => (
          <div
            key={`${photo.id}-${index}`}
            className="flex-shrink-0 h-48 sm:h-64 md:h-72 rounded-xl overflow-hidden bg-muted"
            style={{
              width: photo.width && photo.height 
                ? `${(photo.width / photo.height) * (window.innerWidth > 768 ? 288 : 192)}px`
                : '256px',
            }}
          >
            <img
              src={photo.thumbnail_url || photo.file_url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </motion.div>

      {/* Gradient overlays for smooth edges */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
