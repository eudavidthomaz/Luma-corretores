import { motion, MotionValue } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, ChevronDown } from "lucide-react";

interface LandingHeroProps {
  textY: MotionValue<number>;
  opacity: MotionValue<number>;
  onScrollDown: () => void;
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" as const },
  viewport: { once: true, margin: "-50px" }
};

export function LandingHero({ textY, opacity, onScrollDown }: LandingHeroProps) {
  const navigate = useNavigate();

  return (
    <section className="snap-section relative z-10 px-4 sm:px-6 pt-24 pb-16 md:pt-32 md:pb-24 min-h-[85vh] md:min-h-screen flex flex-col items-center justify-center">
      <motion.div
        style={{ y: textY, opacity }}
        className="max-w-5xl mx-auto text-center w-full"
      >
        {/* Hook - Paradoxo do Fotógrafo */}
        <motion.div {...fadeInUp}>
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-medium mb-4 md:mb-6">
            Tecnologia para Imobiliárias
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6 md:mb-8 px-2">
            Você passou anos construindo sua carteira,
            <br className="hidden sm:block" />
            <span className="text-muted-foreground"> seus contatos, sua reputação...</span>
            <br />
            <span className="gradient-text mt-2 block">
              Mas ainda perde vendas por não responder na hora.
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          A diferença entre corretores que vendem{" "}
          <span className="text-foreground font-semibold">1 imóvel</span> e{" "}
          <span className="text-foreground font-semibold">10 imóveis</span> por mês
          não está na sorte.{" "}
          <span className="text-foreground font-semibold">Está no atendimento imediato.</span>
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Button
            size="xl"
            variant="gradient"
            onClick={() => navigate("/auth")}
            className="gap-2 text-sm sm:text-base md:text-lg px-6 py-4 sm:px-8 sm:py-5 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_-5px_hsl(var(--primary)/0.7)] hover:scale-[1.02] transition-all duration-300 touch-target"
          >
            <Zap className="h-4 w-4 md:h-5 md:w-5" />
            Assinar Agora
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </motion.div>

        <motion.p
          className="text-xs sm:text-sm text-muted-foreground mt-4 md:mt-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Setup em 15 minutos. Cancele quando quiser.
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={onScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.button>
    </section>
  );
}
