import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw, Clock, Headphones, CreditCard, Lock } from "lucide-react";

const guarantees = [
  {
    icon: RefreshCw,
    title: "Cancele quando quiser",
    description: "Sem fidelidade, sem multa, sem pegadinha. Cancela em 1 clique.",
  },
  {
    icon: Clock,
    title: "Setup em 15 minutos",
    description: "Configure tudo sozinho. Se precisar, a gente ajuda ao vivo.",
  },
  {
    icon: Headphones,
    title: "Suporte dedicado",
    description: "Atendimento via WhatsApp com fotógrafos de verdade.",
  },
];

export function LandingGuaranteeNew() {
  return (
    <section className="relative z-10 px-4 sm:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="glass rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 border border-secondary/20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full bg-secondary/10 mb-4">
              <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-secondary" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Satisfação garantida.{" "}
              <span className="gradient-text">Risco zero.</span>
            </h2>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Você não está assinando um contrato eterno. A Luma vai transformar seu atendimento em 24h.
              Se não fizer sentido,{" "}
              <span className="text-foreground font-medium">cancela em 1 clique</span>.
            </p>
          </div>

          {/* Guarantees Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {guarantees.map((guarantee, index) => (
              <motion.div
                key={guarantee.title}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex p-3 rounded-xl bg-muted/30 mb-3">
                  <guarantee.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {guarantee.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {guarantee.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 pt-6 border-t border-luma-glass-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>SSL 256-bit</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>Pagamento via Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span>Dados protegidos</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
