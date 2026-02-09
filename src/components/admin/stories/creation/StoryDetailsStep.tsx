import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { CategorySelector } from "@/components/admin/CategorySelector";
import { StoryLivePreview } from "./StoryLivePreview";
import { StoryDraft } from "@/hooks/useStoryCreation";

interface StoryDetailsStepProps {
  draft: StoryDraft;
  onUpdateDraft: (updates: Partial<StoryDraft>) => void;
  onNext: () => void;
  onCancel: () => void;
  canProceed: boolean;
}

export function StoryDetailsStep({
  draft,
  onUpdateDraft,
  onNext,
  onCancel,
  canProceed,
}: StoryDetailsStepProps) {
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

        {/* Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Informações Básicas
              </h2>
              <p className="text-sm text-muted-foreground">
                Defina o nome e a categoria do seu imóvel
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Nome do Imóvel / Endereço *</Label>
              <Input
                id="title"
                placeholder="Ex: Edifício Solar, Apt 402"
                value={draft.title}
                onChange={(e) => onUpdateDraft({ title: e.target.value })}
                className="glass border-luma-glass-border"
              />
              <p className="text-xs text-muted-foreground">
                Identifique o imóvel facilmente para seus clientes
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <CategorySelector
                value={draft.categoryId}
                onChange={(categoryId) => onUpdateDraft({ categoryId })}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="gradient"
          onClick={onNext}
          disabled={!canProceed}
          className="gap-2"
        >
          Próximo: Capa
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
