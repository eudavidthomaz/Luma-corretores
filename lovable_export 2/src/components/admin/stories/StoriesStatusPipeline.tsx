import { motion } from "framer-motion";
import { Pencil, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type StoryStatusFilter = "all" | "draft" | "published" | "carousel";

interface StoriesStatusPipelineProps {
  draft: number;
  published: number;
  inCarousel: number;
  activeFilter: StoryStatusFilter;
  onStatusClick: (status: StoryStatusFilter) => void;
}

export function StoriesStatusPipeline({
  draft,
  published,
  inCarousel,
  activeFilter,
  onStatusClick,
}: StoriesStatusPipelineProps) {
  const stages = [
    {
      id: "draft" as StoryStatusFilter,
      label: "Rascunho",
      count: draft,
      icon: Pencil,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      activeRing: "ring-amber-500/50",
    },
    {
      id: "published" as StoryStatusFilter,
      label: "Publicadas",
      count: published,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      activeRing: "ring-emerald-500/50",
    },
    {
      id: "carousel" as StoryStatusFilter,
      label: "No Chat",
      count: inCarousel,
      icon: MessageSquare,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      activeRing: "ring-cyan-500/50",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-4 border border-luma-glass-border"
    >
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center gap-2 sm:gap-4">
            {/* Pipeline Node */}
            <button
              onClick={() => onStatusClick(activeFilter === stage.id ? "all" : stage.id)}
              className={cn(
                "pipeline-node min-w-[70px] sm:min-w-[90px] transition-all duration-200",
                activeFilter === stage.id && `active ring-2 ${stage.activeRing}`,
                activeFilter !== "all" && activeFilter !== stage.id && "opacity-50"
              )}
            >
              <div className={cn("p-2 rounded-lg", stage.bgColor)}>
                <stage.icon className={cn("h-4 w-4", stage.color)} />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">
                {stage.count}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                {stage.label}
              </span>
            </button>

            {/* Connector */}
            {index < stages.length - 1 && (
              <div className="pipeline-connector hidden sm:block w-8 lg:w-12" />
            )}
          </div>
        ))}
      </div>

      {/* Clear filter hint */}
      {activeFilter !== "all" && (
        <div className="mt-3 text-center">
          <button
            onClick={() => onStatusClick("all")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clique novamente para ver todas
          </button>
        </div>
      )}
    </motion.div>
  );
}
