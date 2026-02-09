import { motion } from "framer-motion";
import { Clock, Mail } from "lucide-react";

interface GalleryExpiredStateProps {
  photographerName?: string;
  photographerEmail?: string;
}

export function GalleryExpiredState({
  photographerName,
  photographerEmail,
}: GalleryExpiredStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gallery-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md text-center"
      >
        <div className="gallery-glass-card rounded-2xl p-10 md:p-12">
          {/* Clock Icon */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warm-gray/10 mb-8"
          >
            <Clock className="w-9 h-9 text-warm-gray" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-editorial text-2xl md:text-3xl text-gallery-text mb-4"
          >
            Esta galeria expirou
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-body text-base text-gallery-text-muted leading-relaxed mb-8"
          >
            As fotos não estão mais disponíveis para visualização ou download.
          </motion.p>

          {/* Contact Info */}
          {photographerName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-6 border-t border-gallery-border"
            >
              <p className="font-body text-sm text-gallery-text-muted mb-4">
                Para solicitar acesso novamente, entre em contato:
              </p>
              <p className="font-editorial text-lg text-gallery-text mb-2">
                {photographerName}
              </p>
              {photographerEmail && (
                <a
                  href={`mailto:${photographerEmail}`}
                  className="inline-flex items-center gap-2 font-body text-sm text-champagne-gold hover:text-champagne-deep transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {photographerEmail}
                </a>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
