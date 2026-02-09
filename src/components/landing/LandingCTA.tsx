import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Clock } from "lucide-react";

export function LandingCTA() {
  const navigate = useNavigate();

  return (
    <section className="snap-section relative z-10 px-4 sm:px-6 py-16 md:py-32 min-h-[85vh] md:min-h-screen flex items-center justify-center">
      <motion.div
        className="max-w-3xl mx-auto text-center w-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm text-primary font-medium">Pronto em 15 minutos</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
          Cada minuto que passa é um cliente que{" "}
          <span className="gradient-text">o concorrente está fechando</span>
        </h2>

        <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-10">
          Configure a Luma agora.{" "}
          <span className="text-foreground font-medium">Resultados imediatos.</span>
        </p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <Button
            size="xl"
            variant="gradient"
            onClick={() => navigate("/auth")}
            className="gap-2 text-sm sm:text-base md:text-lg px-8 py-5 sm:px-10 sm:py-6 shadow-[0_0_40px_-5px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_60px_-5px_hsl(var(--primary)/0.7)] hover:scale-[1.02] transition-all duration-300 touch-target"
          >
            <Zap className="h-4 w-4 md:h-5 md:w-5" />
            Assinar Agora
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <span>✓ Setup em 15min</span>
          <span>✓ Cancele quando quiser</span>
          <span>✓ Suporte dedicado</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
