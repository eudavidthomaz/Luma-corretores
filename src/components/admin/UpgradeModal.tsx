import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Zap,
  X,
  Check,
  Images,
  FolderOpen,
  Globe,
  Film,
  Users,
  Sparkles,
  ArrowRight,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export type UpgradeFeature =
  | "stories"
  | "gallery"
  | "minisite"
  | "video"
  | "chapters"
  | "storage"
  | "leads"
  | "portfolio"
  | "luma"
  | "proposals"
  | "general";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: UpgradeFeature;
  currentPlan?: string;
  requiredPlan?: "pro" | "ultra";
  customTitle?: string;
  customDescription?: string;
}

const featureConfig: Record<UpgradeFeature, {
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string[];
  recommendedPlan: "pro" | "ultra";
}> = {
  stories: {
    icon: Images,
    title: "Apresentações de Imóveis",
    description: "Crie apresentações visuais impactantes para seus imóveis",
    benefits: [
      "Até 10 imóveis (Pro) ou 30 imóveis (Ultra)",
      "Até 20 ambientes por imóvel (Pro) ou 30 (Ultra)",
      "Apresentação automatizada pela Luma",
      "Analytics de visualização"
    ],
    recommendedPlan: "pro",
  },
  gallery: {
    icon: FolderOpen,
    title: "Luma Showcase",
    description: "Apresente imóveis com elegância",
    benefits: [
      "5 vitrines simultâneas (Pro) ou ilimitadas (Ultra)",
      "2GB de armazenamento (Pro) ou 5GB (Ultra)",
      "Links seguros com senha opcional",
      "Download em alta resolução"
    ],
    recommendedPlan: "pro",
  },
  minisite: {
    icon: Globe,
    title: "Perfil Público",
    description: "Sua vitrine digital completa",
    benefits: [
      "Link personalizado para bio do Instagram",
      "Exibição de todos os seus imóveis",
      "Design premium responsivo",
      "White-label (sem marca Luma)"
    ],
    recommendedPlan: "ultra",
  },
  video: {
    icon: Film,
    title: "Suporte a Vídeo",
    description: "Adicione vídeos aos seus imóveis",
    benefits: [
      "Upload de vídeos em alta qualidade",
      "Reprodução otimizada para mobile",
      "Combine fotos e vídeos na mesma apresentação",
      "Experiência imersiva completa"
    ],
    recommendedPlan: "ultra",
  },
  chapters: {
    icon: Images,
    title: "Mais Ambientes",
    description: "Mostre todos os detalhes do imóvel",
    benefits: [
      "Até 30 ambientes por imóvel no Ultra",
      "Apresentações mais detalhadas",
      "Maior flexibilidade criativa",
      "Impressione com mais conteúdo"
    ],
    recommendedPlan: "ultra",
  },
  storage: {
    icon: FolderOpen,
    title: "Mais Armazenamento",
    description: "Espaço para crescer sua carteira",
    benefits: [
      "5GB de armazenamento no Ultra",
      "Vitrines válidas por 30 dias",
      "Vitrines ilimitadas simultâneas",
      "Sem preocupação com espaço"
    ],
    recommendedPlan: "ultra",
  },
  leads: {
    icon: Users,
    title: "Mais Leads",
    description: "Capture mais interessados",
    benefits: [
      "Até 200 leads/mês (Pro) ou 1.000 (Ultra)",
      "CRM completo com histórico",
      "Qualificação inteligente pela IA",
      "Notificações em tempo real"
    ],
    recommendedPlan: "pro",
  },
  general: {
    icon: Sparkles,
    title: "Desbloqueie Recursos Premium",
    description: "Eleve sua imobiliária ao próximo nível",
    benefits: [
      "Apresentações de Imóveis com IA",
      "Luma Showcase para apresentações",
      "Mais leads e armazenamento",
      "Suporte prioritário"
    ],
    recommendedPlan: "pro",
  },
  portfolio: {
    icon: Images,
    title: "Vitrine Digital",
    description: "Exiba seus imóveis no site",
    benefits: [
      "Até 10 imóveis (Pro) ou 30 (Ultra)",
      "Grid visual com categorias",
      "Viewer imersivo para clientes",
      "Analytics de visualização"
    ],
    recommendedPlan: "pro",
  },
  luma: {
    icon: Sparkles,
    title: "Assistente Luma",
    description: "IA que atende seus clientes 24/7",
    benefits: [
      "Atendimento automático inteligente",
      "Captura de leads qualificados",
      "Agendamento integrado",
      "Apresentação do seu portfólio"
    ],
    recommendedPlan: "pro",
  },
  proposals: {
    icon: FileText,
    title: "Propostas Inteligentes",
    description: "Crie propostas profissionais com contratos e assinatura digital",
    benefits: [
      "Itens personalizados e descontos",
      "Contratos com variáveis mágicas",
      "Assinatura digital integrada",
      "Upload de comprovantes de pagamento"
    ],
    recommendedPlan: "pro",
  },
};

const planHighlights = {
  pro: {
    name: "Pro",
    subtitle: "O Vendedor",
    price: 97,
    color: "from-primary to-primary/80",
    icon: Zap,
    topFeatures: [
      "10 Imóveis",
      "5 Vitrines • 2GB • 15 dias",
      "200 leads/mês",
      "IA Treinável"
    ],
  },
  ultra: {
    name: "Ultra",
    subtitle: "A Escala",
    price: 187,
    color: "from-violet-500 to-purple-600",
    icon: Crown,
    topFeatures: [
      "30 Imóveis + Vídeos",
      "Vitrines Ilimitadas • 5GB",
      "1.000 leads/mês",
      "Perfil Público (Mini-Site)"
    ],
  },
};

export function UpgradeModal({
  open,
  onOpenChange,
  feature = "general",
  currentPlan = "trial",
  requiredPlan,
  customTitle,
  customDescription,
}: UpgradeModalProps) {
  const navigate = useNavigate();
  const config = featureConfig[feature];
  const FeatureIcon = config.icon;

  // Determine which plan to recommend
  const targetPlan = requiredPlan || config.recommendedPlan;
  const planInfo = planHighlights[targetPlan];
  const PlanIcon = planInfo.icon;

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/admin/subscription");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-luma-glass-border sm:max-w-lg p-0 overflow-hidden">
        {/* Gradient Header */}
        <div className={cn(
          "relative p-6 pb-8 bg-gradient-to-br",
          planInfo.color
        )}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <FeatureIcon className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {targetPlan === "ultra" ? "Ultra" : "Pro"} Required
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold text-white">
                {customTitle || config.title}
              </DialogTitle>
              <p className="text-white/80 text-sm mt-1">
                {customDescription || config.description}
              </p>
            </DialogHeader>
          </div>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              O que você desbloqueia
            </p>
            <ul className="space-y-2.5">
              {config.benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={cn(
                    "p-1 rounded-full",
                    targetPlan === "ultra" ? "bg-violet-500/20" : "bg-primary/20"
                  )}>
                    <Check className={cn(
                      "h-3 w-3",
                      targetPlan === "ultra" ? "text-violet-400" : "text-primary"
                    )} />
                  </div>
                  <span className="text-sm text-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              "rounded-xl p-4 border",
              targetPlan === "ultra"
                ? "bg-violet-500/10 border-violet-500/30"
                : "bg-primary/10 border-primary/30"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br",
                  planInfo.color
                )}>
                  <PlanIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Plano {planInfo.name}</p>
                  <p className="text-xs text-muted-foreground">{planInfo.subtitle}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">R$ {planInfo.price}</p>
                <p className="text-xs text-muted-foreground">/mês</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
              {planInfo.topFeatures.map((feat, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className={cn(
                    "text-[10px] font-normal",
                    targetPlan === "ultra"
                      ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                      : "bg-primary/20 text-primary border-primary/30"
                  )}
                >
                  {feat}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* CTAs */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Agora não
            </Button>
            <Button
              variant={targetPlan === "ultra" ? "default" : "gradient"}
              className={cn(
                "flex-1 gap-2",
                targetPlan === "ultra" && "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              )}
              onClick={handleUpgrade}
            >
              Ver Planos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Current plan note */}
          {currentPlan && currentPlan !== "pro" && currentPlan !== "ultra" && (
            <p className="text-xs text-center text-muted-foreground">
              Você está no plano <span className="capitalize font-medium">{currentPlan}</span>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
