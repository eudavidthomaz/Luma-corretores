import { cn } from "@/lib/utils";

interface SidebarQuotaRingProps {
  label: string;
  current: number;
  max: number;
  color: "primary" | "violet" | "cyan" | "amber";
}

export function SidebarQuotaRing({ label, current, max, color }: SidebarQuotaRingProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: "stroke-primary",
    violet: "stroke-violet-500",
    cyan: "stroke-cyan-500",
    amber: "stroke-amber-500",
  };

  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90" viewBox="0 0 44 44">
          {/* Background ring */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted/30"
          />
          {/* Progress ring */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className={cn(
              colorClasses[color],
              isAtLimit && "stroke-destructive",
              isNearLimit && !isAtLimit && "stroke-amber-500"
            )}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "text-xs font-semibold",
            isAtLimit ? "text-destructive" : "text-foreground"
          )}>
            {current}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
