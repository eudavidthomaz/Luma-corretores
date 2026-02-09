import { motion, MotionValue } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight, ChevronDown, Play, Users } from "lucide-react";

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

export function LandingHeroNew({ textY, opacity, onScrollDown }: LandingHeroProps) {
  const navigate = useNavigate();

  const scrollToPricing = () => {
    const pricingSection = document.getElementById("pricing");
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="snap-section relative z-10 px-4 sm:px-6 pt-24 pb-16 md:pt-32 md:pb-24 min-h-[85vh] md:min-h-screen flex flex-col items-center justify-center">
      <motion.div
        style={{ y: textY, opacity }}
        className="max-w-5xl mx-auto text-center w-full"
      >
        {/* Trust Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <Users className="h-4 w-4 text-primary" />
          <span className="text-xs sm:text-sm text-primary font-medium">
            Usado por 50.000+ fotógrafos
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.div {...fadeInUp}>
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4 md:mb-6">
            Pela Liga da Fotografia
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6 md:mb-8 px-2">
            Você passou anos dominando a luz,
            <br className="hidden sm:block" />
            <span className="text-muted-foreground"> a cor, o momento perfeito...</span>
            <br />
            <span className="gradient-text mt-2 block">
              Mas ainda responde DMs às 23h por R$800.
            </span>
          </h1>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          A diferença entre fotógrafos que faturam{" "}
          <span className="text-foreground font-semibold">R$5mil</span> e{" "}
          <span className="text-foreground font-semibold">R$50mil</span> por mês
          não está na câmera.
        </motion.p>

        {/* Value Proposition */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-foreground font-semibold mb-8 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          Está no sistema de vendas.{" "}
          <span className="gradient-text">Conheça a Luma.</span>
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Button
            size="xl"
            variant="gradient"
            onClick={() => navigate("/auth")}
            className="gap-2 text-sm sm:text-base md:text-lg px-6 py-4 sm:px-8 sm:py-5 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_60px_-5px_hsl(var(--primary)/0.7)] hover:scale-[1.02] transition-all duration-300 touch-target"
          >
            <Zap className="h-4 w-4 md:h-5 md:w-5" />
            Começar Agora
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          <Button
            size="lg"
            variant="glass"
            onClick={scrollToPricing}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Ver Planos
          </Button>
        </motion.div>

        {/* Trust Points */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 md:mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-luma-glass-border">
            ✓ Setup em 15min
          </Badge>
          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-luma-glass-border">
            ✓ Cancele quando quiser
          </Badge>
          <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-luma-glass-border">
            ✓ Suporte dedicado
          </Badge>
        </motion.div>
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
