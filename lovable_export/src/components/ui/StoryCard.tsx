import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StoryCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export function StoryCard({
  title,
  subtitle,
  imageUrl,
  badge,
  onClick,
  className,
}: StoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group",
        "border border-luma-glass-border",
        className
      )}
    >
      {/* Image with zoom effect */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 story-card-overlay" />

      {/* Badge */}
      {badge && (
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/90 text-secondary-foreground backdrop-blur-sm">
            {badge}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
      </div>
    </motion.div>
  );
}
