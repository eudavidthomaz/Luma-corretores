import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Ban } from "lucide-react";

interface StoriesHeaderProps {
  totalStories: number;
  publishedStories: number;
  onNewStory: () => void;
  canCreate: boolean;
  hasAccess: boolean;
}

export function StoriesHeader({
  totalStories,
  publishedStories,
  onNewStory,
  canCreate,
  hasAccess,
}: StoriesHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Meus Imóveis
            </h1>
            {totalStories > 0 && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {totalStories}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {publishedStories > 0 ? (
              <>
                {publishedStories} imóvel{publishedStories !== 1 ? "is" : ""} publicado{publishedStories !== 1 ? "s" : ""}
              </>
            ) : (
              "Gerencie sua carteira de imóveis"
            )}
          </p>
        </div>
      </div>

      <Button
        variant="gradient"
        className="gap-2 shrink-0"
        onClick={onNewStory}
        disabled={!hasAccess || !canCreate}
      >
        {!hasAccess ? (
          <>
            <Ban className="h-4 w-4" />
            Indisponível
          </>
        ) : !canCreate ? (
          <>
            <Ban className="h-4 w-4" />
            Limite Atingido
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Imóvel</span>
            <span className="sm:hidden">Novo</span>
          </>
        )}
      </Button>
    </motion.div>
  );
}
