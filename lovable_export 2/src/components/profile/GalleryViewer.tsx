import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MessageCircle, ZoomIn, ZoomOut, Grid, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tables } from "@/integrations/supabase/types";
import { useTrackStoryView } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import { getOptimizedPortfolioUrl } from "@/lib/imageUtils";

type StoryChapter = Tables<"story_chapters">;

interface GalleryViewerProps {
  storyId: string;
  storyTitle: string;
  profileId: string;
  chapters: StoryChapter[];
  onClose: () => void;
  onRequestQuote: () => void;
}

export function GalleryViewer({ 
  storyId, 
  storyTitle, 
  profileId, 
  chapters, 
  onClose, 
  onRequestQuote 
}: GalleryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showNarrative, setShowNarrative] = useState(false);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const trackView = useTrackStoryView();
  const hasTrackedView = useRef(false);

  const sortedChapters = [...chapters].sort((a, b) => a.order_index - b.order_index);
  const currentChapter = sortedChapters[currentIndex];
  const isFirstChapter = currentIndex === 0;
  const isLastChapter = currentIndex === sortedChapters.length - 1;

  // Track view on mount
  useEffect(() => {
    if (!hasTrackedView.current && storyId && profileId) {
      trackView.mutate({ storyId, profileId });
      hasTrackedView.current = true;
    }
  }, [storyId, profileId, trackView]);

  // Scroll thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current) {
      const thumbnail = thumbnailsRef.current.children[currentIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [currentIndex]);

  // Reset loaded state when changing chapters
  useEffect(() => {
    setIsImageLoaded(false);
    setShowNarrative(false);
  }, [currentIndex]);

  // Preload next image
  useEffect(() => {
    if (currentIndex < sortedChapters.length - 1) {
      const nextChapter = sortedChapters[currentIndex + 1];
      if (nextChapter.media_type !== 'video') {
        const img = new Image();
        img.src = getOptimizedPortfolioUrl(nextChapter.media_url, 'medium');
      }
    }
  }, [currentIndex, sortedChapters]);

  const goToNext = useCallback(() => {
    if (!isLastChapter) {
      setCurrentIndex(prev => prev + 1);
      setIsZoomed(false);
    }
  }, [isLastChapter]);

  const goToPrev = useCallback(() => {
    if (!isFirstChapter) {
      setCurrentIndex(prev => prev - 1);
      setIsZoomed(false);
    }
  }, [isFirstChapter]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          goToNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goToPrev();
          break;
        case "Escape":
          onClose();
          break;
        case "g":
          setShowThumbnails(prev => !prev);
          break;
        case "z":
          setIsZoomed(prev => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, onClose]);

  if (!currentChapter) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col"
    >
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 py-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
          <div>
            <h2 className="text-white font-semibold text-lg">{storyTitle}</h2>
            <p className="text-white/60 text-sm">
              {currentIndex + 1} de {sortedChapters.length} fotos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Narrative Badge - Only show if there's text */}
          {currentChapter.narrative_text && (
            <Badge
              variant="secondary"
              className="hidden md:flex items-center gap-1.5 max-w-[200px] cursor-pointer bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm border-white/20 transition-all"
              onClick={() => setShowNarrative(true)}
            >
              <MessageSquare className="w-3 h-3 flex-shrink-0" />
              <span className="truncate text-xs">
                {currentChapter.narrative_text.slice(0, 30)}...
              </span>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsZoomed(prev => !prev)}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowThumbnails(prev => !prev)}
            className={cn(
              "text-white/80 hover:text-white hover:bg-white/10",
              showThumbnails && "bg-white/10"
            )}
          >
            <Grid className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Navigation Areas (touch/click) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1/4 z-10 cursor-pointer"
          onClick={goToPrev}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-1/4 z-10 cursor-pointer"
          onClick={goToNext}
        />

        {/* Loading Spinner */}
        {!isImageLoaded && currentChapter.media_type !== 'video' && (
          <div className="absolute inset-0 flex items-center justify-center z-5">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Image Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative max-w-full max-h-full flex items-center justify-center p-4",
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
            )}
            onClick={() => setIsZoomed(prev => !prev)}
          >
            {currentChapter.media_type === "video" ? (
              <video
                src={currentChapter.media_url}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <motion.img
                src={getOptimizedPortfolioUrl(currentChapter.media_url, isZoomed ? 'full' : 'medium')}
                alt={`Foto ${currentIndex + 1}`}
                onLoad={() => setIsImageLoaded(true)}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ 
                  opacity: isImageLoaded ? 1 : 0, 
                  filter: isImageLoaded ? "blur(0px)" : "blur(10px)" 
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn(
                  "max-h-[70vh] object-contain rounded-lg shadow-2xl transition-transform duration-300",
                  isZoomed ? "scale-150 cursor-grab" : "scale-100"
                )}
                style={{ maxWidth: isZoomed ? "none" : "100%" }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <div className="hidden md:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between px-4 z-20 pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            disabled={isFirstChapter}
            className="pointer-events-auto h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            disabled={isLastChapter}
            className="pointer-events-auto h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-0 transition-all"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Mobile Narrative Badge */}
        {currentChapter.narrative_text && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute bottom-4 left-4 right-4 z-20"
          >
            <Badge
              variant="secondary"
              className="w-full justify-center gap-2 py-2 cursor-pointer bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm border-white/20"
              onClick={() => setShowNarrative(true)}
            >
              <MessageSquare className="w-4 h-4" />
              Ver descrição
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Narrative Sheet */}
      <Sheet open={showNarrative} onOpenChange={setShowNarrative}>
        <SheetContent 
          side="bottom" 
          className="h-auto max-h-[50vh] bg-black/95 border-white/10 backdrop-blur-xl"
        >
          <div className="py-6 px-4">
            <p className="text-white/90 text-center text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              {currentChapter.narrative_text}
            </p>
          </div>
        </SheetContent>
      </Sheet>

      {/* Thumbnails Strip */}
      <AnimatePresence>
        {showThumbnails && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.3 }}
            className="relative z-20 bg-black/80 backdrop-blur-xl border-t border-white/10"
          >
            <div
              ref={thumbnailsRef}
              className="flex gap-2 p-4 overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {sortedChapters.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => goToIndex(index)}
                  className={cn(
                    "relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all duration-200",
                    currentIndex === index
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-black scale-105"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  {chapter.media_type === "video" ? (
                    <video
                      src={chapter.media_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={getOptimizedPortfolioUrl(chapter.media_url, 'thumb')}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <span className="absolute bottom-1 right-1 text-[10px] text-white bg-black/60 px-1 rounded">
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Button */}
      <div className="relative z-20 p-4 bg-gradient-to-t from-black to-transparent">
        <div className="max-w-sm mx-auto">
          <Button
            onClick={onRequestQuote}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/30 rounded-xl text-base font-semibold gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Solicitar Orçamento
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
