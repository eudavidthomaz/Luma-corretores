import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Ban, FolderOpen } from "lucide-react";

interface GalleryHeaderProps {
  totalGalleries: number;
  activeGalleries: number;
  onNewGallery: () => void;
  canCreate: boolean;
  hasAccess: boolean;
}

export function GalleryHeader({
  totalGalleries,
  activeGalleries,
  onNewGallery,
  canCreate,
  hasAccess,
}: GalleryHeaderProps) {
  const getSubtitle = () => {
    if (totalGalleries === 0) {
      return "Apresentação premium de imóveis para seus clientes";
    }
    if (activeGalleries === 0) {
      return "Nenhuma vitrine ativa no momento";
    }
    return `${activeGalleries} ${activeGalleries === 1 ? "vitrine ativa" : "vitrines ativas"}`;
  };

  const getButtonContent = () => {
    if (!hasAccess) {
      return (
        <>
          <Ban className="h-4 w-4" />
          Indisponível
        </>
      );
    }
    if (!canCreate) {
      return (
        <>
          <Ban className="h-4 w-4" />
          Limite Atingido
        </>
      );
    }
    return (
      <>
        <Plus className="h-4 w-4" />
        Nova Vitrine
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <FolderOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Luma Showcase
            </h1>
            {totalGalleries > 0 && (
              <Badge
                variant="secondary"
                className="h-6 px-2 text-xs font-medium bg-primary/10 text-primary border-primary/20"
              >
                {totalGalleries}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {getSubtitle()}
          </p>
        </div>
      </div>

      <Button
        variant="gradient"
        className="gap-2 shrink-0"
        onClick={onNewGallery}
        disabled={!hasAccess || !canCreate}
      >
        {getButtonContent()}
      </Button>
    </motion.div>
  );
}
