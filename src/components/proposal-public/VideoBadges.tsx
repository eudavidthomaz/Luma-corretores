import { motion } from "framer-motion";
import { RefreshCw, Monitor, Smartphone, Square, Clock, Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RevisionBadgeProps {
  revisionLimit: number;
}

export function RevisionBadge({ revisionLimit }: RevisionBadgeProps) {
  if (!revisionLimit || revisionLimit <= 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gallery-accent/10 border border-gallery-accent/30"
    >
      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-gallery-accent" />
      <span className="text-xs sm:text-sm font-medium text-gallery-accent whitespace-nowrap">
        {revisionLimit} {revisionLimit === 1 ? 'revisão' : 'revisões'}
      </span>
    </motion.div>
  );
}

interface DeliveryFormatsBadgeProps {
  formats: string[];
}

export function DeliveryFormatsBadge({ formats }: DeliveryFormatsBadgeProps) {
  if (!formats || formats.length === 0) return null;
  
  const getFormatIcon = (format: string) => {
    switch (format) {
      case "16:9": return Monitor;
      case "9:16": return Smartphone;
      case "1:1": return Square;
      case "4:5": return Smartphone;
      default: return Film;
    }
  };
  
  const getFormatLabel = (format: string) => {
    switch (format) {
      case "16:9": return "Horizontal";
      case "9:16": return "Vertical";
      case "1:1": return "Quadrado";
      case "4:5": return "Portrait";
      default: return format;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gallery-surface border border-gallery-border"
    >
      <Film className="h-3 w-3 sm:h-4 sm:w-4 text-gallery-text-muted" />
      <span className="text-xs sm:text-sm text-gallery-text-muted">Entrega:</span>
      <div className="flex flex-wrap items-center gap-1">
        {formats.map((format) => {
          const Icon = getFormatIcon(format);
          return (
            <Badge 
              key={format} 
              variant="secondary" 
              className="text-xs bg-gallery-accent/10 text-gallery-accent border-gallery-accent/30 px-1.5 sm:px-2"
            >
              <Icon className="h-3 w-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">{getFormatLabel(format)}</span>
              <span className="sm:hidden">{format}</span>
            </Badge>
          );
        })}
      </div>
    </motion.div>
  );
}

interface DurationBadgeProps {
  durationMin: number;
}

export function DurationBadge({ durationMin }: DurationBadgeProps) {
  if (!durationMin || durationMin <= 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gallery-surface border border-gallery-border"
    >
      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gallery-text-muted" />
      <span className="text-xs sm:text-sm text-gallery-text-muted whitespace-nowrap">
        <span className="hidden sm:inline">Duração estimada: </span>
        <span className="font-medium text-gallery-text">{durationMin} min</span>
      </span>
    </motion.div>
  );
}

interface VideoMetaBadgesProps {
  revisionLimit?: number;
  deliveryFormats?: string[];
  estimatedDurationMin?: number | null;
}

export function VideoMetaBadges({ 
  revisionLimit, 
  deliveryFormats, 
  estimatedDurationMin 
}: VideoMetaBadgesProps) {
  const hasAnyBadge = revisionLimit || (deliveryFormats && deliveryFormats.length > 0) || estimatedDurationMin;
  
  if (!hasAnyBadge) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 sm:py-4"
    >
      {revisionLimit && revisionLimit > 0 && (
        <div className="col-span-2 sm:col-span-1 flex justify-center">
          <RevisionBadge revisionLimit={revisionLimit} />
        </div>
      )}
      {deliveryFormats && deliveryFormats.length > 0 && (
        <div className="col-span-2 sm:col-span-1 flex justify-center">
          <DeliveryFormatsBadge formats={deliveryFormats} />
        </div>
      )}
      {estimatedDurationMin && estimatedDurationMin > 0 && (
        <div className="col-span-2 sm:col-span-1 flex justify-center">
          <DurationBadge durationMin={estimatedDurationMin} />
        </div>
      )}
    </motion.div>
  );
}
