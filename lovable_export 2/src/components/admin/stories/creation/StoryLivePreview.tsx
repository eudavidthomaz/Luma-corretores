import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Eye, Layers, MessageSquare } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

interface StoryLivePreviewProps {
  title: string;
  categoryId: string;
  coverPreview: string | null;
  chaptersCount: number;
  isPublished?: boolean;
  isInCarousel?: boolean;
}

export function StoryLivePreview({
  title,
  categoryId,
  coverPreview,
  chaptersCount,
  isPublished = false,
  isInCarousel = false,
}: StoryLivePreviewProps) {
  const { data: categories } = useCategories();
  const categoryName = categories?.find((c) => c.id === categoryId)?.name;

  const placeholderCover =
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=600&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-3"
    >
      <h3 className="text-sm font-medium text-muted-foreground text-center">
        Preview
      </h3>

      <div
        className={cn(
          "relative aspect-[3/4] rounded-2xl overflow-hidden",
          "border transition-all duration-300",
          isPublished
            ? "border-emerald-500/30"
            : "border-luma-glass-border"
        )}
      >
        {/* Cover Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={coverPreview || placeholderCover}
            alt="Preview"
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              !coverPreview && "opacity-50 grayscale"
            )}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {/* Views placeholder */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
            <Eye className="h-3 w-3 text-white/80" />
            <span className="text-xs font-medium text-white/90">0</span>
          </div>

          {/* Status Badge */}
          <Badge
            className={cn(
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
          <h3 className="text-base font-semibold text-white mb-1 line-clamp-2">
            {title || "Título da história..."}
          </h3>
          <div className="flex items-center gap-2 text-sm text-white/70">
            {categoryName && <span>{categoryName}</span>}
            {chaptersCount > 0 && (
              <div className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                <span>{chaptersCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground text-center">
        Preview atualiza em tempo real
      </p>
    </motion.div>
  );
}
