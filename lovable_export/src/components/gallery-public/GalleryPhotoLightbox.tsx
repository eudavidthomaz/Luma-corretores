import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Heart } from "lucide-react";
import { getSignedUrlForDownload } from "@/lib/galleryStorage";

interface Photo {
  id: string;
  src: string; // Public thumbnail (fast, free)
  originalPath: string; // Private original path (for download)
  width: number;
  height: number;
  alt?: string;
}

interface GalleryPhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDownload: (photo: Photo) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (photoId: string) => void;
}

// Cinematic transition variants
const cinematicEasing = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: cinematicEasing },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    scale: 1.02,
    transition: { duration: 0.4, ease: cinematicEasing },
  }),
};

export function GalleryPhotoLightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  onDownload,
  isFavorite = false,
  onToggleFavorite,
}: GalleryPhotoLightboxProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hdUrl, setHdUrl] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [direction, setDirection] = useState(0);
  const hideTimer = useRef<NodeJS.Timeout>();
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const swipeThreshold = 50;

  const currentPhoto = photos[currentIndex];

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsLoading(true);
      onNavigate(currentIndex - 1);
      resetHideTimer();
    }
  }, [currentIndex, onNavigate, resetHideTimer]);

  const handleNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setDirection(1);
      setIsLoading(true);
      onNavigate(currentIndex + 1);
      resetHideTimer();
    }
  }, [currentIndex, photos.length, onNavigate, resetHideTimer]);

  // Touch handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    resetHideTimer();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;

    if (distance > swipeThreshold) handleNext();
    if (distance < -swipeThreshold) handlePrevious();
  };

  // Auto-hide controls
  useEffect(() => {
    if (!isOpen) return;

    const handleActivity = () => resetHideTimer();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    resetHideTimer();

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      clearTimeout(hideTimer.current);
    };
  }, [isOpen, resetHideTimer]);

  // Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handlePrevious, handleNext]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Load HD image ONLY when user explicitly requests download
  // For viewing, we use the thumbnail (src) which is already public and fast
  // This eliminates 99% of Edge Function calls!
  useEffect(() => {
    if (!isOpen) return;
    
    // Reset HD URL when photo changes - use thumbnail for viewing
    setHdUrl(null);
    setIsLoading(false); // Thumbnail is already loaded
  }, [isOpen, currentIndex]);

  // Load HD only when needed (called from download button)
  const loadHdImage = useCallback(async () => {
    if (!currentPhoto?.originalPath || hdUrl) return;
    
    setIsLoading(true);
    try {
      const url = await getSignedUrlForDownload(currentPhoto.originalPath);
      setHdUrl(url);
    } catch (err) {
      console.error("Failed to load HD image:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPhoto?.originalPath, hdUrl]);

  // NO MORE PRELOADING - This was causing excessive Edge Function calls!
  // Preloading HD images for adjacent photos was expensive and unnecessary.

  if (!currentPhoto) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Backdrop - Premium dark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-charcoal-ink/98 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Content */}
          <div className="relative z-10 w-full h-full flex flex-col">
            {/* Header - Minimalist with auto-hide */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: showControls ? 1 : 0, 
                y: showControls ? 0 : -20 
              }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-4 md:px-6"
            >
              {/* Counter with gold filigree */}
              <div className="flex items-center gap-3">
                <span className="font-body text-[11px] tracking-[0.2em] text-white/40 uppercase">
                  {currentIndex + 1} / {photos.length}
                </span>
                <div className="w-8 h-px bg-gradient-to-r from-champagne-gold/40 to-transparent hidden sm:block" />
              </div>

              {/* Actions - Transparent style */}
              <div className="flex items-center gap-1">
                {/* Favorite Button */}
                {onToggleFavorite && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onToggleFavorite(currentPhoto.id)}
                    className="p-2.5 rounded-full transition-colors"
                    aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <Heart 
                      className={`w-5 h-5 transition-all duration-300 ${
                        isFavorite 
                          ? "text-champagne-gold fill-champagne-gold" 
                          : "text-white/50 hover:text-champagne-gold"
                      }`} 
                    />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDownload(currentPhoto)}
                  className="p-2.5 rounded-full text-white/50 hover:text-champagne-gold transition-colors"
                  aria-label="Download foto"
                >
                  <Download className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2.5 rounded-full text-white/50 hover:text-white transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Image Container */}
            <div className="flex-1 relative flex items-center justify-center px-4 pb-4 md:px-16">
              {/* Navigation Arrows - Desktop only */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: currentIndex > 0 && showControls ? 1 : 0,
                  x: showControls ? 0 : -10
                }}
                transition={{ duration: 0.3 }}
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="hidden md:flex absolute left-6 z-20 w-12 h-12 items-center justify-center
                         text-white/30 hover:text-white/70 transition-colors"
                aria-label="Foto anterior"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </motion.button>

              {/* Image with cinematic transitions */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentPhoto.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="relative max-w-full max-h-full flex items-center justify-center"
                >
                  {/* Loading State - Gold pulsing line */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <motion.div
                          animate={{ scaleX: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="w-16 h-px bg-gradient-to-r from-transparent via-champagne-gold/60 to-transparent origin-center"
                        />
                      </div>
                    </div>
                  )}

                  {/* Blur placeholder from thumbnail */}
                  {isLoading && currentPhoto.src && (
                    <img
                      src={currentPhoto.src}
                      alt=""
                      className="absolute max-w-full max-h-[calc(100vh-120px)] object-contain blur-2xl opacity-30 scale-105"
                      aria-hidden="true"
                    />
                  )}

                  <motion.img
                    src={hdUrl || currentPhoto.src}
                    alt={currentPhoto.alt || `Foto ${currentIndex + 1}`}
                    onLoad={() => setIsLoading(false)}
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ 
                      opacity: isLoading ? 0 : 1, 
                      filter: isLoading ? "blur(10px)" : "blur(0px)" 
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-full max-h-[calc(100vh-120px)] object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation - Next (Desktop only) */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: currentIndex < photos.length - 1 && showControls ? 1 : 0,
                  x: showControls ? 0 : 10
                }}
                transition={{ duration: 0.3 }}
                onClick={handleNext}
                disabled={currentIndex === photos.length - 1}
                className="hidden md:flex absolute right-6 z-20 w-12 h-12 items-center justify-center
                         text-white/30 hover:text-white/70 transition-colors"
                aria-label="Próxima foto"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </motion.button>
            </div>

            {/* Mobile swipe hint - shown briefly */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showControls ? 0.4 : 0 }}
              className="md:hidden absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none"
            >
              <span className="font-body text-[10px] tracking-[0.15em] text-white/40 uppercase">
                Deslize para navegar
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
