import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Plus, Crown } from "lucide-react";
import { ChapterEditor } from "./ChapterEditor";
import { ChapterDraft, StoryDraft } from "@/hooks/useStoryCreation";

interface StoryChaptersStepProps {
  draft: StoryDraft;
  maxChapters: number;
  canAddMoreChapters: boolean;
  canUploadVideo: boolean;
  onAddChapter: () => void;
  onRemoveChapter: (id: string) => void;
  onUpdateChapter: (id: string, updates: Partial<ChapterDraft>) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

export function StoryChaptersStep({
  draft,
  maxChapters,
  canAddMoreChapters,
  canUploadVideo,
  onAddChapter,
  onRemoveChapter,
  onUpdateChapter,
  onNext,
  onBack,
  canProceed,
}: StoryChaptersStepProps) {
  const validChaptersCount = draft.chapters.filter((c) => c.file).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Ambientes do Imóvel
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {draft.chapters.length} / {maxChapters} fotos/vídeos
              </p>
              {!canUploadVideo && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-violet-500/20 text-violet-400 border-violet-500/30 gap-1"
                >
                  <Crown className="h-3 w-3" />
                  Vídeo no Ultra
                </Badge>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onAddChapter}
            disabled={!canAddMoreChapters}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {/* Chapters List */}
        <div className="space-y-4">
          {draft.chapters.map((chapter, index) => (
            <ChapterEditor
              key={chapter.id}
              chapter={chapter}
              index={index}
              canUploadVideo={canUploadVideo}
              canRemove={draft.chapters.length > 1}
              onUpdate={(updates) => onUpdateChapter(chapter.id, updates)}
              onRemove={() => onRemoveChapter(chapter.id)}
            />
          ))}
        </div>

        {/* Progress hint */}
        {validChaptersCount === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Adicione pelo menos uma imagem para continuar
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button
          variant="gradient"
          onClick={onNext}
          disabled={!canProceed}
          className="gap-2"
        >
          Próximo: Publicar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
