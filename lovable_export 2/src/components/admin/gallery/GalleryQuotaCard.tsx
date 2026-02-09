import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { FolderOpen, HardDrive, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryQuotaCardProps {
  galleriesUsed: number;
  galleriesLimit: number;
  storageUsed: number;
  storageLimit: number;
  plan: string;
  onUpgrade?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return "bg-destructive";
  if (percentage >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

export function GalleryQuotaCard({
  galleriesUsed,
  galleriesLimit,
  storageUsed,
  storageLimit,
  plan,
  onUpgrade,
}: GalleryQuotaCardProps) {
  const galleriesPercentage = galleriesLimit > 0
    ? Math.min(100, (galleriesUsed / galleriesLimit) * 100)
    : 0;
  const storagePercentage = storageLimit > 0
    ? Math.min(100, (storageUsed / storageLimit) * 100)
    : 0;

  const showUpgrade = galleriesPercentage >= 80 || storagePercentage >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-5 border border-luma-glass-border h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Uso do Plano
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">
          {plan}
        </span>
      </div>

      <div className="space-y-5 flex-1">
        {/* Galleries Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
              <span>Vitrines</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {galleriesUsed} / {galleriesLimit}
            </span>
          </div>
          <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${galleriesPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("h-full rounded-full", getProgressColor(galleriesPercentage))}
            />
          </div>
        </div>

        {/* Storage Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span>Armazenamento</span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
            </span>
          </div>
          <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${storagePercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className={cn("h-full rounded-full", getProgressColor(storagePercentage))}
            />
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {showUpgrade && onUpgrade && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 gap-2 border-primary/30 text-primary hover:bg-primary/10"
          onClick={onUpgrade}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Aumentar Limites
        </Button>
      )}
    </motion.div>
  );
}
