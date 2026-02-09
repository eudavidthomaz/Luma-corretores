import { Shield, Zap, Crown } from "lucide-react";
import type { PricingPlan } from "../LandingPricingCard";

export const pricingPlans: PricingPlan[] = [
  {
    key: "lite",
    name: "Lite",
    persona: "O Porteiro",
    personaDescription: "Para quem quer parar de perder leads por demora no atendimento",
    price: 47,
    icon: Shield,
    gradient: "from-slate-500 to-slate-700",
    borderColor: "border-luma-glass-border hover:border-slate-500/50",
    tagline: "Nunca mais perca um lead",
    mainBenefits: [
      "IA Luma atendendo 24h",
      "CRM completo com funil visual",
      "Até 50 leads/mês",
      "10 propostas inteligentes",
      "3 templates de contrato",
      "Assinatura digital",
    ],
    idealFor: "Fotógrafos iniciando profissionalização",
  },
  {
    key: "pro",
    name: "Pro",
    persona: "O Vendedor",
    personaDescription: "Para quem quer vender mais, não só atender orçamentos",
    price: 97,
    icon: Zap,
    gradient: "from-primary to-violet-600",
    borderColor: "border-primary/50",
    popular: true,
    tagline: "Transforme portfólio em vendas",
    mainBenefits: [
      "Tudo do Lite +",
      "10 Histórias Narradas",
      "5 Galerias Luma (2GB, 15 dias)",
      "Até 200 leads/mês",
      "50 propostas/mês",
      "10 templates personalizados",
    ],
    highlightBenefits: [
      "10 Histórias Narradas",
      "5 Galerias Luma (2GB, 15 dias)",
    ],
    idealFor: "Fotógrafos em crescimento",
  },
  {
    key: "ultra",
    name: "Ultra",
    persona: "A Escala",
    personaDescription: "Para quem quer ser referência e escalar sem limites",
    price: 187,
    icon: Crown,
    gradient: "from-violet-500 to-purple-600",
    borderColor: "border-violet-500/30 hover:border-violet-500/50",
    tagline: "Presença premium completa",
    mainBenefits: [
      "Tudo do Pro +",
      "30 Histórias + Suporte a Vídeo 🎥",
      "Galerias Ilimitadas (5GB, 30 dias)",
      "Mini-Site Público 🌐",
      "Até 1.000 leads/mês",
      "White-label (sem marca Luma)",
    ],
    highlightBenefits: [
      "30 Histórias + Suporte a Vídeo 🎥",
      "Galerias Ilimitadas (5GB, 30 dias)",
      "Mini-Site Público 🌐",
    ],
    idealFor: "Estúdios e fotógrafos premium",
  },
];

export const comparisonWithoutLuma = [
  { label: "Tempo respondendo DMs", without: "20h/mês", with: "0h" },
  { label: "Taxa de resposta", without: "< 50%", with: "100% em segundos" },
  { label: "Leads que somem", without: "80%", with: "Qualificados no painel" },
  { label: "Portfólio", without: "Estático", with: "Histórias que vendem" },
];
