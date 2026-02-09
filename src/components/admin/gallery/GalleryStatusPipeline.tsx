import { motion } from "framer-motion";
import { Pencil, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GalleryStatusBreakdown } from "@/hooks/useGalleryStatusBreakdown";
import { GalleryFilters } from "@/hooks/useFilteredGalleries";

interface PipelineNodeProps {
  icon: React.ElementType;
  count: number;
  label: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  isPulsing?: boolean;
  onClick: () => void;
  delay?: number;
}

function PipelineNode({
  icon: Icon,
  count,
  label,
  color,
  bgColor,
  isActive,
  isPulsing,
  onClick,
  delay = 0,
}: PipelineNodeProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl cursor-pointer transition-all flex-1 min-w-0",
        "bg-card/30 border hover:bg-card/50",
        isActive
          ? "border-primary/50 bg-primary/10 ring-2 ring-primary/20"
          : "border-white/5"
      )}
    >
      <div
        className={cn(
          "p-2 rounded-lg transition-colors",
          isActive ? bgColor : "bg-muted/30"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
            isActive ? color : "text-muted-foreground",
            isPulsing && count > 0 && "animate-pulse"
          )}
        />
      </div>
      <span className="text-lg sm:text-xl font-bold text-foreground">{count}</span>
      <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-full">
        {label}
      </span>
    </motion.button>
  );
}

function Connector({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="hidden sm:block h-0.5 w-4 sm:w-6 bg-gradient-to-r from-white/10 via-white/20 to-white/10 self-center"
    />
  );
}

interface GalleryStatusPipelineProps extends GalleryStatusBreakdown {
  activeFilter: GalleryFilters["status"];
  onStatusClick: (status: GalleryFilters["status"]) => void;
}

export function GalleryStatusPipeline({
  draft,
  active,
  expiringSoon,
  expired,
  activeFilter,
  onStatusClick,
}: GalleryStatusPipelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-4 border border-luma-glass-border"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <PipelineNode
          icon={Pencil}
          count={draft}
          label="Rascunho"
          color="text-slate-400"
          bgColor="bg-slate-500/20"
          isActive={activeFilter === "draft"}
          onClick={() => onStatusClick(activeFilter === "draft" ? "all" : "draft")}
          delay={0.1}
        />

        <Connector delay={0.15} />

        <PipelineNode
          icon={CheckCircle2}
          count={active}
          label="Ativas"
          color="text-emerald-400"
          bgColor="bg-emerald-500/20"
          isActive={activeFilter === "active"}
          onClick={() => onStatusClick(activeFilter === "active" ? "all" : "active")}
          delay={0.2}
        />

        <Connector delay={0.25} />

        <PipelineNode
          icon={AlertTriangle}
          count={expiringSoon}
          label="Expirando"
          color="text-amber-400"
          bgColor="bg-amber-500/20"
          isActive={activeFilter === "expiring"}
          isPulsing={expiringSoon > 0}
          onClick={() => onStatusClick(activeFilter === "expiring" ? "all" : "expiring")}
          delay={0.3}
        />

        <Connector delay={0.35} />

        <PipelineNode
          icon={XCircle}
          count={expired}
          label="Expiradas"
          color="text-red-400"
          bgColor="bg-red-500/20"
          isActive={activeFilter === "expired"}
          onClick={() => onStatusClick(activeFilter === "expired" ? "all" : "expired")}
          delay={0.4}
        />
      </div>
    </motion.div>
  );
}
