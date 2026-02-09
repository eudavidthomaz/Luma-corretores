import { useRef } from "react";
import { motion, Reorder, useDragControls } from "framer-motion";
import { Upload, Trash2, GripVertical, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CarouselPhoto, useCarouselPhotos, useUploadCarouselPhoto, useDeleteCarouselPhoto, useReorderCarouselPhotos } from "@/hooks/useMinisiteCarousel";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

interface DraggablePhotoProps {
  photo: CarouselPhoto;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function DraggablePhoto({ photo, onDelete, isDeleting }: DraggablePhotoProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={photo}
      dragListener={false}
      dragControls={dragControls}
      className="relative group"
      whileDrag={{ scale: 1.05, zIndex: 50 }}
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
        <img
          src={photo.thumbnail_url}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Overlay with controls */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <div 
            className="p-2 rounded-lg bg-white/20 cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical className="h-4 w-4 text-white" />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(photo.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Reorder.Item>
  );
}

export function CarouselUploader() {
  const { profile } = useAuth();
  const { maxCarouselPhotos } = useFeatureAccess();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: photos = [], isLoading } = useCarouselPhotos(profile?.id);
  const uploadPhoto = useUploadCarouselPhoto();
  const deletePhoto = useDeleteCarouselPhoto();
  const reorderPhotos = useReorderCarouselPhotos();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxCarouselPhotos - photos.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      await uploadPhoto.mutateAsync({ file, maxPhotos: maxCarouselPhotos });
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleReorder = (newOrder: CarouselPhoto[]) => {
    reorderPhotos.mutate(newOrder);
  };

  const canUpload = photos.length < maxCarouselPhotos;

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Galeria / Carrossel
        </CardTitle>
        <CardDescription>
          Adicione até {maxCarouselPhotos} fotos para exibir em seu mini-site. Arraste para reordenar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {photos.length > 0 ? (
              <Reorder.Group
                axis="x"
                values={photos}
                onReorder={handleReorder}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
              >
                {photos.map((photo) => (
                  <DraggablePhoto
                    key={photo.id}
                    photo={photo}
                    onDelete={(id) => deletePhoto.mutate(id)}
                    isDeleting={deletePhoto.isPending}
                  />
                ))}
              </Reorder.Group>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhuma foto adicionada ainda</p>
              </div>
            )}

            {canUpload && (
              <Button
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={uploadPhoto.isPending}
                className="w-full gap-2 border-dashed"
              >
                {uploadPhoto.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Adicionar Fotos ({photos.length}/{maxCarouselPhotos})
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
