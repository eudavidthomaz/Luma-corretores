import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";

interface CarouselStory {
  id: string;
  title: string;
  category_id: string | null;
  cover_image_url: string | null;
}

interface StoriesCarouselProps {
  stories: CarouselStory[];
  onStoryClick: (storyId: string) => void;
}

export function StoriesCarousel({ stories, onStoryClick }: StoriesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { data: categories } = useCategories();

  // Helper to get category name by ID
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId || !categories) return "";
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || "";
  };

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [stories]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 280;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!stories || stories.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full"
    >
      {/* Section label */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xs text-muted-foreground mb-3 flex items-center gap-2"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        Histórias em destaque
      </motion.p>

      {/* Carousel container */}
      <div className="relative group">
        {/* Left fade & arrow */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-0 top-0 bottom-0 z-10 flex items-center"
            >
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scroll("left")}
                className="h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm border border-luma-glass-border shadow-lg hover:bg-card hover:scale-110 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right fade & arrow */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 z-10 flex items-center"
            >
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => scroll("right")}
                className="h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm border border-luma-glass-border shadow-lg hover:bg-card hover:scale-110 transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-0.5 snap-x snap-mandatory"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.08,
                ease: "easeOut"
              }}
              className="flex-shrink-0 snap-start"
              onMouseEnter={() => setHoveredId(story.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <motion.button
                onClick={() => onStoryClick(story.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "relative w-[140px] h-[180px] rounded-2xl overflow-hidden",
                  "border border-luma-glass-border",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
                  "group/card cursor-pointer"
                )}
              >
                {/* Image with parallax effect */}
                <motion.div 
                  className="absolute inset-0"
                  animate={{ 
                    scale: hoveredId === story.id ? 1.1 : 1 
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <img
                    src={story.cover_image_url || "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=600&fit=crop"}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Category badge */}
                {getCategoryName(story.category_id) && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/80 text-primary-foreground backdrop-blur-sm">
                      {getCategoryName(story.category_id)}
                    </span>
                  </div>
                )}

                {/* Play icon on hover */}
                <AnimatePresence>
                  {hoveredId === story.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                        <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight drop-shadow-lg">
                    {story.title}
                  </h3>
                </div>

                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    boxShadow: hoveredId === story.id 
                      ? "inset 0 0 30px hsl(var(--primary) / 0.3)" 
                      : "inset 0 0 0 transparent"
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
