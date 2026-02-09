import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";
import { MinisiteTheme } from "@/components/minisite/MinisiteThemeProvider";
import { cn } from "@/lib/utils";
import { getOptimizedPortfolioUrl } from "@/lib/imageUtils";

type Story = Tables<"stories"> & {
  story_chapters?: Tables<"story_chapters">[];
};

interface PortfolioSectionProps {
  stories: Story[];
  onStoryClick: (story: Story) => void;
  theme?: MinisiteTheme;
}

// Portfolio card with lazy loading and skeleton
function PortfolioCard({
  story,
  index,
  onClick,
  isEditorial
}: {
  story: Story;
  index: number;
  onClick: () => void;
  isEditorial: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageFallbackClasses = isEditorial
    ? "bg-gradient-to-br from-[hsl(43_50%_57%)/20] to-[hsl(37_52%_41%)/20]"
    : "bg-gradient-to-br from-primary/20 to-secondary/20";

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-muted shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* Skeleton placeholder */}
      {!imageLoaded && story.cover_image_url && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Cover Image */}
      {story.cover_image_url ? (
        <img
          src={getOptimizedPortfolioUrl(story.cover_image_url, 'thumb')}
          alt={story.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center ${imageFallbackClasses}`}>
          <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
        </div>
      )}

      {/* Hover Overlay - Only shows on hover (clean look) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4">
        {/* Category Badge */}
        <Badge
          variant="secondary"
          className="self-start mb-2 bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
        >
          {story.category}
        </Badge>

        {/* Title - Always visible with subtle shadow */}
        <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2 drop-shadow-lg">
          {story.title}
        </h3>

        {/* Stats - Only on hover */}
        <div className="flex items-center gap-3 mt-2 text-white/70 text-xs opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {story.views_count || 0}
          </span>
          <span className="flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {story.story_chapters?.length || 0} fotos
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export function PortfolioSection({ stories, onStoryClick, theme = 'dark' }: PortfolioSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const isEditorial = theme === 'editorial';

  // Get unique categories
  const categories = Array.from(new Set(stories.map(s => s.category))).filter(Boolean);

  // Filter stories by category
  const filteredStories = selectedCategory
    ? stories.filter(s => s.category === selectedCategory)
    : stories;

  // Conditional classes based on theme
  const underlineClasses = isEditorial
    ? "bg-gradient-to-r from-[hsl(43_50%_57%)] to-[hsl(37_52%_41%)]"
    : "bg-gradient-to-r from-primary to-secondary";

  const activePillClasses = isEditorial
    ? "bg-[hsl(43_50%_57%)] text-white shadow-lg shadow-[hsl(43_50%_57%)/30]"
    : "bg-primary text-primary-foreground shadow-lg shadow-primary/30";

  if (stories.length === 0) {
    return (
      <section id="portfolio" className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="py-16"
          >
            <ImageIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">Nenhum imóvel publicado ainda</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className={cn(
            "text-2xl md:text-3xl font-bold text-foreground mb-2",
            isEditorial && "font-editorial"
          )}>
            Imóveis em Destaque
          </h2>
          <div className={`w-16 h-1 rounded-full mx-auto ${underlineClasses}`} />
        </motion.div>

        {/* Category Tabs */}
        {categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                ? activePillClasses
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                  ? activePillClasses
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}

        {/* Stories Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredStories.map((story, index) => (
              <PortfolioCard
                key={story.id}
                story={story}
                index={index}
                onClick={() => onStoryClick(story)}
                isEditorial={isEditorial}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
