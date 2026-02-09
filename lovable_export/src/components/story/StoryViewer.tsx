import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MessageCircle, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useTrackStoryView } from "@/hooks/useAnalytics";
import lumaLogoWhite from "@/assets/luma-logo-white.png";

type StoryChapter = Tables<"story_chapters">;

interface StoryViewerProps {
  storyId: string;
  storyTitle: string;
  profileId: string;
  chapters: StoryChapter[];
  onClose: () => void;
  onRequestQuote: () => void;
}

export function StoryViewer({ storyId, storyTitle, profileId, chapters, onClose, onRequestQuote }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackView = useTrackStoryView();
  const hasTrackedView = useRef(false);
  
  const sortedChapters = [...chapters].sort((a, b) => a.order_index - b.order_index);
  const currentChapter = sortedChapters[currentIndex];
  const isLastChapter = currentIndex === sortedChapters.length - 1;
  const isVideo = currentChapter?.media_type === "video";
  
  // Track view on mount
  useEffect(() => {
    if (!hasTrackedView.current && storyId && profileId) {
      trackView.mutate({ storyId, profileId });
      hasTrackedView.current = true;
    }
  }, [storyId, profileId, trackView]);
  
  const goToNext = useCallback(() => {
    if (currentIndex < sortedChapters.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    }
  }, [currentIndex, sortedChapters.length]);
  
  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  // Handle video playback
  useEffect(() => {
    if (videoRef.current && isVideo) {
      if (isVideoPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoPlaying, isVideo, currentIndex]);

  // Auto-advance progress bar (only for images)
  useEffect(() => {
    if (isVideo) return; // Video handles its own timing
    
    const duration = 5000; // 5 seconds per chapter
    const interval = 50;
    const increment = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (!isLastChapter) {
            goToNext();
          }
          return 0;
        }
        return prev + increment;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [currentIndex, isLastChapter, goToNext, isVideo]);

  // Handle video time update for progress
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    if (!isLastChapter) {
      goToNext();
    }
  };

  // Toggle video play/pause
  const toggleVideoPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVideoPlaying(prev => !prev);
  };

  // Toggle mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        if (e.key === " " && isVideo) {
          setIsVideoPlaying(prev => !prev);
        } else {
          goToNext();
        }
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "m") {
        setIsMuted(prev => !prev);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, onClose, isVideo]);

  if (!currentChapter) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
        {sortedChapters.map((chapter, index) => (
          <div
            key={index}
            className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden"
          >
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{
                width: index < currentIndex 
                  ? "100%" 
                  : index === currentIndex 
                    ? `${progress}%` 
                    : "0%"
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-2">
            <img src={lumaLogoWhite} alt="Luma" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">{storyTitle}</p>
            <p className="text-white/60 text-xs">
              {currentIndex + 1} de {sortedChapters.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Video controls */}
          {isVideo && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVideoPlayback}
                className="text-white hover:bg-white/10"
              >
                {isVideoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/10"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="relative h-full flex items-center justify-center">
        {/* Navigation areas */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
          onClick={goToPrev}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
          onClick={goToNext}
        />
        
        {/* Chapter media */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={currentChapter.media_url}
                className="w-full h-full object-cover"
                autoPlay
                muted={isMuted}
                playsInline
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleVideoEnd}
              />
            ) : (
              <img
                src={currentChapter.media_url}
                alt={`Chapter ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows (desktop) */}
        <div className="hidden md:flex absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between px-4 z-20 pointer-events-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="pointer-events-auto text-white hover:bg-white/10 disabled:opacity-0"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            disabled={isLastChapter}
            className="pointer-events-auto text-white hover:bg-white/10 disabled:opacity-0"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Narrative text */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-24">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentChapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-white text-lg md:text-xl font-light max-w-2xl mx-auto text-center leading-relaxed"
            >
              {currentChapter.narrative_text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* CTA Button */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={onRequestQuote}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-6 py-3 rounded-full gap-2 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Solicitar Orçamento
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
