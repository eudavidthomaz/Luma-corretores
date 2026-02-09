import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, Layers, MessageSquare, Eye } from "lucide-react";
import { StoryLivePreview } from "./StoryLivePreview";
import { StoryDraft } from "@/hooks/useStoryCreation";
import { useCategories } from "@/hooks/useCategories";

interface StoryReviewStepProps {
  draft: StoryDraft;
  onUpdateDraft: (updates: Partial<StoryDraft>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function StoryReviewStep({
  draft,
  onUpdateDraft,
  onSubmit,
  onBack,
  isSubmitting,
}: StoryReviewStepProps) {
  const { data: categories } = useCategories();
  const validChaptersCount = draft.chapters.filter((c) => c.file).length;

  const categoryName =
    categories?.find((c) => c.id === draft.categoryId)?.name || draft.categoryId;

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
            chaptersCount={validChaptersCount}
            isPublished={draft.publishImmediately}
            isInCarousel={draft.showInCarousel && draft.publishImmediately}
          />
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
          {/* Summary */}
          <div className="glass rounded-2xl p-6 border border-luma-glass-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Resumo do Imóvel
            </h2>

            <div className="grid gap-3">
              <div className="flex items-center justify-between py-2 border-b border-luma-glass-border/50">
                <span className="text-sm text-muted-foreground">Nome/Endereço</span>
                <span className="text-sm font-medium text-foreground">
                  {draft.title}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-luma-glass-border/50">
                <span className="text-sm text-muted-foreground">Categoria</span>
                <span className="text-sm font-medium text-foreground">
                  {categoryName}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-luma-glass-border/50">
                <span className="text-sm text-muted-foreground">Ambientes</span>
                <Badge variant="secondary" className="gap-1">
                  <Layers className="h-3 w-3" />
                  {validChaptersCount}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  className={
                    draft.publishImmediately
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }
                >
                  {draft.publishImmediately ? "Publicada" : "Rascunho"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Chapters Preview */}
          <div className="glass rounded-2xl p-6 border border-luma-glass-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Preview das Mídias
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {draft.chapters
                .filter((c) => c.previewUrl)
                .map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-luma-glass-border"
                  >
                    <img
                      src={chapter.previewUrl!}
                      alt={`Ambiente ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-center">
                      <span className="text-[10px] text-white font-medium">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Visibility Options */}
          <div className="glass rounded-2xl p-6 border border-luma-glass-border space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Configurações de Visibilidade
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Eye className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <Label
                      htmlFor="publish"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Publicar imediatamente
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Tornar visível para visitantes
                    </p>
                  </div>
                </div>
                <Switch
                  id="publish"
                  checked={draft.publishImmediately}
                  onCheckedChange={(checked) =>
                    onUpdateDraft({ publishImmediately: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10">
                    <MessageSquare className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <Label
                      htmlFor="carousel"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Mostrar no Chat da Luma
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Exibir no carrossel de imóveis
                    </p>
                  </div>
                </div>
                <Switch
                  id="carousel"
                  checked={draft.showInCarousel}
                  onCheckedChange={(checked) =>
                    onUpdateDraft({ showInCarousel: checked })
                  }
                  disabled={!draft.publishImmediately}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isSubmitting}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button
          variant="gradient"
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Cadastrar Imóvel
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
