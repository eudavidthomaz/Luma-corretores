import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  key: "lite" | "pro" | "ultra";
  name: string;
  persona: string;
  personaDescription: string;
  price: number;
  icon: LucideIcon;
  gradient: string;
  borderColor: string;
  popular?: boolean;
  tagline: string;
  mainBenefits: string[];
  highlightBenefits?: string[];
  idealFor: string;
}

interface LandingPricingCardProps {
  plan: PricingPlan;
  index: number;
}

export function LandingPricingCard({ plan, index }: LandingPricingCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      className={cn(
        "relative glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300",
        plan.borderColor,
        plan.popular && "shadow-xl shadow-primary/20 scale-[1.02] lg:scale-105"
      )}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      viewport={{ once: true }}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-violet-600 text-primary-foreground px-4 py-1 shadow-lg">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Mais Popular
        </Badge>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className={cn(
          "inline-flex p-4 rounded-2xl bg-gradient-to-br mb-4 shadow-lg",
          plan.gradient
        )}>
          <plan.icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
        <p className="text-sm font-medium text-primary mt-1">"{plan.persona}"</p>
      </div>

      {/* Price */}
      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-sm text-muted-foreground">R$</span>
          <span className="text-5xl font-bold text-foreground">{plan.price}</span>
          <span className="text-muted-foreground">/mês</span>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-sm text-center text-muted-foreground mb-6 min-h-[40px]">
        {plan.personaDescription}
      </p>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-luma-glass-border to-transparent mb-6" />

      {/* Benefits */}
      <ul className="space-y-3 mb-6">
        {plan.mainBenefits.map((benefit, i) => {
          const isHighlight = plan.highlightBenefits?.includes(benefit);
          return (
            <li key={i} className="flex items-start gap-3">
              <Check className={cn(
                "h-5 w-5 mt-0.5 shrink-0",
                isHighlight ? "text-primary" : "text-green-500"
              )} />
              <span className={cn(
                "text-sm",
                isHighlight ? "text-foreground font-medium" : "text-foreground"
              )}>
                {benefit}
              </span>
            </li>
          );
        })}
      </ul>

      {/* CTA Button */}
      <Button
        variant={plan.popular ? "gradient" : "outline"}
        size="lg"
        className={cn(
          "w-full gap-2 font-semibold",
          plan.popular && "shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)]",
          plan.key === "ultra" && !plan.popular && "border-violet-500/30 hover:bg-violet-500/10"
        )}
        onClick={() => navigate("/auth")}
      >
        {plan.popular ? (
          <>
            <Sparkles className="h-4 w-4" />
            Começar Agora
          </>
        ) : (
          "Assinar"
        )}
      </Button>

      {/* Ideal For */}
      <p className="text-xs text-center text-muted-foreground mt-4">
        Ideal para: <span className="text-foreground">{plan.idealFor}</span>
      </p>
    </motion.div>
  );
}
