import { motion } from "framer-motion";

export function LandingVideo() {
  return (
    <section className="snap-section relative z-10 px-4 sm:px-6 py-16 md:py-32 min-h-[85vh] md:min-h-screen flex items-center">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-medium">
            Veja em Ação
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 md:mt-4">
            Luma na prática
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mt-4">
            Descubra como a Luma transforma curiosos em clientes qualificados automaticamente.
          </p>
        </motion.div>

        <motion.div
          className="relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-2xl -z-10" />

          {/* YouTube Embed */}
          <iframe
            src="https://www.youtube.com/embed/tjNzkzmBjvo?rel=0&modestbranding=1"
            title="Apresentação Luma AI"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </motion.div>
      </div>
    </section>
  );
}
