import { motion } from "framer-motion";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { VideoHeroPlayer } from "./VideoHeroPlayer";
import { VideoMetaBadges } from "./VideoBadges";
import { isValidVideoUrl } from "@/lib/videoUtils";

interface ProposalHeroProps {
  title: string;
  clientName: string | null;
  profile: {
    business_name: string;
    avatar_url: string | null;
    minisite_avatar_url: string | null;
  };
  validUntil: string | null;
  // Video-specific props
  coverVideoUrl?: string | null;
  revisionLimit?: number;
  deliveryFormats?: string[];
  estimatedDurationMin?: number | null;
  proposalType?: string;
}

export function ProposalHero({ 
  title, 
  clientName, 
  profile, 
  validUntil,
  coverVideoUrl,
  revisionLimit,
  deliveryFormats,
  estimatedDurationMin,
  proposalType,
}: ProposalHeroProps) {
  const avatarUrl = profile.minisite_avatar_url || profile.avatar_url;
  const isVideoProposal = proposalType === 'video';
  const hasVideo = coverVideoUrl && coverVideoUrl.trim().length > 0 && isValidVideoUrl(coverVideoUrl);
  
  return (
    <section className={`relative overflow-hidden ${hasVideo ? 'min-h-[60vh] sm:min-h-[70vh]' : 'py-8 sm:py-12 lg:py-16'}`}>
      {/* Background Layer */}
      {hasVideo ? (
        // Cinematic video background
        <VideoHeroPlayer videoUrl={coverVideoUrl!} fallbackImageUrl={avatarUrl} />
      ) : (
        // Standard gradient background
        <div className="absolute inset-0 bg-gradient-to-b from-gallery-surface to-gallery-background" />
      )}
      
      {/* Content Layer */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: hasVideo ? 0.8 : 0 }}
        className={`relative z-10 container max-w-4xl mx-auto px-4 text-center ${
          hasVideo 
            ? 'flex flex-col justify-end min-h-[60vh] sm:min-h-[70vh] pb-8 sm:pb-12' 
            : ''
        }`}
      >
        {/* Logo */}
        {avatarUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: hasVideo ? 1 : 0.2 }}
            className="mb-4 sm:mb-6 flex justify-center"
          >
            <img 
              src={avatarUrl} 
              alt={profile.business_name}
              className={`h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full object-cover border-2 shadow-lg ${
                hasVideo 
                  ? 'border-white/30' 
                  : 'border-gallery-border'
              }`}
            />
          </motion.div>
        )}
        
        {/* Business Name */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: hasVideo ? 1.1 : 0.3 }}
          className={`text-xs sm:text-sm uppercase tracking-widest mb-1.5 sm:mb-2 ${
            hasVideo 
              ? 'text-white/70' 
              : 'text-gallery-accent'
          }`}
        >
          {profile.business_name}
        </motion.p>
        
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasVideo ? 1.2 : 0.4 }}
          className={`text-2xl sm:text-3xl lg:text-5xl font-semibold text-editorial-display mb-3 sm:mb-4 px-2 ${
            hasVideo 
              ? 'text-white' 
              : 'text-gallery-text'
          }`}
        >
          {title}
        </motion.h1>
        
        {/* Meta info - Stacked on mobile, inline on desktop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: hasVideo ? 1.3 : 0.5 }}
          className={`flex flex-col sm:flex-row flex-wrap items-center justify-center gap-1.5 sm:gap-4 text-xs sm:text-sm ${
            hasVideo 
              ? 'text-white/70' 
              : 'text-gallery-text-muted'
          }`}
        >
          {clientName && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate max-w-[200px] sm:max-w-none">Preparado para {clientName}</span>
            </span>
          )}
          {validUntil && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Válida até {format(new Date(validUntil), "dd 'de' MMMM", { locale: ptBR })}
            </span>
          )}
        </motion.div>
        
        {/* Video Meta Badges - Only for video proposals */}
        {isVideoProposal && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasVideo ? 1.4 : 0.6 }}
            className="mt-4 sm:mt-6"
          >
            <VideoMetaBadges 
              revisionLimit={revisionLimit}
              deliveryFormats={deliveryFormats}
              estimatedDurationMin={estimatedDurationMin}
            />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
