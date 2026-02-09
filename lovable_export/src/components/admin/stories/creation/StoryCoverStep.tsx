import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CoverUploadZone } from "./CoverUploadZone";
import { StoryLivePreview } from "./StoryLivePreview";
import { StoryDraft } from "@/hooks/useStoryCreation";

interface StoryCoverStepProps {
  draft: StoryDraft;
  onSetCover: (file: File | null) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

export function StoryCoverStep({
  draft,
  onSetCover,
  onNext,
  onBack,
  canProceed,
}: StoryCoverStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Card */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <StoryLivePreview
            title={draft.title}
            categoryId={draft.categoryId}
            coverPreview={draft.coverPreview}
            chaptersCount={draft.chapters.filter((c) => c.file).length}
          />
        </div>

        {/* Upload Zone */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Foto Principal / Destaque
              </h2>
              <p className="text-sm text-muted-foreground">
                A foto principal é o que vai atrair o clique do cliente
              </p>
            </div>

            <CoverUploadZone
              coverPreview={draft.coverPreview}
              onFileSelect={onSetCover}
              onRemove={() => onSetCover(null)}
            />
          </div>
        </div>
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
          Próximo: Ambientes
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
