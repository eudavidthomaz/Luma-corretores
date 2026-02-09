import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X, Crown, Zap, Shield, Globe, Sparkles, Clock, Loader2, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { PLAN_DETAILS, getTrialDaysRemaining } from "@/lib/planLimits";
import { STRIPE_PLANS, StripePlanKey } from "@/lib/stripe";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PlanCardProps {
  name: string;
  subtitle: string;
  price: number;
  period: string;
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
  color: string;
  loading?: boolean;
  onSelect: () => void;
}

function PlanCard({ name, subtitle, price, period, features, popular, current, color, loading, onSelect }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative glass rounded-2xl border p-6 flex flex-col",
        popular ? "border-primary/50 shadow-lg shadow-primary/10" : "border-luma-glass-border",
        current && "ring-2 ring-primary"
      )}
    >
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground">
          <Sparkles className="h-3 w-3 mr-1" />
          Mais Popular
        </Badge>
      )}
      
      {current && (
        <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
          Plano Atual
        </Badge>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className={cn("inline-flex p-3 rounded-xl bg-gradient-to-br mb-3", color)}>
          {name === "Lite" && <Shield className="h-6 w-6 text-white" />}
          {name === "Pro" && <Zap className="h-6 w-6 text-white" />}
          {name === "Ultra" && <Crown className="h-6 w-6 text-white" />}
        </div>
        <h3 className="text-xl font-bold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <span className="text-4xl font-bold text-foreground">R$ {price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            {feature.included ? (
              <Check className={cn("h-5 w-5 mt-0.5 shrink-0", feature.highlight ? "text-primary" : "text-green-500")} />
            ) : (
              <X className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground/50" />
            )}
            <span className={cn(
              "text-sm",
              feature.included ? "text-foreground" : "text-muted-foreground/50 line-through",
              feature.highlight && "font-medium text-primary"
            )}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        onClick={onSelect}
        variant={current ? "outline" : popular ? "default" : "secondary"}
        className={cn(
          "w-full",
          popular && !current && "bg-gradient-primary hover:opacity-90"
        )}
        disabled={current || loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processando...
          </>
        ) : current ? (
          "Plano Atual"
        ) : (
          "Selecionar Plano"
        )}
      </Button>
    </motion.div>
  );
}

export default function AdminSubscription() {
  const { profile, subscription, checkSubscription, refreshProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const currentPlan = (profile?.plan || 'trial') as keyof typeof PLAN_DETAILS;
  const trialDays = getTrialDaysRemaining(profile?.trial_ends_at);

  // Handle success/cancel from Stripe redirect
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast({
        title: "Pagamento confirmado!",
        description: "Sua assinatura foi ativada com sucesso. Aguarde enquanto atualizamos seu plano.",
      });
      // Refresh subscription status
      setTimeout(() => {
        checkSubscription();
        refreshProfile();
      }, 2000);
    } else if (canceled === "true") {
      toast({
        title: "Pagamento cancelado",
        description: "Você pode tentar novamente quando quiser.",
        variant: "destructive",
      });
    }
  }, [searchParams, checkSubscription, refreshProfile]);

  const handleSelectPlan = async (planKey: string) => {
    if (planKey === currentPlan) return;

    // Verificar se há sessão ativa antes de prosseguir
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Sessão expirada",
        description: "Por favor, faça login novamente para continuar.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const stripePlan = STRIPE_PLANS[planKey as StripePlanKey];
    if (!stripePlan) {
      toast({
        title: "Erro",
        description: "Plano não encontrado",
        variant: "destructive",
      });
      return;
    }

    setLoadingPlan(planKey);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: stripePlan.priceId },
      });

      if (error) throw error;

      // Verificar se houve erro de autenticação na resposta
      if (data?.error) {
        if (data.error.includes("logado") || data.error.includes("login")) {
          toast({
            title: "Sessão expirada",
            description: "Por favor, faça login novamente para continuar.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }
        throw new Error(data.error);
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Erro ao processar",
        description: error?.message || "Não foi possível iniciar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setIsRefreshing(true);

    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de gerenciamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    await checkSubscription();
    await refreshProfile();
    setIsRefreshing(false);
    toast({
      title: "Status atualizado",
      description: "Seu status de assinatura foi verificado.",
    });
  };

  const plans: Array<{
    key: string;
    name: string;
    subtitle: string;
    price: number;
    period: string;
    color: string;
    popular?: boolean;
    features: PlanFeature[];
  }> = [
    {
      key: "lite",
      ...PLAN_DETAILS.lite,
      features: [
        { text: "Atendimento Inteligente 24h", included: true },
        { text: "CRM de Leads Completo", included: true },
        { text: "Triagem Qualificada de Clientes", included: true },
        { text: "Até 50 leads/mês", included: true },
        { text: "Histórias Narradas", included: false },
        { text: "Luma Gallery", included: false },
        { text: "Perfil Público (Mini-Site)", included: false },
      ],
    },
    {
      key: "pro",
      ...PLAN_DETAILS.pro,
      features: [
        { text: "Tudo do Lite", included: true },
        { text: "10 Histórias Narradas", included: true, highlight: true },
        { text: "Até 20 fotos por história", included: true },
        { text: "5 Galerias • 2GB • 15 dias", included: true, highlight: true },
        { text: "Personalidade da IA Treinável", included: true },
        { text: "Até 200 leads/mês", included: true },
        { text: "Suporte a Vídeo", included: false },
        { text: "Perfil Público (Mini-Site)", included: false },
      ],
    },
    {
      key: "ultra",
      ...PLAN_DETAILS.ultra,
      features: [
        { text: "Tudo do Pro", included: true },
        { text: "30 Histórias + Vídeos 🎥", included: true, highlight: true },
        { text: "Galerias Ilimitadas • 5GB • 30 dias", included: true, highlight: true },
        { text: "Perfil Público (Mini-Site) 🌐", included: true, highlight: true },
        { text: "Até 1.000 leads/mês", included: true },
        { text: "White-label (Sem marca Luma)", included: true },
        { text: "Suporte Prioritário", included: true },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Escolha seu Plano</h1>
        <p className="text-muted-foreground">
          Desbloqueie todo o potencial da Luma para seu negócio
        </p>

        {/* Trial Banner */}
        {currentPlan === 'trial' && trialDays !== null && trialDays > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500"
          >
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              {trialDays} {trialDays === 1 ? 'dia' : 'dias'} restantes no seu teste grátis
            </span>
          </motion.div>
        )}

        {/* Subscription Status */}
        {subscription.subscribed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 inline-flex items-center gap-4"
          >
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
              <Check className="h-3 w-3 mr-1" />
              Assinatura Ativa
            </Badge>
            {subscription.subscriptionEnd && (
              <span className="text-sm text-muted-foreground">
                Renova em: {new Date(subscription.subscriptionEnd).toLocaleDateString("pt-BR")}
              </span>
            )}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Atualizar Status
          </Button>
          {subscription.subscribed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageSubscription}
              disabled={isRefreshing}
            >
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Assinatura
            </Button>
          )}
        </div>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PlanCard
              name={plan.name}
              subtitle={plan.subtitle}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              popular={plan.popular}
              current={currentPlan === plan.key}
              color={plan.color}
              loading={loadingPlan === plan.key}
              onSelect={() => handleSelectPlan(plan.key)}
            />
          </motion.div>
        ))}
      </div>

      {/* Features Comparison Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-muted-foreground max-w-2xl mx-auto"
      >
        <p>
          Todos os planos incluem suporte por email e atualizações automáticas.
          <br />
          Cancele a qualquer momento, sem multas.
        </p>
      </motion.div>

      {/* Ultra Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-2xl mx-auto glass rounded-2xl border border-violet-500/30 p-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              Perfil Público
              <Badge variant="secondary" className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                Ultra
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Seu mini-site profissional. Substitua seu link na bio do Instagram por uma página elegante com todas as suas histórias.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
