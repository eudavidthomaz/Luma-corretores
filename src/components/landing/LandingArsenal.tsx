import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  FileText,
  FolderOpen,
  Globe,
  Check,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ArsenalModule {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  gradient: string;
  availability: "all" | "pro" | "ultra";
  preview?: React.ReactNode;
}

const modules: ArsenalModule[] = [
  {
    id: "chat",
    icon: MessageSquare,
    title: "Luma Chat IA",
    subtitle: "Atendimento Imobiliário 24h",
    description: "Sua secretária que nunca dorme. Responde leads de portais, tira dúvidas do imóvel e agenda visitas.",
    features: [
      "Responde leads do VivaReal/Zap",
      "Qualifica renda e financiamento",
      "Envia vídeos e tours virtuais",
      "Agenda visitas no Google Calendar",
    ],
    gradient: "from-primary to-violet-600",
    availability: "all",
  },
  {
    id: "proposals",
    icon: FileText,
    title: "Smart Proposals",
    subtitle: "Propostas de Compra/Locação",
    description: "Formalize propostas em minutos. O cliente assina no celular e você fecha negócio mais rápido.",
    features: [
      "Propostas digitais elegantes",
      "Assinatura eletrônica válida",
      "Histórico de negociação",
      "Notificação de visualização",
    ],
    gradient: "from-secondary to-cyan-600",
    availability: "all",
  },
  {
    id: "gallery",
    icon: FolderOpen,
    title: "Luma Showcase",
    subtitle: "Apresentação de Imóveis",
    description: "Esqueça o WeTransfer. Entregue fotos e vídeos de imóveis em uma experiência premium que encanta proprietários.",
    features: [
      "Galerias de alta resolução",
      "Separação por ambientes",
      "Download fácil para portais",
      "Proteção por senha para exclusivos",
    ],
    gradient: "from-amber-500 to-orange-600",
    availability: "pro",
  },
  {
    id: "minisite",
    icon: Globe,
    title: "Mini-Site",
    subtitle: "Site do Corretor",
    description: "Seu portfólio profissional com seus melhores imóveis e chat integrado. Sua imobiliária digital.",
    features: [
      "URL personalizada (seu nome)",
      "Busca de imóveis integrada",
      "Captura de leads via Luma",
      "Integração com Instagram",
    ],
    gradient: "from-emerald-500 to-green-600",
    availability: "ultra",
  },
];

const availabilityBadges = {
  all: { label: "Todos os planos", variant: "secondary" as const },
  pro: { label: "A partir do Pro", variant: "default" as const },
  ultra: { label: "Exclusivo Ultra", variant: "default" as const },
};

export function LandingArsenal() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  return (
    <section className="snap-section relative z-10 px-4 sm:px-6 py-16 md:py-32 min-h-[85vh] md:min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary font-medium">
            Arsenal Completo
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 md:mt-4 mb-4">
            4 ferramentas para vender mais imóveis
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Não é só um chatbot. É um ecossistema completo para corretores,
            desenvolvido para automatizar o atendimento e fechar mais negócios.
          </p>
        </motion.div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {modules.map((module, index) => {
            const isActive = activeModule === module.id;
            const badgeInfo = availabilityBadges[module.availability];

            return (
              <motion.div
                key={module.id}
                className={cn(
                  "glass rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer group",
                  isActive
                    ? "border-primary/50 bg-primary/5"
                    : "border-luma-glass-border hover:border-primary/30"
                )}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                viewport={{ once: true }}
                onClick={() => setActiveModule(isActive ? null : module.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br shadow-lg transition-transform duration-300",
                      module.gradient,
                      isActive && "scale-110"
                    )}>
                      <module.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold text-foreground">
                        {module.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{module.subtitle}</p>
                    </div>
                  </div>
                  <Badge
                    variant={badgeInfo.variant}
                    className={cn(
                      "text-[10px] shrink-0",
                      module.availability === "pro" && "bg-primary/20 text-primary border-primary/30",
                      module.availability === "ultra" && "bg-violet-500/20 text-violet-400 border-violet-500/30"
                    )}
                  >
                    {badgeInfo.label}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {module.description}
                </p>

                {/* Expandable Features */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-luma-glass-border">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          Recursos incluídos:
                        </p>
                        <ul className="space-y-2">
                          {module.features.map((feature, i) => (
                            <motion.li
                              key={i}
                              className="flex items-center gap-2"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <Check className="h-4 w-4 text-green-500 shrink-0" />
                              <span className="text-sm text-foreground">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expand Indicator */}
                <div className="flex items-center justify-center mt-4">
                  <motion.div
                    className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors"
                    animate={{ rotate: isActive ? 90 : 0 }}
                  >
                    <span>{isActive ? "Ver menos" : "Ver recursos"}</span>
                    <ChevronRight className="h-3 w-3" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-8 md:mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Todos os módulos incluem <span className="text-foreground font-medium">suporte dedicado</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
