import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelStage } from "@/hooks/useFunnelStats";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadsFunnelStagesProps {
  stages: FunnelStage[];
  onStageClick?: (stageId: string) => void;
}

export function LeadsFunnelStages({ stages, onStageClick }: LeadsFunnelStagesProps) {
  if (!stages || stages.length === 0) {
    return (
      <Card className="glass border-luma-glass-border h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Funil de Conversação
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Sem dados ainda</p>
        </CardContent>
      </Card>
    );
  }

  const stageColors = [
    { bg: "bg-primary/20", text: "text-primary", border: "border-primary/40" },
    { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/40" },
    { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/40" },
    { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/40" },
  ];

  return (
    <Card className="glass border-luma-glass-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          Funil de Conversação
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {/* Desktop: horizontal layout */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between gap-1">
            {stages.map((stage, index) => {
              const colors = stageColors[index % stageColors.length];

              return (
                <div key={stage.id} className="flex items-center flex-1">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onStageClick?.(stage.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2 rounded-lg flex-1",
                      "transition-all hover:bg-card/60",
                      colors.bg
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        "border",
                        colors.border,
                        colors.bg
                      )}
                    >
                      <span className={cn("text-base font-bold", colors.text)}>
                        {stage.count}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">
                      {stage.name}
                    </span>
                  </motion.button>

                  {index < stages.length - 1 && (
                    <div className="w-4 h-px bg-border/50 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical compact layout */}
        <div className="sm:hidden space-y-2">
          {stages.map((stage, index) => {
            const colors = stageColors[index % stageColors.length];
            const percentage = stage.percentage || 0;

            return (
              <motion.button
                key={stage.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => onStageClick?.(stage.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg",
                  "transition-all hover:bg-card/60",
                  "border border-white/5"
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                    "border",
                    colors.border,
                    colors.bg
                  )}
                >
                  <span className={cn("text-sm font-bold", colors.text)}>
                    {stage.count}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {stage.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                      className={cn("h-full rounded-full", colors.bg.replace("/20", "/60"))}
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
