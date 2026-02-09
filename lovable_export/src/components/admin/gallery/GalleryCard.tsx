import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  Calendar,
  Eye,
  Download,
  Clock,
  Lock,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { Gallery, getDaysUntilExpiration, formatFileSize } from "@/hooks/useGalleries";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getPublicCoverUrl } from "@/lib/galleryStorage";

interface GalleryCardProps {
  gallery: Gallery;
  onClick: () => void;
  index: number;
}

type GalleryState = "expired" | "expiring" | "active" | "draft";

function getGalleryState(gallery: Gallery): GalleryState {
  const daysLeft = getDaysUntilExpiration(gallery.expires_at);
  
  if (gallery.status === "expired" || daysLeft <= 0) return "expired";
  if (gallery.status === "draft") return "draft";
  if (daysLeft <= 3) return "expiring";
  return "active";
}

function getStatusBadge(state: GalleryState, daysLeft: number) {
  switch (state) {
    case "expired":
      return (
        <Badge variant="destructive" className="gap-1">
          Expirada
        </Badge>
      );
    case "expiring":
      return (
        <Badge className="gap-1 bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse">
          <AlertTriangle className="h-3 w-3" />
          Expira em {daysLeft}d
        </Badge>
      );
    case "active":
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          Ativa
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="secondary" className="bg-muted/50">
          Rascunho
        </Badge>
      );
  }
}

function getCardClasses(state: GalleryState): string {
  const base = "glass rounded-2xl border overflow-hidden cursor-pointer transition-all group";
  
  switch (state) {
    case "expired":
      return cn(base, "border-red-500/20 opacity-75 hover:opacity-90");
    case "expiring":
      return cn(base, "border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_20px_hsl(45_93%_47%_/_0.1)]");
    case "active":
      return cn(base, "border-emerald-500/20 hover:border-emerald-500/40");
    case "draft":
      return cn(base, "border-luma-glass-border opacity-90 hover:opacity-100");
    default:
      return cn(base, "border-luma-glass-border hover:border-primary/30");
  }
}

export function GalleryCard({ gallery, onClick, index }: GalleryCardProps) {
  const daysLeft = getDaysUntilExpiration(gallery.expires_at);
  const state = getGalleryState(gallery);
  
  // Converter path relativo para URL pública
  const coverUrl = getPublicCoverUrl(gallery.cover_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.05, 
        duration: 0.3,
        ease: "easeOut"
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={getCardClasses(state)}
    >
      {/* Cover Image */}
      <div className="relative h-40 bg-muted/50 overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={gallery.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              "group-hover:scale-105",
              state === "expired" && "grayscale"
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {getStatusBadge(state, daysLeft)}
        </div>

        {/* Password Lock */}
        {gallery.access_password && (
          <div className="absolute top-3 left-3">
            <div className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Photo Count on Cover */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/90 text-sm">
          <ImageIcon className="h-4 w-4" />
          <span className="font-medium">{gallery.photos_count}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Date */}
        <div>
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {gallery.title}
          </h3>
          {gallery.event_date && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(gallery.event_date), "dd MMM yyyy", { locale: ptBR })}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="h-3.5 w-3.5 text-blue-400" />
            <span>{gallery.views_count}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>{gallery.downloads_count}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className={cn(
                state === "expiring" && "text-amber-400 font-medium",
                state === "expired" && "text-red-400"
              )}>
                {state === "expired"
                  ? "Expirada"
                  : `Expira em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`
                }
              </span>
            </div>
            <span>{formatFileSize(gallery.total_size_bytes)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
