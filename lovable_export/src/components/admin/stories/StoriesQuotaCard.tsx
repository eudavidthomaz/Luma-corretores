import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Film, Crown, Sparkles } from "lucide-react";

interface StoriesQuotaCardProps {
  storiesUsed: number;
  storiesLimit: number;
  chaptersPerStory: number;
  canUploadVideo: boolean;
  plan: string;
  onUpgrade: () => void;
}

export function StoriesQuotaCard({
  storiesUsed,
  storiesLimit,
  chaptersPerStory,
  canUploadVideo,
  plan,
  onUpgrade,
}: StoriesQuotaCardProps) {
  const storiesPercentage = storiesLimit > 0
    ? Math.min(100, (storiesUsed / storiesLimit) * 100)
    : 0;

  const isNearLimit = storiesPercentage >= 80;
  const isAtLimit = storiesPercentage >= 100;

  const getProgressColor = () => {
    if (isAtLimit) return "bg-destructive";
    if (isNearLimit) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-5 border border-luma-glass-border h-full"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Uso do Plano
        </h3>
      </div>

      <div className="space-y-5">
        {/* Stories Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Imóveis</span>
            </div>
            <span className="text-sm font-medium">
              {storiesUsed} / {storiesLimit}
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${storiesPercentage}%` }}
            />
          </div>
        </div>

        {/* Chapters per Story */}
        <div className="p-3 rounded-xl bg-muted/30 border border-luma-glass-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Por imóvel</span>
            <span className="text-sm font-medium">{chaptersPerStory} fotos/vídeos</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Vídeo</span>
            <Badge
              variant={canUploadVideo ? "default" : "secondary"}
              className={canUploadVideo
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-muted text-muted-foreground"
              }
            >
              {canUploadVideo ? (
                <>
                  <Film className="h-3 w-3 mr-1" />
                  Liberado
                </>
              ) : (
                <>
                  <Crown className="h-3 w-3 mr-1" />
                  Ultra
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Upgrade CTA */}
        {(isNearLimit || !canUploadVideo) && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
            onClick={onUpgrade}
          >
            <Crown className="h-4 w-4" />
            Fazer Upgrade
          </Button>
        )}
      </div>
    </motion.div>
  );
}
