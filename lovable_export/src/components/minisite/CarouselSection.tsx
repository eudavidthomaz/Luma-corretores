import { motion } from "framer-motion";
import { CarouselPhoto } from "@/hooks/useMinisiteCarousel";
import { AnimatedCarousel } from "./AnimatedCarousel";
import { PinterestGrid } from "./PinterestGrid";

interface CarouselSectionProps {
  photos: CarouselPhoto[];
  layout: 'carousel' | 'pinterest';
}

export function CarouselSection({ photos, layout }: CarouselSectionProps) {
  if (!photos || photos.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full py-8 overflow-hidden"
    >
      {layout === 'carousel' ? (
        <AnimatedCarousel photos={photos} />
      ) : (
        <PinterestGrid photos={photos} />
      )}
    </motion.section>
  );
}
