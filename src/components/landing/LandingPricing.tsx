import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, Zap, Crown, Sparkles, Clock, MessageSquare, Images, Users } from "lucide-react";

const plans = [
  {
    name: "Lite",
    subtitle: "Corretor Autônomo",
    price: 47,
    description: "Para quem quer parar de perder leads por demora",
    icon: Shield,
    gradient: "from-slate-400 to-slate-600",
    borderColor: "border-luma-glass-border hover:border-slate-500/30",
    features: [
      { text: "IA 24h respondendo e triando", included: true, highlight: false },
      { text: "CRM completo com funil visual", included: true, highlight: false },
      { text: "Até 50 atendimentos/mês", included: true, highlight: false },
      { text: "Triagem de renda/financiamento", included: true, highlight: false },
      { text: "Luma Showcase", included: false, highlight: false },
      { text: "Site do Corretor", included: false, highlight: false }
    ],
    cta: "Começar",
    ctaVariant: "secondary" as const,
    ideal: "Corretores independentes"
  },
  {
    name: "Pro",
    subtitle: "Imobiliária / Escritório",
    price: 97,
    description: "Para quem quer vender mais, não só atender",
    icon: Zap,
    gradient: "from-primary to-purple-600",
    borderColor: "border-primary/50",
    popular: true,
    features: [
      { text: "Tudo do Lite +", included: true, highlight: false },
      { text: "5 Showcases (2GB, 30 dias)", included: true, highlight: true },
      { text: "Até 200 atendimentos/mês", included: true, highlight: false },
      { text: "Envio de tours virtuais", included: true, highlight: false },
      { text: "Acesso imediato a todos os recursos", included: true, highlight: true }
    ],
    cta: "Começar Agora",
    ctaVariant: "gradient" as const,
    ideal: "Equipes pequenas e tops producers"
  },
  {
    name: "Ultra",
    subtitle: "Incorporadora / Volume",
    price: 187,
    description: "Para quem quer virar referência",
    icon: Crown,
    gradient: "from-violet-500 to-purple-600",
    borderColor: "border-violet-500/30 hover:border-violet-500/50",
    features: [
      { text: "Tudo do Pro +", included: true, highlight: false },
      { text: "Showcases Ilimitados", included: true, highlight: true },
      { text: "Site do Corretor (Minisite) 🌐", included: true, highlight: true },
      { text: "Até 1.000 atendimentos/mês", included: true, highlight: false },
      { text: "API para integração com CRM", included: true, highlight: false },
      { text: "White-label (sem marca Luma)", included: true, highlight: false }
    ],
    cta: "Começar",
    ctaVariant: "secondary" as const,
    ideal: "Imobiliárias e lançamentos"
  }
];

const comparison = [
  { label: "Tempo respondendo leads", without: "20h/mês", with: "0h" },
  { label: "Tempo de resposta", without: "< 1 hora", with: "Imediato (segundos)" },
  { label: "Leads desqualificados", without: "80% (visitantes curiosos)", with: "Filtrados pela IA" },
  { label: "Apresentação", without: "Link do portal/PDF", with: "Showcase Imersivo" }
];

export function LandingPricing() {
  const navigate = useNavigate();

  return (
    <section className="snap-section relative z-10 px-4 sm:px-6 py-16 md:py-32 min-h-fit flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-medium">
            Investimento
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 md:mt-4 mb-4">
            Quanto custa perder uma venda de R$ 500mil?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Menos do que um cafezinho por dia para ter uma assistente que garante que nenhum lead fique sem resposta.
          </p>
        </motion.div>

        {/* Comparison Table - Mobile Friendly */}
        <motion.div
          className="glass rounded-xl p-4 sm:p-6 mb-8 md:mb-12 border border-luma-glass-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="text-left">
              <p className="text-xs text-muted-foreground mb-2">Comparativo</p>
            </div>
            <div>
              <p className="text-xs text-destructive font-medium">Sem Luma</p>
            </div>
            <div>
              <p className="text-xs text-secondary font-medium">Com Luma</p>
            </div>
          </div>
          {comparison.map((item, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-center py-2 border-t border-luma-glass-border">
              <div className="text-left">
                <p className="text-xs sm:text-sm text-foreground">{item.label}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.without}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-secondary font-medium">{item.with}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`glass rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border-2 ${plan.borderColor} transition-all duration-300 relative ${plan.popular ? "shadow-lg shadow-primary/10" : ""
                }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.gradient} mb-3`}>
                  <plan.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
              </div>

              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-foreground">R$ {plan.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>

              <p className="text-xs text-center text-muted-foreground mb-6">
                {plan.description}
              </p>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className={`h-5 w-5 mt-0.5 shrink-0 ${feature.highlight ? "text-primary" : "text-green-500"}`} />
                    ) : (
                      <X className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className={`text-sm ${feature.included
                      ? feature.highlight
                        ? "text-foreground font-medium"
                        : "text-foreground"
                      : "text-muted-foreground/50 line-through"
                      }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.ctaVariant}
                className={`w-full ${plan.name === "Ultra" ? "border-violet-500/30 hover:bg-violet-500/10" : ""}`}
                onClick={() => navigate("/auth")}
              >
                {plan.cta}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Ideal para: {plan.ideal}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
