import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Loader2 } from "lucide-react";
import { useStoriesQuotas } from "@/hooks/useStoriesQuotas";
import { useGalleryQuotas } from "@/hooks/useGalleryQuotas";

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  used: number;
  limit: number;
}

function ProgressCircle({
  percentage,
  size = 80,
  strokeWidth = 6,
  label,
  used,
  limit,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 90) return "stroke-red-500";
    if (pct >= 70) return "stroke-amber-500";
    return "stroke-emerald-500";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="progress-circle" width={size} height={size}>
          <circle
            className="progress-circle-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
          <circle
            className={`progress-circle-fill ${getColor(percentage)}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">
            {used}/{limit}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{label}</p>
    </div>
  );
}

export function PlanUsageCard() {
  const storiesQuota = useStoriesQuotas();
  const galleryQuota = useGalleryQuotas();

  const isLoading = storiesQuota.isLoading || galleryQuota.isLoading;

  const showUpgrade =
    storiesQuota.storiesPercentage >= 80 || galleryQuota.galleriesPercentage >= 80;

  const planLabels: Record<string, string> = {
    trial: "Trial",
    lite: "Lite",
    pro: "Pro",
    ultra: "Ultra",
    free: "Free",
    enterprise: "Enterprise",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bento-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Uso do Plano
        </h3>
        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
          {planLabels[storiesQuota.plan] || storiesQuota.plan}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-around py-2">
            <ProgressCircle
              percentage={storiesQuota.storiesPercentage}
              label="Imóveis"
              used={storiesQuota.storiesUsed}
              limit={storiesQuota.storiesLimit}
            />
            {galleryQuota.hasGalleryAccess && (
              <ProgressCircle
                percentage={galleryQuota.galleriesPercentage}
                label="Vitrines"
                used={galleryQuota.galleriesUsed}
                limit={galleryQuota.galleriesLimit}
              />
            )}
          </div>

          {showUpgrade && (
            <Link
              to="/admin/subscription"
              className="mt-4 block text-center text-xs text-primary hover:underline font-medium"
            >
              Fazer upgrade →
            </Link>
          )}
        </>
      )}
    </motion.div>
  );
}
