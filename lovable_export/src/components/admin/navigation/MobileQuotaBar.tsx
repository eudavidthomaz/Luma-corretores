import { cn } from "@/lib/utils";

interface MobileQuotaBarProps {
  label: string;
  current: number;
  max: number;
  color: "primary" | "violet" | "cyan" | "amber";
}

export function MobileQuotaBar({ label, current, max, color }: MobileQuotaBarProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  
  const colorClasses = {
    primary: "bg-primary",
    violet: "bg-violet-500",
    cyan: "bg-cyan-500",
    amber: "bg-amber-500",
  };

  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn(
          "text-xs font-medium",
          isAtLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : "text-foreground"
        )}>
          {current}/{max}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isAtLimit ? "bg-destructive" : isNearLimit ? "bg-amber-500" : colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
