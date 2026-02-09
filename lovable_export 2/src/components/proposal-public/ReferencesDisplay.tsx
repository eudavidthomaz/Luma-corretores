import { motion } from "framer-motion";
import { ExternalLink, Palette, Music, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getVideoThumbnailUrl, getVideoProvider, getEmbedUrl } from "@/lib/videoUtils";
import { useState } from "react";

interface ReferenceLink {
  url: string;
  title: string;
  description?: string;
}

interface SoundtrackLink {
  url: string;
  title: string;
  artist?: string;
}

interface ReferencesDisplayProps {
  referenceLinks?: ReferenceLink[];
  soundtrackLinks?: SoundtrackLink[];
}

export function ReferencesDisplay({ referenceLinks, soundtrackLinks }: ReferencesDisplayProps) {
  const hasReferences = referenceLinks && referenceLinks.length > 0;
  const hasSoundtracks = soundtrackLinks && soundtrackLinks.length > 0;
  
  if (!hasReferences && !hasSoundtracks) return null;

  return (
    <div className="space-y-8">
      {/* Reference Videos */}
      {hasReferences && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-gallery-accent" />
            <h3 className="text-lg font-semibold text-gallery-text">Referências Visuais</h3>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {referenceLinks!.map((ref, index) => (
              <ReferenceCard key={index} reference={ref} index={index} />
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Soundtrack Links */}
      {hasSoundtracks && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Music className="h-5 w-5 text-gallery-accent" />
            <h3 className="text-lg font-semibold text-gallery-text">Trilhas Sonoras</h3>
          </div>
          
          <div className="grid gap-3">
            {soundtrackLinks!.map((track, index) => (
              <SoundtrackCard key={index} track={track} index={index} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ReferenceCard({ reference, index }: { reference: ReferenceLink; index: number }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const thumbnail = getVideoThumbnailUrl(reference.url);
  const provider = getVideoProvider(reference.url);
  const embedUrl = getEmbedUrl(reference.url);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * index }}
    >
      <Card className="gallery-glass-card overflow-hidden hover:border-gallery-accent/30 transition-colors">
        {/* Thumbnail/Player */}
        <div className="aspect-video relative bg-black/20">
          {showPlayer && embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : thumbnail ? (
            <div 
              className="w-full h-full cursor-pointer group"
              onClick={() => setShowPlayer(true)}
            >
              <img 
                src={thumbnail} 
                alt={reference.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="h-6 w-6 text-black ml-1" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-8 w-8 text-gallery-text-muted" />
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gallery-text truncate">
                {reference.title || "Referência"}
              </h4>
              {reference.description && (
                <p className="text-sm text-gallery-text-muted mt-1 line-clamp-2">
                  {reference.description}
                </p>
              )}
            </div>
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gallery-surface rounded-lg transition-colors flex-shrink-0"
            >
              <ExternalLink className="h-4 w-4 text-gallery-text-muted" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SoundtrackCard({ track, index }: { track: SoundtrackLink; index: number }) {
  const isSpotify = track.url.includes('spotify.com');
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <Card className="gallery-glass-card hover:border-gallery-accent/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gallery-accent/10 flex items-center justify-center flex-shrink-0">
              <Music className="h-6 w-6 text-gallery-accent" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gallery-text truncate">
                {track.title || "Trilha"}
              </h4>
              {track.artist && (
                <p className="text-sm text-gallery-text-muted truncate">
                  {track.artist}
                </p>
              )}
            </div>
            
            <a
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gallery-accent/10 hover:bg-gallery-accent/20 transition-colors"
            >
              <Play className="h-4 w-4 text-gallery-accent" />
              <span className="text-sm font-medium text-gallery-accent">Ouvir</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
