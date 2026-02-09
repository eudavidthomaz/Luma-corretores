import { motion } from "framer-motion";
import { Images, Film, AlertTriangle, Crown, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useStoriesQuotas } from "@/hooks/useStoriesQuotas";

export function StoriesQuotaBar() {
  const quotas = useStoriesQuotas();

  // Check if near limits
  const storiesNearLimit = quotas.storiesPercentage >= 80;
  const storiesAtLimit = quotas.storiesUsed >= quotas.storiesLimit;

  // No access (Lite plan)
  if (!quotas.hasStoriesAccess) {
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
              Histórias Narradas não disponíveis no plano {quotas.plan}
            </p>
            <p className="text-xs text-muted-foreground">
              Faça upgrade para Pro ou Ultra para criar histórias visuais para seus clientes
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground capitalize">{quotas.plan}</span>
          {quotas.canUploadVideo && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-violet-500/20 text-violet-400 border-violet-500/30">
              <Film className="h-2.5 w-2.5 mr-0.5" />
              Vídeo
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Stories quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Images className="h-4 w-4" />
              Histórias
            </span>
            <span className={storiesAtLimit ? "text-destructive font-medium" : storiesNearLimit ? "text-amber-400" : ""}>
              {quotas.storiesUsed} / {quotas.storiesLimit}
            </span>
          </div>
          <Progress 
            value={quotas.storiesPercentage} 
            className={`h-2 ${storiesAtLimit ? "[&>div]:bg-destructive" : storiesNearLimit ? "[&>div]:bg-amber-400" : ""}`}
          />
          {storiesAtLimit && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Limite atingido
            </p>
          )}
        </div>

        {/* Info about chapters */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-luma-glass-border/50">
          <span>Máximo de capítulos por história:</span>
          <span className="font-medium text-foreground">{quotas.photosPerStory}</span>
        </div>

        {/* Video support info */}
        {!quotas.canUploadVideo && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Film className="h-3 w-3" />
            <span>Suporte a vídeo disponível no plano Ultra</span>
            <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-violet-500/20 text-violet-400 border-violet-500/30">
              <Zap className="h-2 w-2" />
            </Badge>
          </div>
        )}
      </div>

      {/* Upgrade CTA when near limits */}
      {storiesNearLimit && !storiesAtLimit && (
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
