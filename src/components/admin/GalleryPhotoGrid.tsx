import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2,
  HardDrive,
  Star
} from "lucide-react";
import { useGalleryPhotos, formatFileSize, GalleryPhoto } from "@/hooks/useGalleries";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GalleryPhotoGridProps {
  galleryId: string;
  currentTotalSizeBytes?: number;
  currentCoverUrl?: string | null;
  onCoverChange?: () => void;
}

export function GalleryPhotoGrid({ 
  galleryId, 
  currentTotalSizeBytes = 0,
  currentCoverUrl,
  onCoverChange 
}: GalleryPhotoGridProps) {
  const { data: photos, isLoading } = useGalleryPhotos(galleryId);
  const queryClient = useQueryClient();
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [settingCover, setSettingCover] = useState<string | null>(null);

  const isCover = (photo: GalleryPhoto) => {
    if (!currentCoverUrl) return false;
    
    // Cover pode ser o path da thumbnail ou o file_path (legado)
    // Verificar ambos os formatos para compatibilidade
    
    // 1. Comparar diretamente com file_path
    if (currentCoverUrl === photo.file_path) return true;
    
    // 2. Comparar com path extraído da thumbnail_url
    if (photo.thumbnail_url) {
      const match = photo.thumbnail_url.match(/gallery-thumbnails\/(.+)$/);
      const thumbnailPath = match ? decodeURIComponent(match[1]) : null;
      if (thumbnailPath && currentCoverUrl === thumbnailPath) return true;
    }
    
    // 3. Comparar com URLs completas (legado)
    if (currentCoverUrl === photo.thumbnail_url || currentCoverUrl === photo.file_url) {
      return true;
    }
    
    return false;
  };

  const setCoverPhoto = async (photo: GalleryPhoto, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection toggle
    setSettingCover(photo.id);
    try {
      // Extrair o path da thumbnail (bucket público) para usar como cover
      // thumbnail_url é uma URL completa: "https://.../gallery-thumbnails/path/to/file.jpg"
      // Precisamos extrair apenas o path: "path/to/file.jpg"
      let coverPath: string | null = null;
      
      if (photo.thumbnail_url) {
        // Extrair path do thumbnail_url (URL pública completa)
        const match = photo.thumbnail_url.match(/gallery-thumbnails\/(.+)$/);
        coverPath = match ? decodeURIComponent(match[1]) : null;
      }
      
      // Fallback: se não tiver thumbnail, usar file_path (menos ideal, mas evita null)
      if (!coverPath) {
        coverPath = photo.file_path;
      }

      const { error } = await supabase
        .from("galleries")
        .update({ cover_url: coverPath })
        .eq("id", galleryId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["gallery", galleryId] });
      queryClient.invalidateQueries({ queryKey: ["galleries"] });
      onCoverChange?.();

      toast({ title: "Capa definida!", description: photo.filename });
    } catch (error) {
      console.error("Error setting cover:", error);
      toast({ title: "Erro ao definir capa", variant: "destructive" });
    } finally {
      setSettingCover(null);
    }
  };

  // Calculate selected photos info for dialog
  const selectedPhotosInfo = useMemo(() => {
    if (!photos) return { count: 0, totalSize: 0, previews: [] };
    const selected = photos.filter((p) => selectedPhotos.has(p.id));
    return {
      count: selected.length,
      totalSize: selected.reduce((acc, p) => acc + (p.file_size || 0), 0),
      previews: selected.slice(0, 6), // Show max 6 previews
    };
  }, [photos, selectedPhotos]);

  const toggleSelect = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (!photos) return;
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map((p) => p.id)));
    }
  };

  const deleteSelected = async () => {
    if (selectedPhotos.size === 0) return;

    setIsDeleting(true);

    try {
      const photosToDelete = photos?.filter((p) => selectedPhotos.has(p.id)) || [];

      // Delete from storage
      const filePaths = photosToDelete.map((p) => p.file_path);
      const thumbPaths = photosToDelete
        .filter((p) => p.thumbnail_url)
        .map((p) => {
          const url = p.thumbnail_url!;
          const match = url.match(/gallery-thumbnails\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];

      // Delete originals
      if (filePaths.length > 0) {
        await supabase.storage.from("gallery-photos").remove(filePaths);
      }

      // Delete thumbnails
      if (thumbPaths.length > 0) {
        await supabase.storage.from("gallery-thumbnails").remove(thumbPaths);
      }

      // Delete from database
      const { error } = await supabase
        .from("gallery_photos")
        .delete()
        .in("id", Array.from(selectedPhotos));

      if (error) throw error;

      // Update gallery stats including total_size_bytes
      const totalSize = photosToDelete.reduce((acc, p) => acc + (p.file_size || 0), 0);
      const newTotalSize = Math.max(0, currentTotalSizeBytes - totalSize);
      
      await supabase
        .from("galleries")
        .update({
          photos_count: (photos?.length || 0) - photosToDelete.length,
          total_size_bytes: newTotalSize,
        })
        .eq("id", galleryId);

      setSelectedPhotos(new Set());
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["gallery-photos", galleryId] });
      queryClient.invalidateQueries({ queryKey: ["gallery", galleryId] });
      queryClient.invalidateQueries({ queryKey: ["galleries"] });

      toast({ 
        title: `${photosToDelete.length} foto(s) excluída(s)`,
        description: `${formatFileSize(totalSize)} liberados`
      });
    } catch (error) {
      console.error("Error deleting photos:", error);
      toast({
        title: "Erro ao excluir fotos",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ImageIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">
          Nenhuma foto ainda. Use o upload acima para adicionar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedPhotos.size === photos.length && photos.length > 0}
            onCheckedChange={selectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedPhotos.size > 0
              ? `${selectedPhotos.size} selecionada(s)`
              : `${photos.length} fotos`}
          </span>
        </div>

        <AnimatePresence>
          {selectedPhotos.size > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir {selectedPhotos.size}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass border-luma-glass-border max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir {selectedPhotosInfo.count} foto(s)?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-4">
                        <p>Esta ação não pode ser desfeita.</p>
                        
                        {/* Photo previews */}
                        <div className="grid grid-cols-6 gap-1.5">
                          {selectedPhotosInfo.previews.map((photo) => (
                            <div
                              key={photo.id}
                              className="aspect-square rounded-md overflow-hidden"
                            >
                              <img
                                src={photo.thumbnail_url || photo.file_url}
                                alt={photo.filename}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {selectedPhotosInfo.count > 6 && (
                            <div className="aspect-square rounded-md bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                              +{selectedPhotosInfo.count - 6}
                            </div>
                          )}
                        </div>

                        {/* Space to be freed */}
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <HardDrive className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm text-emerald-400">
                            {formatFileSize(selectedPhotosInfo.totalSize)} serão liberados
                          </span>
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteSelected}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <TooltipProvider delayDuration={300}>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {photos.map((photo, index) => {
            const isCurrentCover = isCover(photo);
            const isSettingThis = settingCover === photo.id;
            
            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden cursor-pointer group",
                  "border-2 transition-all",
                  isCurrentCover
                    ? "border-amber-400 ring-2 ring-amber-400/30"
                    : selectedPhotos.has(photo.id)
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-primary/50"
                )}
                onClick={() => toggleSelect(photo.id)}
              >
                <img
                  src={photo.thumbnail_url || photo.file_url}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Selection Overlay */}
                <div
                  className={cn(
                    "absolute inset-0 transition-all",
                    selectedPhotos.has(photo.id)
                      ? "bg-primary/20"
                      : "bg-black/0 group-hover:bg-black/20"
                  )}
                />

                {/* Cover Badge */}
                {isCurrentCover && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <Star className="h-3 w-3 fill-current" />
                    Capa
                  </div>
                )}

                {/* Set as Cover Button (on hover, only if not already cover) */}
                {!isCurrentCover && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => setCoverPhoto(photo, e)}
                        disabled={isSettingThis}
                        className={cn(
                          "absolute top-2 right-2 p-1.5 rounded-full transition-all",
                          "bg-black/50 hover:bg-amber-400 hover:text-amber-950",
                          "opacity-0 group-hover:opacity-100",
                          isSettingThis && "opacity-100"
                        )}
                      >
                        {isSettingThis ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <Star className="h-4 w-4 text-white" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Definir como capa</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Checkbox */}
                <div
                  className={cn(
                    "absolute top-2 left-2 transition-all",
                    selectedPhotos.has(photo.id) || "opacity-0 group-hover:opacity-100"
                  )}
                >
                  {selectedPhotos.has(photo.id) ? (
                    <CheckCircle2 className="h-6 w-6 text-primary drop-shadow-lg" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-white bg-black/30" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
