import { motion } from "framer-motion";
import { Flame, Snowflake, Sun } from "lucide-react";
import { FunnelStage } from "@/hooks/useFunnelStats";
import { cn } from "@/lib/utils";

interface FunnelChartProps {
  stages: FunnelStage[];
  heatBreakdown: {
    cold: number;
    warm: number;
    hot: number;
  };
}

export function FunnelChart({ stages, heatBreakdown }: FunnelChartProps) {
  return (
    <div className="space-y-4">
      {/* Funnel - horizontal em desktop, vertical em mobile */}
      <div className="relative">
        {/* Desktop: horizontal */}
        <div className="hidden sm:flex items-start justify-between relative px-2">
          {/* Linha conectora horizontal */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-gradient-to-r from-primary/50 via-primary/20 to-border" />
          
          {stages.map((stage, index) => (
            <motion.div 
              key={stage.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center z-10 flex-1"
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                "bg-background border-2",
                stage.count > 0 
                  ? "border-primary bg-primary/10 shadow-sm" 
                  : "border-border"
              )}>
                <span className={cn(
                  "text-sm font-bold",
                  stage.count > 0 ? "text-primary" : "text-muted-foreground"
                )}>
                  {stage.count}
                </span>
              </div>
              <span className="text-xs font-medium mt-2 text-foreground">
                {stage.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {stage.percentage.toFixed(0)}%
              </span>
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="sm:hidden space-y-3">
          {stages.map((stage, index) => (
            <motion.div 
              key={stage.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                "bg-background border-2",
                stage.count > 0 
                  ? "border-primary bg-primary/10 shadow-sm" 
                  : "border-border"
              )}>
                <span className={cn(
                  "text-sm font-bold",
                  stage.count > 0 ? "text-primary" : "text-muted-foreground"
                )}>
                  {stage.count}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {stage.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stage.percentage.toFixed(0)}%
                  </span>
                </div>
                {/* Barra de progresso */}
                <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                    className="h-full bg-primary/60 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Heat breakdown inline */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground pt-2 border-t border-border/50"
      >
        <span className="flex items-center gap-1.5">
          <Snowflake className="w-3 h-3 text-blue-400" />
          {heatBreakdown.cold}
        </span>
        <span className="flex items-center gap-1.5">
          <Sun className="w-3 h-3 text-yellow-400" />
          {heatBreakdown.warm}
        </span>
        <span className="flex items-center gap-1.5">
          <Flame className="w-3 h-3 text-orange-400" />
          {heatBreakdown.hot}
        </span>
      </motion.div>
    </div>
  );
}
