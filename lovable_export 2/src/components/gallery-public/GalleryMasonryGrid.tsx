import { MasonryPhotoAlbum, RenderImageContext, RenderImageProps } from "react-photo-album";
import "react-photo-album/masonry.css";
import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { Heart } from "lucide-react";

interface Photo {
  id: string;
  src: string;
  thumbnailSrc?: string;
  originalPath: string;
  width: number;
  height: number;
  alt?: string;
}

interface GalleryMasonryGridProps {
  photos: Photo[];
  onPhotoClick: (index: number) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (photoId: string) => void;
}

// Editorial transition config
const editorialEasing = [0.25, 0.1, 0.25, 1] as const;

function PhotoCard(
  { alt, title }: RenderImageProps,
  { photo, width, height, index }: RenderImageContext<Photo> & { index: number },
  onPhotoClick: (index: number) => void,
  isFavorite: boolean,
  onToggleFavorite?: (photoId: string) => void
) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(photo.id);
  };

  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.992 }}
      transition={{ duration: 0.3, ease: editorialEasing }}
      onClick={() => onPhotoClick(index)}
      className="relative rounded-md overflow-hidden cursor-pointer group photo-frame-editorial"
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: `${width} / ${height}`,
      }}
    >
      {/* Base Placeholder - Ivory gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-ivory-base to-ivory-paper" />

      {/* Blur Thumbnail Placeholder - Shows while main image loads */}
      {!isLoaded && photo.thumbnailSrc && (
        <img
          src={photo.thumbnailSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-105"
          aria-hidden="true"
        />
      )}

      {/* Main Image with blur reveal */}
      <motion.img
        src={photo.src}
        alt={alt || photo.alt || "Foto da galeria"}
        title={title}
        onLoad={() => setIsLoaded(true)}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ 
          opacity: isLoaded ? 1 : 0, 
          filter: isLoaded ? "blur(0px)" : "blur(10px)" 
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      {/* Editorial Hover Overlay - Very subtle bidirectional gradient */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100
                   bg-gradient-to-t from-charcoal-ink/15 via-transparent to-charcoal-ink/5
                   transition-opacity duration-500 pointer-events-none"
      />

      {/* Editorial Frame - Gold border with inset and subtle glow */}
      <div 
        className="absolute inset-[3px] rounded-[4px] pointer-events-none 
                   border border-transparent 
                   group-hover:border-champagne-gold/25
                   transition-all duration-500 ease-out
                   group-hover:shadow-[inset_0_0_12px_rgba(200,164,90,0.08)]"
      />

      {/* Favorite Button - Minimal, dark blur background */}
      {onToggleFavorite && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: isFavorite ? 1 : 0, 
            scale: isFavorite ? 1 : 0.9 
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 
                     p-2 sm:p-2.5 rounded-full 
                     backdrop-blur-sm transition-all duration-300 z-10
                     ${isFavorite 
                       ? "bg-charcoal-ink/60 opacity-100" 
                       : "bg-charcoal-ink/40 opacity-0 group-hover:opacity-100"
                     }`}
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
              isFavorite 
                ? "text-champagne-gold fill-champagne-gold" 
                : "text-white/70"
            }`}
          />
        </motion.button>
      )}

      {/* Favorite Indicator - Subtle gold line at bottom */}
      {isFavorite && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute bottom-0 left-0 right-0 h-0.5 
                     bg-gradient-to-r from-transparent via-champagne-gold/80 to-transparent
                     origin-center"
        />
      )}
    </motion.div>
  );
}

export function GalleryMasonryGrid({
  photos,
  onPhotoClick,
  favorites = new Set(),
  onToggleFavorite,
}: GalleryMasonryGridProps) {
  const renderImage = useCallback(
    (props: RenderImageProps, context: RenderImageContext<Photo>) => {
      const photoIndex = photos.indexOf(context.photo);
      const isFavorite = favorites.has(context.photo.id);
      return PhotoCard(props, { ...context, index: photoIndex }, onPhotoClick, isFavorite, onToggleFavorite);
    },
    [photos, onPhotoClick, favorites, onToggleFavorite]
  );

  // Responsive columns - optimized for different screen sizes
  const getColumns = useCallback((containerWidth: number) => {
    if (containerWidth < 400) return 2;   // Small mobile
    if (containerWidth < 640) return 2;   // Mobile
    if (containerWidth < 900) return 3;   // Tablet
    if (containerWidth < 1400) return 4;  // Desktop
    return 5;                              // Wide screens
  }, []);

  // Responsive spacing - more breathing room on larger screens
  const getSpacing = useCallback((containerWidth: number) => {
    if (containerWidth < 480) return 8;   // Small mobile - tighter
    if (containerWidth < 640) return 10;  // Mobile
    if (containerWidth < 1024) return 14; // Tablet
    return 18;                             // Desktop - more respiro
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="px-3 sm:px-4 md:px-6 lg:px-8"
    >
      <MasonryPhotoAlbum
        photos={photos}
        columns={getColumns}
        spacing={getSpacing}
        render={{ image: renderImage }}
      />
    </motion.div>
  );
}
