import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GalleryHeroProps {
  title: string;
  description?: string | null;
  eventDate?: string | null;
  coverUrl?: string | null;
  expiresAt: string;
  photosCount: number;
  onScrollToGallery: () => void;
}

function getDaysUntilExpiration(expiresAt: string): number {
  const now = new Date();
  const expDate = new Date(expiresAt);
  const diffMs = expDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function GalleryHero({
  title,
  description,
  eventDate,
  coverUrl,
  expiresAt,
  photosCount,
  onScrollToGallery,
}: GalleryHeroProps) {
  const daysRemaining = getDaysUntilExpiration(expiresAt);
  const formattedEventDate = eventDate
    ? format(new Date(eventDate), "d 'de' MMMM, yyyy", { locale: ptBR })
    : null;

  const hasCover = !!coverUrl;

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      {hasCover ? (
        <>
          {/* Full-bleed photo with Ken Burns effect */}
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <motion.img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover"
              animate={{ scale: [1, 1.03] }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            />
          </motion.div>
          
          {/* Subtle gradient overlay - lets photo breathe */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-ink/80 via-charcoal-ink/20 to-charcoal-ink/30" />
          
          {/* Vignette effect */}
          <div className="absolute inset-0 photo-vignette" />
        </>
      ) : (
        /* No cover: elegant ivory gradient */
        <div className="absolute inset-0 bg-gradient-to-br from-ivory-base via-ivory-paper to-ivory-warm gallery-grain" />
      )}

      {/* Expiration badge - discrete top right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute top-6 right-6 z-20"
      >
        <span className={`text-[10px] font-body tracking-[0.25em] uppercase ${
          hasCover ? "text-white/40" : "text-charcoal-ink/40"
        }`}>
          {daysRemaining === 0
            ? "Expira hoje"
            : daysRemaining === 1
            ? "1d restante"
            : `${daysRemaining}d restantes`}
        </span>
      </motion.div>

      {/* Content anchored to bottom */}
      <div className="relative z-10 mt-auto pb-20 md:pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Editorial ornament */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-champagne-gold/60" />
            <div className="w-1.5 h-1.5 rotate-45 bg-champagne-gold" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-champagne-gold/60" />
          </motion.div>

          {/* Event date as eyebrow */}
          {formattedEventDate && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className={`text-[11px] tracking-[0.3em] uppercase mb-6 ${
                hasCover ? "text-champagne-gold" : "text-gold-deep"
              }`}
            >
              {formattedEventDate}
            </motion.p>
          )}

          {/* Main title - editorial display */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className={`text-editorial-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-normal tracking-[-0.02em] leading-[0.95] mb-8 ${
              hasCover ? "text-white" : "text-charcoal-ink"
            }`}
          >
            {title}
          </motion.h1>

          {/* Description as editorial note */}
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
              className={`font-body text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10 italic ${
                hasCover ? "text-white/60" : "text-charcoal-ink/60"
              }`}
            >
              "{description}"
            </motion.p>
          )}

          {/* Metadata - whispered, not shouted */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className={`text-[11px] tracking-[0.15em] uppercase ${
              hasCover ? "text-white/40" : "text-charcoal-ink/40"
            }`}
          >
            {photosCount} {photosCount === 1 ? "fotografia" : "fotografias"}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - minimalist gold line */}
      <motion.button
        onClick={onScrollToGallery}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer group"
        aria-label="Scroll to gallery"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className={`text-[9px] tracking-[0.3em] uppercase transition-colors ${
            hasCover 
              ? "text-white/30 group-hover:text-champagne-gold/80" 
              : "text-charcoal-ink/30 group-hover:text-gold-deep"
          }`}>
            Explorar
          </span>
          <div className={`w-px h-8 bg-gradient-to-b transition-colors ${
            hasCover 
              ? "from-champagne-gold/60 to-transparent group-hover:from-champagne-gold" 
              : "from-gold-deep/60 to-transparent group-hover:from-gold-deep"
          }`} />
        </motion.div>
      </motion.button>
    </section>
  );
}
