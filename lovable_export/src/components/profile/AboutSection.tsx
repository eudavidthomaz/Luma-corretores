import { motion } from "framer-motion";
import { Play, User } from "lucide-react";
import { useState, useRef } from "react";
import { MinisiteTheme } from "@/components/minisite/MinisiteThemeProvider";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  photoUrl?: string | null;
  videoUrl?: string | null;
  text?: string | null;
  businessName: string;
  theme?: MinisiteTheme;
}

export function AboutSection({ photoUrl, videoUrl, text, businessName, theme = 'dark' }: AboutSectionProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Don't render if no content
  if (!photoUrl && !videoUrl && !text) return null;

  const isEditorial = theme === 'editorial';

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  // Conditional classes based on theme
  const underlineClasses = isEditorial
    ? "bg-gradient-to-r from-[hsl(43_50%_57%)] to-[hsl(37_52%_41%)]"
    : "bg-gradient-to-r from-primary to-secondary";
  
  const decorativeGlowClasses = isEditorial
    ? "bg-gradient-to-br from-[hsl(43_50%_57%)/20] to-transparent"
    : "bg-gradient-to-br from-primary/20 to-transparent";
  
  const playButtonClasses = isEditorial
    ? "text-[hsl(37_52%_41%)]"
    : "text-primary";
  
  const fallbackGradientClasses = isEditorial
    ? "bg-gradient-to-br from-[hsl(43_50%_57%)/20] to-[hsl(37_52%_41%)/20]"
    : "bg-gradient-to-br from-primary/20 to-secondary/20";

  return (
    <section id="sobre" className="py-20 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className={cn(
            "text-2xl md:text-3xl font-bold text-foreground mb-2",
            isEditorial && "font-editorial"
          )}>
            Sobre
          </h2>
          <div className={`w-16 h-1 rounded-full mx-auto ${underlineClasses}`} />
        </motion.div>

        {/* Content Layout */}
        <div className={`grid gap-8 items-center ${(photoUrl || videoUrl) && text ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
          {/* Media Column */}
          {(photoUrl || videoUrl) && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden shadow-2xl"
            >
              {videoUrl ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={photoUrl || undefined}
                    className="w-full h-full object-cover"
                    controls={isVideoPlaying}
                    playsInline
                    onEnded={() => setIsVideoPlaying(false)}
                  />
                  {!isVideoPlaying && (
                    <button
                      onClick={handlePlayVideo}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                    >
                      <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className={`h-8 w-8 ml-1 ${playButtonClasses}`} fill="currentColor" />
                      </div>
                    </button>
                  )}
                </div>
              ) : photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`Foto de ${businessName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${fallbackGradientClasses}`}>
                  <User className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
              
              {/* Decorative Elements */}
              <div className={`absolute -bottom-4 -right-4 w-32 h-32 rounded-full blur-2xl ${decorativeGlowClasses}`} />
            </motion.div>
          )}

          {/* Text Column */}
          {text && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`${!photoUrl && !videoUrl ? 'text-center max-w-2xl mx-auto' : ''}`}
            >
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed whitespace-pre-line">
                {text}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
