import { motion } from "framer-motion";
import { Upload, Trash2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverUploadZoneProps {
  coverPreview: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export function CoverUploadZone({
  coverPreview,
  onFileSelect,
  onRemove,
}: CoverUploadZoneProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  if (coverPreview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative aspect-[3/4] max-w-xs mx-auto rounded-2xl overflow-hidden border border-luma-glass-border"
      >
        <img
          src={coverPreview}
          alt="Capa da história"
          className="w-full h-full object-cover"
        />

        {/* Remove Button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 p-2 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Change hint */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-xs text-white/80 text-center">
            Clique no X para trocar
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <label
      className={cn(
        "flex flex-col items-center justify-center",
        "aspect-[3/4] max-w-xs mx-auto rounded-2xl",
        "border-2 border-dashed border-luma-glass-border",
        "hover:border-primary/50 cursor-pointer transition-all",
        "bg-muted/20 hover:bg-muted/30"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="p-4 rounded-full bg-primary/10">
          <ImageIcon className="h-8 w-8 text-primary" />
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            Arraste sua imagem de capa
          </p>
          <p className="text-xs text-muted-foreground">
            ou clique para selecionar
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-luma-glass-border/50">
          <Upload className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">PNG, JPG • 3:4</span>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  );
}
