import { motion } from "framer-motion";
import { HardDrive, FolderOpen, AlertTriangle, Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useGalleries, formatFileSize } from "@/hooks/useGalleries";
import { getPlanLimit, getGalleryStorageLimitBytes } from "@/lib/planLimits";

export function GalleryQuotaBar() {
  const { profile } = useAuth();
  const { data: galleries } = useGalleries();

  const plan = profile?.plan || "trial";
  const limits = getPlanLimit(plan);
  const storageLimitBytes = getGalleryStorageLimitBytes(plan);

  // Calculate totals
  const totalGalleries = galleries?.length || 0;
  const totalStorageUsed = galleries?.reduce((acc, g) => acc + (g.total_size_bytes || 0), 0) || 0;

  // Calculate percentages
  const galleriesPercentage = limits.galleries > 0 
    ? Math.min(100, (totalGalleries / limits.galleries) * 100) 
    : 0;
  const storagePercentage = storageLimitBytes > 0 
    ? Math.min(100, (totalStorageUsed / storageLimitBytes) * 100) 
    : 0;

  // Check if near limits
  const galleriesNearLimit = galleriesPercentage >= 80;
  const storageNearLimit = storagePercentage >= 80;
  const galleriesAtLimit = totalGalleries >= limits.galleries;
  const storageAtLimit = totalStorageUsed >= storageLimitBytes;

  // Lite plan has no access
  if (limits.galleries === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Crown className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Luma Gallery não disponível no plano {plan}
            </p>
            <p className="text-xs text-muted-foreground">
              Faça upgrade para Pro ou Ultra para criar galerias de entrega de fotos
            </p>
          </div>
          <Button variant="gradient" size="sm" asChild>
            <Link to="/admin/subscription">Fazer Upgrade</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl border border-luma-glass-border p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Uso do Plano</h3>
        <span className="text-xs text-muted-foreground capitalize">{plan}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Galleries quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
              Galerias
            </span>
            <span className={galleriesAtLimit ? "text-destructive font-medium" : galleriesNearLimit ? "text-amber-400" : ""}>
              {totalGalleries} / {limits.galleries === 999 ? "∞" : limits.galleries}
            </span>
          </div>
          <Progress 
            value={galleriesPercentage} 
            className={`h-2 ${galleriesAtLimit ? "[&>div]:bg-destructive" : galleriesNearLimit ? "[&>div]:bg-amber-400" : ""}`}
          />
          {galleriesAtLimit && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Limite atingido
            </p>
          )}
        </div>

        {/* Storage quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              Armazenamento
            </span>
            <span className={storageAtLimit ? "text-destructive font-medium" : storageNearLimit ? "text-amber-400" : ""}>
              {formatFileSize(totalStorageUsed)} / {formatFileSize(storageLimitBytes)}
            </span>
          </div>
          <Progress 
            value={storagePercentage} 
            className={`h-2 ${storageAtLimit ? "[&>div]:bg-destructive" : storageNearLimit ? "[&>div]:bg-amber-400" : ""}`}
          />
          {storageAtLimit && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Limite atingido
            </p>
          )}
        </div>
      </div>

      {/* Upgrade CTA when near limits */}
      {(galleriesNearLimit || storageNearLimit) && !galleriesAtLimit && !storageAtLimit && (
        <div className="pt-2 border-t border-luma-glass-border">
          <p className="text-xs text-muted-foreground">
            Você está próximo do limite. 
            <Link to="/admin/subscription" className="text-primary hover:underline ml-1">
              Considere fazer upgrade
            </Link>
          </p>
        </div>
      )}
    </motion.div>
  );
}
