import { motion } from "framer-motion";

interface GalleryFooterProps {
  photographerName?: string;
}

export function GalleryFooter({ photographerName }: GalleryFooterProps) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-16 md:py-20 px-4 text-center"
    >
      <div className="max-w-md mx-auto">
        {/* Editorial Ornament - Gold filigree with diamond */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex items-center justify-center gap-4 mb-10"
        >
          <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent to-champagne-gold/50" />
          <div className="w-1.5 h-1.5 rotate-45 bg-champagne-gold/70" />
          <div className="w-16 md:w-24 h-px bg-gradient-to-l from-transparent to-champagne-gold/50" />
        </motion.div>

        {/* Photographer Credit */}
        {photographerName && (
          <>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-body text-[10px] tracking-[0.35em] uppercase text-gallery-text-muted/60 mb-3"
            >
              Fotografado por
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="font-editorial text-xl md:text-2xl text-gallery-text"
            >
              {photographerName}
            </motion.p>
          </>
        )}

        {/* Separator - Three gold dots */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center justify-center gap-3 my-8"
        >
          <div className="w-1 h-1 rounded-full bg-champagne-gold/40" />
          <div className="w-1 h-1 rounded-full bg-champagne-gold/40" />
          <div className="w-1 h-1 rounded-full bg-champagne-gold/40" />
        </motion.div>

        {/* Powered By */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="font-body text-[11px] tracking-[0.15em] text-gallery-text-muted/40"
        >
          Entregue com{" "}
          <span className="text-champagne-gold/70">Luma Gallery</span>
        </motion.p>

        {/* Copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="font-body text-[10px] text-gallery-text-muted/30 mt-4"
        >
          © {new Date().getFullYear()} · Todos os direitos reservados
        </motion.p>
      </div>
    </motion.footer>
  );
}
