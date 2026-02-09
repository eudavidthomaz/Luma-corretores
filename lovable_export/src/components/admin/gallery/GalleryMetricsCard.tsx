import { motion } from "framer-motion";
import { Eye, Download, Image as ImageIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryMetrics } from "@/hooks/useGalleryMetrics";

interface MetricItemProps {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color?: string;
  delay?: number;
}

function MetricItem({ icon: Icon, value, label, color, delay = 0 }: MetricItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card/30 border border-white/5 hover:bg-card/50 transition-colors"
    >
      <Icon className={cn("h-5 w-5", color || "text-muted-foreground")} />
      <span className="text-xl sm:text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </motion.div>
  );
}

interface GalleryMetricsCardProps extends GalleryMetrics {}

export function GalleryMetricsCard({
  totalViews,
  totalDownloads,
  totalPhotos,
  engagementRate,
}: GalleryMetricsCardProps) {
  const hasData = totalViews > 0 || totalDownloads > 0 || totalPhotos > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass rounded-2xl p-5 border border-luma-glass-border h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Métricas Totais
        </span>
        {hasData && engagementRate > 0 && (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {engagementRate}% engajamento
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricItem
          icon={Eye}
          value={totalViews.toLocaleString("pt-BR")}
          label="Visualizações"
          color="text-blue-400"
          delay={0.1}
        />
        <MetricItem
          icon={Download}
          value={totalDownloads.toLocaleString("pt-BR")}
          label="Downloads"
          color="text-emerald-400"
          delay={0.15}
        />
        <MetricItem
          icon={ImageIcon}
          value={totalPhotos.toLocaleString("pt-BR")}
          label="Fotos"
          color="text-purple-400"
          delay={0.2}
        />
        <MetricItem
          icon={TrendingUp}
          value={`${engagementRate}%`}
          label="Engajamento"
          color="text-amber-400"
          delay={0.25}
        />
      </div>

      {!hasData && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          As métricas aparecerão quando você tiver galerias com visualizações
        </p>
      )}

      {hasData && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          Taxa de download indica o interesse dos seus clientes nas fotos
        </p>
      )}
    </motion.div>
  );
}
