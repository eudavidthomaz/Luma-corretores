import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Monitor, Smartphone, Eye, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GalleryThemeProvider } from "@/components/gallery-public/GalleryThemeProvider";
import { GalleryHero } from "@/components/gallery-public/GalleryHero";
import { GalleryMasonryGrid } from "@/components/gallery-public/GalleryMasonryGrid";
import { GalleryFooter } from "@/components/gallery-public/GalleryFooter";
import { getPublicCoverUrlHQ, getPublicThumbnailUrl } from "@/lib/galleryStorage";
import type { Gallery, GalleryPhoto } from "@/hooks/useGalleries";

interface GalleryPreviewProps {
  gallery: Gallery;
  photos: GalleryPhoto[];
  businessName: string;
}

type ViewMode = "desktop" | "mobile";

export function GalleryPreview({ gallery, photos, businessName }: GalleryPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  // Resolve cover URL - HIGH QUALITY for hero display
  const resolvedCoverUrl = useMemo(() => {
    return getPublicCoverUrlHQ(gallery.cover_url);
  }, [gallery.cover_url]);

  // Transform photos to the format expected by GalleryMasonryGrid
  // Use PUBLIC thumbnail URLs - no Edge Function needed!
  const previewPhotos = useMemo(() => {
    return photos.map((p) => {
      const thumbnailPath = p.thumbnail_url || p.file_path;
      return {
        id: p.id,
        src: getPublicThumbnailUrl(thumbnailPath),
        originalPath: p.file_path,
        width: p.width || 800,
        height: p.height || 600,
        alt: p.filename,
      };
    });
  }, [photos]);

  if (photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-12 border border-luma-glass-border text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma foto na galeria</h3>
        <p className="text-sm text-muted-foreground">
          Adicione fotos na aba "Fotos" para visualizar a preview
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Preview Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("desktop")}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            Desktop
          </Button>
          <Button
            variant={viewMode === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("mobile")}
            className="gap-2"
          >
            <Smartphone className="h-4 w-4" />
            Mobile
          </Button>
        </div>

        <Badge variant="outline" className="gap-1.5 text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Badge>
      </div>

      {/* Preview Container */}
      <div
        className={`
          mx-auto border-2 border-dashed border-luma-glass-border rounded-2xl overflow-hidden
          transition-all duration-300 bg-background
          ${viewMode === "desktop" ? "w-full max-w-[1200px]" : "w-[375px]"}
        `}
      >
        <div className="h-[700px] overflow-y-auto overflow-x-hidden">
          <GalleryThemeProvider>
            {/* Hero */}
            <GalleryHero
              title={gallery.title}
              description={gallery.description || undefined}
              eventDate={gallery.event_date || undefined}
              coverUrl={resolvedCoverUrl || undefined}
              expiresAt={gallery.expires_at}
              photosCount={photos.length}
              onScrollToGallery={() => {}}
            />

            {/* Photo Grid */}
            <div className="px-4 sm:px-6 lg:px-8 py-8">
              <GalleryMasonryGrid
                photos={previewPhotos}
                onPhotoClick={() => {}}
                favorites={new Set()}
                onToggleFavorite={() => {}}
              />
            </div>

            {/* Footer */}
            <GalleryFooter photographerName={businessName} />
          </GalleryThemeProvider>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-muted-foreground">
        Esta é uma visualização prévia. Interações como favoritos e download estão desabilitadas.
      </p>
    </motion.div>
  );
}
