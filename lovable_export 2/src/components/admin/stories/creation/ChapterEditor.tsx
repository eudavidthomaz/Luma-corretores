import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, GripVertical, Crown, Film } from "lucide-react";
import { ChapterDraft } from "@/hooks/useStoryCreation";
import { cn } from "@/lib/utils";

interface ChapterEditorProps {
  chapter: ChapterDraft;
  index: number;
  canUploadVideo: boolean;
  canRemove: boolean;
  onUpdate: (updates: Partial<ChapterDraft>) => void;
  onRemove: () => void;
}

export function ChapterEditor({
  chapter,
  index,
  canUploadVideo,
  canRemove,
  onUpdate,
  onRemove,
}: ChapterEditorProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate({ file });
    }
  };

  const isVideo = chapter.file?.type.startsWith("video");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-3 p-4 rounded-xl bg-muted/30 border border-luma-glass-border group"
    >
      {/* Drag Handle */}
      <div className="flex items-center">
        <div className="p-1 rounded text-muted-foreground/50 cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Chapter Number */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-semibold text-sm shrink-0">
        {index + 1}
      </div>

      {/* Media Upload */}
      <div className="shrink-0">
        {chapter.previewUrl ? (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-luma-glass-border">
            {isVideo ? (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Film className="h-8 w-8 text-muted-foreground" />
              </div>
            ) : (
              <img
                src={chapter.previewUrl}
                alt={`Capítulo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => onUpdate({ file: null })}
              className="absolute top-1 right-1 p-1 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <label
            className={cn(
              "relative flex flex-col items-center justify-center",
              "w-20 h-20 sm:w-24 sm:h-24 rounded-lg",
              "border-2 border-dashed border-luma-glass-border",
              "hover:border-primary/50 cursor-pointer transition-colors"
            )}
          >
            <Upload className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-[10px] text-muted-foreground">Upload</span>
            <input
              type="file"
              accept={canUploadVideo ? "image/*,video/*" : "image/*"}
              className="hidden"
              onChange={handleFileChange}
            />
            {!canUploadVideo && (
              <div className="absolute -top-1 -right-1">
                <Badge className="text-[8px] px-1 py-0 bg-violet-500/20 text-violet-400 border-violet-500/30">
                  <Crown className="h-2 w-2" />
                </Badge>
              </div>
            )}
          </label>
        )}
      </div>

      {/* Narrative Text */}
      <div className="flex-1 min-w-0">
        <Textarea
          placeholder="Texto narrativo que a Luma vai apresentar... (opcional)"
          value={chapter.narrativeText}
          onChange={(e) => onUpdate({ narrativeText: e.target.value })}
          className="min-h-[80px] sm:min-h-[96px] resize-none glass border-luma-glass-border text-sm"
        />
      </div>

      {/* Remove Button */}
      {canRemove && (
        <div className="flex items-start">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="opacity-50 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
