import { motion, MotionValue } from "framer-motion";
import { Camera, Users, Award, TrendingUp } from "lucide-react";

interface LandingAuthorityProps {
  scale: MotionValue<number>;
}

const stats = [
  { icon: Users, value: "50.000+", label: "Fotógrafos formados" },
  { icon: Award, value: "#1", label: "Comunidade do Brasil" },
  { icon: TrendingUp, value: "10 anos", label: "De mercado" }
];

export function LandingAuthority({ scale }: LandingAuthorityProps) {
  return (
    <section className="snap-section relative z-10 px-4 sm:px-6 py-16 md:py-32 min-h-[85vh] md:min-h-screen flex items-center">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          className="relative"
          style={{ scale }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-card/80 rounded-2xl md:rounded-3xl" />
          <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] rounded-2xl md:rounded-3xl" />

          <div className="relative glass rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-16 text-center border border-primary/10">
            <Camera className="h-8 w-8 md:h-12 md:w-12 text-primary mx-auto mb-6 md:mb-8 opacity-50" />

            <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-medium">
              Quem está por trás
            </span>

            <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed font-light mt-4 mb-8">
              "A Liga da Fotografia nasceu para fazer fotógrafos{" "}
              <span className="font-semibold gradient-text">viverem de fotografia</span>.
              A Luma é a próxima evolução: você finalmente pode ser{" "}
              <span className="font-semibold text-foreground">artista no trabalho</span>...
              e <span className="font-semibold gradient-text">empresário nos resultados</span>."
            </blockquote>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 border-t border-luma-glass-border">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                >
                  <stat.icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
