import { motion } from "framer-motion";
import { Eye, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

type Story = Tables<"stories">;

interface StoryCardProps {
  story: Story;
  categoryName?: string;
  onClick: () => void;
  index: number;
}

export function StoryCard({ story, categoryName, onClick, index }: StoryCardProps) {
  const isPublished = story.is_published;
  const isInCarousel = story.is_published && story.show_in_carousel;

  const coverUrl =
    story.cover_image_url ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 + index * 0.03 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group",
        "border transition-all duration-300",
        isPublished
          ? "border-emerald-500/30 hover:border-emerald-500/50"
          : "border-luma-glass-border hover:border-primary/30",
        !isPublished && "opacity-90"
      )}
    >
      {/* Cover Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={coverUrl}
          alt={story.title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110",
            !isPublished && "grayscale-[30%]"
          )}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
        {/* Views Badge */}
        {story.views_count > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
            <Eye className="h-3 w-3 text-white/80" />
            <span className="text-xs font-medium text-white/90">
              {story.views_count}
            </span>
          </div>
        )}

        {/* Status Badge */}
        <Badge
          className={cn(
            "shrink-0",
            isPublished
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          )}
        >
          {isPublished ? "Publicada" : "Rascunho"}
        </Badge>
      </div>

      {/* Chat Badge */}
      {isInCarousel && (
        <div className="absolute top-12 right-3">
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 gap-1">
            <MessageSquare className="h-3 w-3" />
            Chat
          </Badge>
        </div>
      )}

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-1 line-clamp-2">
          {story.title}
        </h3>
        {categoryName && (
          <p className="text-sm text-white/70 line-clamp-1">{categoryName}</p>
        )}
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      </div>
    </motion.div>
  );
}
