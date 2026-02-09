import { motion } from "framer-motion";
import { Users, TrendingUp, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLeadStats } from "@/hooks/useLeads";
import { useProposals } from "@/hooks/useProposals";

export function CompactMetricsCard() {
  const { user } = useAuth();
  const { data: leadStats, isLoading: leadsLoading } = useLeadStats(user?.id);
  const { data: proposals, isLoading: proposalsLoading } = useProposals(user?.id);

  const activeProposals = proposals?.filter(
    (p) => !["draft", "cancelled", "paid"].includes(p.status || "")
  ).length || 0;

  const isLoading = leadsLoading || proposalsLoading;

  const metrics = [
    {
      label: "Total de Leads",
      value: leadStats?.total || 0,
      icon: Users,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "Taxa de Conversão",
      value: `${leadStats?.conversionRate || 0}%`,
      icon: TrendingUp,
      color: Number(leadStats?.conversionRate) > 10 ? "text-emerald-500" : "text-muted-foreground",
      bgColor: Number(leadStats?.conversionRate) > 10 ? "bg-emerald-500/10" : "bg-white/5",
    },
    {
      label: "Propostas Ativas",
      value: activeProposals,
      icon: FileText,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bento-card"
    >
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        Métricas
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="text-center p-3 rounded-xl bg-white/5 border border-white/5"
            >
              <div className={`inline-flex p-2 rounded-lg ${metric.bgColor} mb-2`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
