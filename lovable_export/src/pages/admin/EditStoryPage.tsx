import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Plus, Trash2, Upload, Save, Loader2, GripVertical, MessageSquare, Film, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStory, useUpdateStory, useDeleteStory, useAddChapter } from "@/hooks/useStories";
import { useDeleteChapter, useUpdateChapter } from "@/hooks/useChapters";
import { useUploadFile } from "@/hooks/useStorage";
import { toast } from "@/hooks/use-toast";
import { CategorySelector } from "@/components/admin/CategorySelector";
import { useStoriesQuotas } from "@/hooks/useStoriesQuotas";
import { UpgradeModal } from "@/components/admin/UpgradeModal";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";

interface ChapterDraft {
  id: string;
  isNew: boolean;
  narrativeText: string;
  file: File | null;
  previewUrl: string | null;
  mediaUrl: string | null;
  orderIndex: number;
}

export default function EditStoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: story, isLoading } = useStory(id || "");
  const updateStory = useUpdateStory();
  const deleteStory = useDeleteStory();
  const addChapter = useAddChapter();
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();
  const uploadFile = useUploadFile();
  const quotas = useStoriesQuotas();
  const upgradeModal = useUpgradeModal();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [isPublished, setIsPublished] = useState(false);
  const [showInCarousel, setShowInCarousel] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load story data
  useEffect(() => {
    if (story) {
      setTitle(story.title);
      // Use category_id if available, otherwise leave empty for legacy stories
      setCategoryId((story as any).category_id || "");
      setIsPublished(story.is_published);
      setShowInCarousel((story as any).show_in_carousel !== false);
      setCoverPreview(story.cover_image_url);
      
      const existingChapters: ChapterDraft[] = (story.story_chapters || [])
        .sort((a, b) => a.order_index - b.order_index)
        .map(ch => ({
          id: ch.id,
          isNew: false,
          narrativeText: ch.narrative_text || "",
          file: null,
          previewUrl: ch.media_url,
          mediaUrl: ch.media_url,
          orderIndex: ch.order_index,
        }));
      
      setChapters(existingChapters.length > 0 ? existingChapters : [
        { id: crypto.randomUUID(), isNew: true, narrativeText: "", file: null, previewUrl: null, mediaUrl: null, orderIndex: 1 }
      ]);
    }
  }, [story]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleChapterFileChange = (chapterId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChapters(prev => prev.map(ch => 
        ch.id === chapterId 
          ? { ...ch, file, previewUrl: URL.createObjectURL(file) }
          : ch
      ));
    }
  };

  const addChapterDraft = () => {
    if (chapters.length >= quotas.photosPerStory) {
      upgradeModal.open({
        feature: "chapters",
        requiredPlan: "ultra",
        customTitle: "Limite de Capítulos Atingido",
        customDescription: `Seu plano permite até ${quotas.photosPerStory} capítulos por história`,
      });
      return;
    }
    const maxOrder = Math.max(...chapters.map(ch => ch.orderIndex), 0);
    setChapters(prev => [
      ...prev,
      { id: crypto.randomUUID(), isNew: true, narrativeText: "", file: null, previewUrl: null, mediaUrl: null, orderIndex: maxOrder + 1 }
    ]);
  };

  const canAddMoreChapters = chapters.length < quotas.photosPerStory;

  const removeChapterDraft = async (chapterId: string, isNew: boolean) => {
    if (!isNew) {
      try {
        await deleteChapter.mutateAsync(chapterId);
        toast({ title: "Capítulo removido" });
      } catch (error) {
        toast({ title: "Erro ao remover capítulo", variant: "destructive" });
        return;
      }
    }
    setChapters(prev => prev.filter(ch => ch.id !== chapterId));
  };

  const updateChapterText = (chapterId: string, text: string) => {
    setChapters(prev => prev.map(ch => 
      ch.id === chapterId ? { ...ch, narrativeText: text } : ch
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    if (!title.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      let coverUrl = story?.cover_image_url;

      // Upload new cover if changed
      if (coverFile) {
        const coverPath = `${user.id}/covers/${Date.now()}-${coverFile.name}`;
        coverUrl = await uploadFile.mutateAsync({ file: coverFile, path: coverPath });
      }

      // Update story - using category_id for new hierarchical system
      await updateStory.mutateAsync({
        id,
        title,
        category: "casamento", // Legacy field - required but we use category_id
        category_id: categoryId || undefined,
        cover_image_url: coverUrl,
        is_published: isPublished,
        show_in_carousel: showInCarousel,
      } as any);

      // Handle chapters
      for (const chapter of chapters) {
        if (chapter.isNew && chapter.file) {
          // New chapter with file
          const mediaPath = `${user.id}/chapters/${Date.now()}-${chapter.file.name}`;
          const mediaUrl = await uploadFile.mutateAsync({ file: chapter.file, path: mediaPath });
          
          await addChapter.mutateAsync({
            story_id: id,
            order_index: chapter.orderIndex,
            narrative_text: chapter.narrativeText || null,
            media_url: mediaUrl,
            media_type: chapter.file.type.startsWith("video") ? "video" : "image",
          });
        } else if (!chapter.isNew) {
          // Existing chapter - update text or file
          let mediaUrl = chapter.mediaUrl;
          
          if (chapter.file) {
            const mediaPath = `${user.id}/chapters/${Date.now()}-${chapter.file.name}`;
            mediaUrl = await uploadFile.mutateAsync({ file: chapter.file, path: mediaPath });
          }
          
          await updateChapter.mutateAsync({
            id: chapter.id,
            narrative_text: chapter.narrativeText || null,
            media_url: mediaUrl || undefined,
            order_index: chapter.orderIndex,
          });
        }
      }

      toast({ title: "História atualizada com sucesso!" });
      navigate("/admin/stories");
    } catch (error) {
      toast({ 
        title: "Erro ao atualizar história", 
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await deleteStory.mutateAsync(id);
      toast({ title: "História excluída" });
      navigate("/admin/stories");
    } catch (error) {
      toast({ title: "Erro ao excluir história", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">História não encontrada</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/admin/stories")}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/stories")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar História</h1>
            <p className="text-muted-foreground mt-1">Atualize sua narrativa visual</p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass border-luma-glass-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir história?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Todos os capítulos serão excluídos permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Informações Básicas</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Label htmlFor="carousel" className="text-sm flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Mostrar no Chat
                </Label>
                <Switch 
                  id="carousel" 
                  checked={showInCarousel} 
                  onCheckedChange={setShowInCarousel}
                />
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="published" className="text-sm">Publicado</Label>
                <Switch 
                  id="published" 
                  checked={isPublished} 
                  onCheckedChange={setIsPublished}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título da História</Label>
              <Input
                id="title"
                placeholder="Ex: O Primeiro Dia do Theo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

          </div>

          {/* Category Selector - Hierarchical */}
          <CategorySelector
            value={categoryId}
            onChange={setCategoryId}
            required
          />

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <div className="flex items-center gap-4">
              {coverPreview ? (
                <div className="relative w-32 h-40 rounded-xl overflow-hidden border border-luma-glass-border">
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="h-6 w-6 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-40 rounded-xl border-2 border-dashed border-luma-glass-border hover:border-primary/50 cursor-pointer transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </label>
              )}
            </div>
          </div>
        </motion.div>

        {/* Chapters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-luma-glass-border space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Capítulos da Narrativa</h2>
              <p className="text-xs text-muted-foreground">
                {chapters.length} / {quotas.photosPerStory} capítulos
                {!quotas.canUploadVideo && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <Film className="h-3 w-3" />
                    Vídeo disponível no Ultra
                  </span>
                )}
              </p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addChapterDraft}
              disabled={!canAddMoreChapters}
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar
            </Button>
          </div>

          <div className="space-y-4">
            {chapters.map((chapter, index) => (
              <div key={chapter.id} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-luma-glass-border">
                <div className="flex items-center text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>
                
                <div className="flex-shrink-0">
                  {chapter.previewUrl ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <img src={chapter.previewUrl} alt="" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="h-5 w-5 text-white" />
                        <input 
                          type="file" 
                          accept="image/*,video/*" 
                          className="hidden" 
                          onChange={(e) => handleChapterFileChange(chapter.id, e)} 
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="relative flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 border-dashed border-luma-glass-border hover:border-primary/50 cursor-pointer transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <input 
                        type="file" 
                        accept={quotas.canUploadVideo ? "image/*,video/*" : "image/*"}
                        className="hidden" 
                        onChange={(e) => handleChapterFileChange(chapter.id, e)} 
                      />
                      {!quotas.canUploadVideo && (
                        <div className="absolute -top-1 -right-1">
                          <Badge className="text-[8px] px-1 py-0 bg-violet-500/20 text-violet-400 border-violet-500/30">
                            <Crown className="h-2 w-2" />
                          </Badge>
                        </div>
                      )}
                    </label>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Capítulo {index + 1}</Label>
                    {chapters.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon-sm"
                        onClick={() => removeChapterDraft(chapter.id, chapter.isNew)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Texto narrativo que a Luma vai apresentar..."
                    value={chapter.narrativeText}
                    onChange={(e) => updateChapterText(chapter.id, e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/admin/stories")}
          >
            Cancelar
          </Button>
        </motion.div>
      </form>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModal.isOpen}
        onOpenChange={upgradeModal.setOpen}
        feature={upgradeModal.feature}
        requiredPlan={upgradeModal.requiredPlan}
        customTitle={upgradeModal.customTitle}
        customDescription={upgradeModal.customDescription}
        currentPlan={profile?.plan}
      />
    </div>
  );
}
