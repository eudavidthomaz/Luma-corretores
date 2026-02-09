import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw, CreditCard } from "lucide-react";

export function LandingGuarantee() {
  return (
    <section className="relative z-10 px-4 sm:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="glass rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 border border-secondary/20 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="inline-flex p-4 rounded-full bg-secondary/10 mb-6">
            <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-secondary" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            Satisfação garantida. <span className="gradient-text">Cancele quando quiser.</span>
          </h2>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Você não está assinando um contrato eterno. A Luma vai transformar seu atendimento em 24h.
            Se não fizer sentido,{" "}
            <span className="text-foreground font-medium">cancela em 1 clique</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cancele quando quiser</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-luma-glass-border" />
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Suporte dedicado</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
