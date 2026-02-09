import { motion } from "framer-motion";
import { Eye, CheckCircle2, Pencil, MessageSquare } from "lucide-react";

interface StoriesMetricsCardProps {
  totalViews: number;
  publishedCount: number;
  draftCount: number;
  inCarouselCount: number;
}

export function StoriesMetricsCard({
  totalViews,
  publishedCount,
  draftCount,
  inCarouselCount,
}: StoriesMetricsCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const metrics = [
    {
      icon: Eye,
      value: formatNumber(totalViews),
      label: "Views",
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: CheckCircle2,
      value: publishedCount.toString(),
      label: "Publicadas",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Pencil,
      value: draftCount.toString(),
      label: "Rascunhos",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: MessageSquare,
      value: inCarouselCount.toString(),
      label: "No Chat",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass rounded-2xl p-5 border border-luma-glass-border h-full"
    >
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
        Métricas do Portfólio
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="metric-compact"
          >
            <div className={`p-2 rounded-lg ${metric.bgColor} w-fit mx-auto mb-2`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
            <div className="text-xl font-bold text-foreground">{metric.value}</div>
            <div className="text-xs text-muted-foreground">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Insight text */}
      {totalViews > 0 && (
        <div className="mt-4 pt-4 border-t border-luma-glass-border/50">
          <p className="text-sm text-muted-foreground text-center">
            {totalViews >= 100 
              ? `Suas histórias alcançaram ${formatNumber(totalViews)} visualizações! 🎉`
              : "Continue criando histórias para engajar mais clientes"
            }
          </p>
        </div>
      )}
    </motion.div>
  );
}
