import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { getEmbedUrl, isValidVideoUrl, getVideoThumbnailUrl } from "@/lib/videoUtils";

interface VideoHeroPlayerProps {
  videoUrl: string;
  fallbackImageUrl?: string | null;
}

/**
 * Generates embed URL with mute parameter for sound toggle
 */
function getEmbedUrlWithMute(url: string, muted: boolean): string | null {
  const baseUrl = getEmbedUrl(url);
  if (!baseUrl) return null;
  
  // Toggle mute parameter in the URL
  if (muted) {
    return baseUrl;
  }
  
  // Replace mute=1 with mute=0 for YouTube, muted=1 with muted=0 for Vimeo
  return baseUrl
    .replace('mute=1', 'mute=0')
    .replace('muted=1', 'muted=0')
    .replace('silentAutoPlay=true', 'silentAutoPlay=false');
}

export function VideoHeroPlayer({ videoUrl, fallbackImageUrl }: VideoHeroPlayerProps) {
  const [isMuted, setIsMuted] = useState(true);
  const isValid = isValidVideoUrl(videoUrl);
  
  // Memoize embed URL to prevent unnecessary re-renders
  const embedUrl = useMemo(() => {
    if (!isValid) return null;
    return getEmbedUrlWithMute(videoUrl, isMuted);
  }, [videoUrl, isValid, isMuted]);
  
  // Get thumbnail for fallback
  const thumbnailUrl = useMemo(() => {
    return getVideoThumbnailUrl(videoUrl) || fallbackImageUrl;
  }, [videoUrl, fallbackImageUrl]);
  
  // If video URL is invalid, show fallback image or gradient
  if (!isValid || !embedUrl) {
    if (thumbnailUrl) {
      return (
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            src={thumbnailUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/95 via-[#1a1a1a]/30 to-[#1a1a1a]/50" />
        </div>
      );
    }
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Video Background Layer - scaled up to cover viewport */}
      <motion.div
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 1, scale: 1.1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <iframe
          key={`video-${isMuted}`} // Force re-render on mute change
          src={embedUrl}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: 'scale(1.2)', // Overscan to hide black bars
            transformOrigin: 'center center',
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Cover Video"
        />
      </motion.div>
      
      {/* Cinematic Gradient Overlays */}
      {/* Top gradient - subtle darkening for header legibility */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#1a1a1a]/60 to-transparent" />
      
      {/* Bottom gradient - strong fade to blend with content below */}
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent" />
      
      {/* Vignette effect for cinematic feel */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(26, 26, 26, 0.4) 100%)'
        }}
      />
      
      {/* Sound Toggle Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-24 right-6 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/20 transition-all duration-300 group"
        aria-label={isMuted ? "Ativar som" : "Silenciar"}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
        ) : (
          <Volume2 className="h-5 w-5 text-white/80 group-hover:text-white transition-colors" />
        )}
      </motion.button>
    </div>
  );
}
