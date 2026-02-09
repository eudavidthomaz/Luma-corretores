import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LandingPricingCard } from "./LandingPricingCard";
import { LandingPricingCompare } from "./LandingPricingCompare";
import { pricingPlans, comparisonWithoutLuma } from "./pricing/PricingPlansData";
import { cn } from "@/lib/utils";

export function LandingPricingNew() {
  const [activeTab, setActiveTab] = useState("pro");

  return (
    <section 
      id="pricing"
      className="snap-section relative z-10 px-4 sm:px-6 py-16 md:py-32 min-h-fit flex items-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
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
            Para onde você quer ir?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano que combina com o seu momento.{" "}
            <span className="text-foreground font-medium">
              Menos do que um jantar para escalar seu negócio.
            </span>
          </p>
        </motion.div>

        {/* Comparison Bar - Desktop */}
        <motion.div
          className="hidden md:block glass rounded-xl p-4 sm:p-6 mb-8 md:mb-12 border border-luma-glass-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="text-left">
              <p className="text-xs text-muted-foreground mb-2">Comparativo</p>
            </div>
            <div>
              <p className="text-xs text-destructive font-medium">Sem Luma</p>
            </div>
            <div>
              <p className="text-xs text-secondary font-medium">Com Luma</p>
            </div>
            <div />
            <div />
          </div>
          {comparisonWithoutLuma.map((item, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 text-center py-2 border-t border-luma-glass-border">
              <div className="text-left">
                <p className="text-xs sm:text-sm text-foreground">{item.label}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{item.without}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-secondary font-medium">{item.with}</p>
              </div>
              <div />
              <div />
            </div>
          ))}
        </motion.div>

        {/* Desktop: Grid of Cards */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
          {pricingPlans.map((plan, index) => (
            <LandingPricingCard key={plan.key} plan={plan} index={index} />
          ))}
        </div>

        {/* Mobile: Tabs */}
        <div className="md:hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6 bg-muted/30">
              {pricingPlans.map((plan) => (
                <TabsTrigger
                  key={plan.key}
                  value={plan.key}
                  className={cn(
                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                    plan.popular && "data-[state=active]:text-primary"
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium">{plan.name}</span>
                    <span className="text-[10px] text-muted-foreground">R${plan.price}/mês</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {pricingPlans.map((plan) => (
              <TabsContent key={plan.key} value={plan.key} className="mt-0">
                <LandingPricingCard plan={plan} index={0} />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Comparison Table */}
        <LandingPricingCompare />

        {/* Bottom Trust Badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <span>✓ Setup em 15 minutos</span>
          <span>✓ Cancele quando quiser</span>
          <span>✓ Suporte dedicado</span>
          <span>✓ Pagamento seguro via Stripe</span>
        </motion.div>
      </div>
    </section>
  );
}
