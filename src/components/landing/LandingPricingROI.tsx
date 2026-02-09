import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calculator, TrendingUp, ArrowRight } from "lucide-react";
import { PLAN_DETAILS } from "@/lib/planLimits";

export function LandingPricingROI() {
  const navigate = useNavigate();
  const [monthlyLeads, setMonthlyLeads] = useState([20]);
  const [averageTicket, setAverageTicket] = useState([3000]);

  // Calculations
  const withoutLumaConversion = 0.15; // 15%
  const withLumaConversion = 0.35; // 35%

  const leadsWithout = Math.floor(monthlyLeads[0] * withoutLumaConversion);
  const leadsWith = Math.floor(monthlyLeads[0] * withLumaConversion);

  const revenueWithout = leadsWithout * averageTicket[0];
  const revenueWith = leadsWith * averageTicket[0];

  const additionalRevenue = revenueWith - revenueWithout;
  const proPlanCost = PLAN_DETAILS.pro.price;
  const roi = Math.round((additionalRevenue / proPlanCost) * 100);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="glass" size="lg" className="gap-2">
          <Calculator className="h-4 w-4" />
          Calcular meu ROI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg glass border-luma-glass-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            Quanto você pode ganhar com a Luma?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Monthly Leads Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">
                Orçamentos que você recebe por mês
              </label>
              <span className="text-sm font-semibold text-foreground">
                {monthlyLeads[0]} pedidos
              </span>
            </div>
            <Slider
              value={monthlyLeads}
              onValueChange={setMonthlyLeads}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Average Ticket Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">
                Valor médio dos seus serviços
              </label>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(averageTicket[0])}
              </span>
            </div>
            <Slider
              value={averageTicket}
              onValueChange={setAverageTicket}
              min={500}
              max={20000}
              step={500}
              className="w-full"
            />
          </div>

          {/* Comparison Table */}
          <div className="glass rounded-xl p-4 border border-luma-glass-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div />
              <div>
                <p className="text-xs text-destructive font-medium mb-1">Sem Luma</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-medium mb-1">Com Luma</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-3 gap-4 text-center py-2 border-t border-luma-glass-border/50">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Taxa de conversão</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">15%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">35%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center py-2 border-t border-luma-glass-border/50">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Leads fechados/mês</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{leadsWithout}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">{leadsWith}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center py-2 border-t border-luma-glass-border/50">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Faturamento</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{formatCurrency(revenueWithout)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">{formatCurrency(revenueWith)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <motion.div
            className="glass rounded-xl p-4 border border-primary/30 bg-primary/5 text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            key={additionalRevenue}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <p className="text-xs text-muted-foreground mb-1">Ganho adicional por mês</p>
            <p className="text-3xl font-bold text-primary mb-2">
              {formatCurrency(additionalRevenue)}
            </p>
            <p className="text-sm text-muted-foreground">
              Com o plano Pro (R${PLAN_DETAILS.pro.price}/mês), seu ROI é de{" "}
              <span className="text-primary font-semibold">{roi.toLocaleString()}%</span>
            </p>
          </motion.div>

          {/* CTA */}
          <Button
            variant="gradient"
            size="lg"
            className="w-full gap-2"
            onClick={() => navigate("/auth")}
          >
            Começar Agora
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="text-[10px] text-center text-muted-foreground">
            * Estimativa baseada em dados médios do mercado. Resultados individuais podem variar.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
