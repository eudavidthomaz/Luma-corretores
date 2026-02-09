import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Heart, Check } from "lucide-react";

interface GalleryDownloadBarProps {
  photosCount: number;
  isDownloading: boolean;
  downloadProgress: number;
  onDownloadAll: () => void;
  onDownloadFavorites?: () => void;
  favoritesCount?: number;
}

// Editorial easing for premium feel
const editorialEasing = [0.25, 0.1, 0.25, 1] as const;

export function GalleryDownloadBar({
  photosCount,
  isDownloading,
  downloadProgress,
  onDownloadAll,
  onDownloadFavorites,
  favoritesCount = 0,
}: GalleryDownloadBarProps) {
  const isComplete = downloadProgress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: editorialEasing }}
      className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center px-4 sm:px-0"
    >
      {/* Editorial Glass Container */}
      <div className="inline-flex">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-full">
        {/* Subtle gold border glow */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-full bg-gradient-to-r from-champagne-gold/0 via-champagne-gold/10 to-champagne-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Main Container */}
        <div className="relative bg-charcoal-ink/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-full px-3 sm:px-4 py-2.5 sm:py-2 flex items-center justify-center gap-2 sm:gap-3">
          
          <AnimatePresence mode="wait">
            {isDownloading ? (
              <motion.div
                key="downloading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 px-2 sm:px-3 w-full sm:w-auto justify-center"
              >
                {/* Progress Indicator */}
                <div className="relative">
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Check className="w-5 h-5 text-champagne-gold" />
                    </motion.div>
                  ) : (
                    <Loader2 className="w-5 h-5 text-champagne-gold animate-spin" />
                  )}
                </div>
                
                {/* Progress Text & Bar */}
                <div className="flex flex-col gap-1">
                  <span className="font-body text-xs tracking-wide text-white/60 uppercase">
                    {isComplete ? "Concluído" : "Preparando..."}
                  </span>
                  <div className="w-28 sm:w-36 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${downloadProgress}%` }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-champagne-gold/80 to-champagne-gold rounded-full"
                    />
                  </div>
                </div>
                
                {/* Percentage */}
                <span className="font-body text-sm text-champagne-gold tabular-nums min-w-[3ch]">
                  {Math.round(downloadProgress)}%
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-2 sm:gap-3"
              >
                {/* Photo Count - Editorial Style */}
                <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 border-r border-white/10">
                  <span className="font-body text-[11px] tracking-[0.15em] uppercase text-white/40">
                    {photosCount} {photosCount === 1 ? "foto" : "fotos"}
                  </span>
                </div>

                {/* Download Favorites Button - Subtle */}
                {favoritesCount > 0 && onDownloadFavorites && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onDownloadFavorites}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full 
                               font-body text-xs sm:text-sm font-medium 
                               bg-white/5 text-champagne-gold 
                               border border-champagne-gold/20
                               hover:bg-champagne-gold/10 hover:border-champagne-gold/40
                               transition-all duration-300"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Favoritas</span>
                    <span className="text-champagne-gold/80">({favoritesCount})</span>
                  </motion.button>
                )}

                {/* Download All Button - Premium Gold */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onDownloadAll}
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full 
                             font-body text-xs sm:text-sm font-medium tracking-wide
                             bg-gradient-to-r from-champagne-gold to-gold-deep
                             text-charcoal-ink
                             shadow-[0_2px_16px_rgba(200,164,90,0.25)]
                             hover:shadow-[0_4px_24px_rgba(200,164,90,0.35)]
                             transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar todas</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>
    </motion.div>
  );
}
