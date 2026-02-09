import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateStory, useAddChapter } from "@/hooks/useStories";
import { useUploadFile } from "@/hooks/useStorage";
import { useStoriesQuotas } from "@/hooks/useStoriesQuotas";
import { useStoryCreation } from "@/hooks/useStoryCreation";
import { toast } from "@/hooks/use-toast";
import {
  StoryCreationStepper,
  StoryDetailsStep,
  StoryCoverStep,
  StoryChaptersStep,
  StoryReviewStep,
} from "@/components/admin/stories/creation";

export default function NewStoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createStory = useCreateStory();
  const addChapter = useAddChapter();
  const uploadFile = useUploadFile();
  const quotas = useStoriesQuotas();

  const {
    currentStep,
    draft,
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
    canAddMoreChapters,
    maxChapters,
    nextStep,
    prevStep,
    goToStep,
    updateDraft,
    setCover,
    addChapter: addChapterDraft,
    removeChapter,
    updateChapter,
    reset,
  } = useStoryCreation(quotas.photosPerStory);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = () => {
    reset();
    navigate("/admin/stories");
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Upload cover
      const coverPath = `${user.id}/covers/${Date.now()}-${draft.coverFile!.name}`;
      const coverUrl = await uploadFile.mutateAsync({ file: draft.coverFile!, path: coverPath });

      // Create story
      const story = await createStory.mutateAsync({
        profile_id: user.id,
        title: draft.title,
        category: "casamento", // Legacy field
        category_id: draft.categoryId,
        cover_image_url: coverUrl,
        is_published: draft.publishImmediately,
        show_in_carousel: draft.showInCarousel,
      } as any);

      // Upload chapters
      const validChapters = draft.chapters.filter((c) => c.file);
      for (let i = 0; i < validChapters.length; i++) {
        const chapter = validChapters[i];
        if (chapter.file) {
          const mediaPath = `${user.id}/chapters/${Date.now()}-${chapter.file.name}`;
          const mediaUrl = await uploadFile.mutateAsync({ file: chapter.file, path: mediaPath });

          await addChapter.mutateAsync({
            story_id: story.id,
            order_index: i + 1,
            narrative_text: chapter.narrativeText || null,
            media_url: mediaUrl,
            media_type: chapter.file.type.startsWith("video") ? "video" : "image",
          });
        }
      }

      toast({ title: "Imóvel cadastrado com sucesso!" });
      navigate("/admin/stories");
    } catch (error) {
      toast({
        title: "Erro ao cadastrar imóvel",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Novo Imóvel</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cadastre um novo imóvel para venda ou locação
          </p>
        </div>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 border border-luma-glass-border"
      >
        <StoryCreationStepper
          currentStep={currentStep}
          canProceedToStep2={canProceedToStep2}
          canProceedToStep3={canProceedToStep3}
          canProceedToStep4={canProceedToStep4}
          onStepClick={goToStep}
        />
      </motion.div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <StoryDetailsStep
            draft={draft}
            onUpdateDraft={updateDraft}
            onNext={nextStep}
            onCancel={handleCancel}
            canProceed={canProceedToStep2}
          />
        )}

        {currentStep === 2 && (
          <StoryCoverStep
            draft={draft}
            onSetCover={setCover}
            onNext={nextStep}
            onBack={prevStep}
            canProceed={canProceedToStep3}
          />
        )}

        {currentStep === 3 && (
          <StoryChaptersStep
            draft={draft}
            maxChapters={maxChapters}
            canAddMoreChapters={canAddMoreChapters}
            canUploadVideo={quotas.canUploadVideo}
            onAddChapter={addChapterDraft}
            onRemoveChapter={removeChapter}
            onUpdateChapter={updateChapter}
            onNext={nextStep}
            onBack={prevStep}
            canProceed={canProceedToStep4}
          />
        )}

        {currentStep === 4 && (
          <StoryReviewStep
            draft={draft}
            onUpdateDraft={updateDraft}
            onSubmit={handleSubmit}
            onBack={prevStep}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
