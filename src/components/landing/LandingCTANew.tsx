import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Clock, Users } from "lucide-react";

export function LandingCTANew() {
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
        {/* Urgency Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <Clock className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-orange-500 font-medium">Pronto em 15 minutos</span>
        </motion.div>

        {/* Main Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
          Enquanto você lê isso,{" "}
          <span className="gradient-text">seu concorrente está fechando</span>
        </h2>

        <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8">
          Cada lead que você demora para responder é um cliente que o concorrente fecha.{" "}
          <span className="text-foreground font-medium">Configure a Luma agora.</span>
        </p>

        {/* Social Proof Mini */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 glass rounded-full px-4 py-2 border border-luma-glass-border">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">127 fotógrafos</span> assinaram esta semana
            </span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
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

        {/* Trust Points */}
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
