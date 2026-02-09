import { useState, useCallback } from "react";

export interface ChapterDraft {
  id: string;
  file: File | null;
  previewUrl: string | null;
  narrativeText: string;
}

export interface StoryDraft {
  title: string;
  categoryId: string;
  coverFile: File | null;
  coverPreview: string | null;
  chapters: ChapterDraft[];
  publishImmediately: boolean;
  showInCarousel: boolean;
}

const initialChapter: ChapterDraft = {
  id: crypto.randomUUID(),
  file: null,
  previewUrl: null,
  narrativeText: "",
};

const initialDraft: StoryDraft = {
  title: "",
  categoryId: "",
  coverFile: null,
  coverPreview: null,
  chapters: [initialChapter],
  publishImmediately: false,
  showInCarousel: true,
};

export function useStoryCreation(maxChapters: number = 10) {
  const [currentStep, setCurrentStep] = useState(1);
  const [draft, setDraft] = useState<StoryDraft>(initialDraft);

  // Step validation
  const canProceedToStep2 = Boolean(draft.title.trim() && draft.categoryId);
  const canProceedToStep3 = canProceedToStep2 && Boolean(draft.coverFile);
  const canProceedToStep4 = canProceedToStep3 && draft.chapters.some((c) => c.file);
  const canSubmit = canProceedToStep4;

  // Navigation
  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  }, []);

  // Draft updates
  const updateDraft = useCallback((updates: Partial<StoryDraft>) => {
    setDraft((d) => ({ ...d, ...updates }));
  }, []);

  // Cover management
  const setCover = useCallback((file: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setDraft((d) => ({
        ...d,
        coverFile: file,
        coverPreview: previewUrl,
      }));
    } else {
      setDraft((d) => ({
        ...d,
        coverFile: null,
        coverPreview: null,
      }));
    }
  }, []);

  // Chapter management
  const addChapter = useCallback(() => {
    setDraft((d) => {
      if (d.chapters.length >= maxChapters) return d;
      return {
        ...d,
        chapters: [
          ...d.chapters,
          {
            id: crypto.randomUUID(),
            file: null,
            previewUrl: null,
            narrativeText: "",
          },
        ],
      };
    });
  }, [maxChapters]);

  const removeChapter = useCallback((id: string) => {
    setDraft((d) => {
      if (d.chapters.length <= 1) return d;
      const chapter = d.chapters.find((c) => c.id === id);
      if (chapter?.previewUrl) {
        URL.revokeObjectURL(chapter.previewUrl);
      }
      return {
        ...d,
        chapters: d.chapters.filter((c) => c.id !== id),
      };
    });
  }, []);

  const updateChapter = useCallback(
    (id: string, updates: Partial<ChapterDraft>) => {
      setDraft((d) => ({
        ...d,
        chapters: d.chapters.map((c) => {
          if (c.id !== id) return c;

          // Handle file update with preview URL
          if (updates.file !== undefined) {
            if (c.previewUrl) {
              URL.revokeObjectURL(c.previewUrl);
            }
            const previewUrl = updates.file
              ? URL.createObjectURL(updates.file)
              : null;
            return { ...c, ...updates, previewUrl };
          }

          return { ...c, ...updates };
        }),
      }));
    },
    []
  );

  const reorderChapters = useCallback((fromIndex: number, toIndex: number) => {
    setDraft((d) => {
      const chapters = [...d.chapters];
      const [removed] = chapters.splice(fromIndex, 1);
      chapters.splice(toIndex, 0, removed);
      return { ...d, chapters };
    });
  }, []);

  // Reset
  const reset = useCallback(() => {
    // Cleanup preview URLs
    if (draft.coverPreview) {
      URL.revokeObjectURL(draft.coverPreview);
    }
    draft.chapters.forEach((c) => {
      if (c.previewUrl) {
        URL.revokeObjectURL(c.previewUrl);
      }
    });

    setCurrentStep(1);
    setDraft({
      ...initialDraft,
      chapters: [{ ...initialChapter, id: crypto.randomUUID() }],
    });
  }, [draft]);

  // Valid chapters count
  const validChaptersCount = draft.chapters.filter((c) => c.file).length;
  const canAddMoreChapters = draft.chapters.length < maxChapters;

  return {
    currentStep,
    draft,
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
    canSubmit,
    validChaptersCount,
    canAddMoreChapters,
    maxChapters,
    nextStep,
    prevStep,
    goToStep,
    updateDraft,
    setCover,
    addChapter,
    removeChapter,
    updateChapter,
    reorderChapters,
    reset,
  };
}
