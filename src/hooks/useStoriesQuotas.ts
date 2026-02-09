import { useAuth } from "@/contexts/AuthContext";
import { useStories } from "@/hooks/useStories";
import { getPlanLimit, canCreateStory } from "@/lib/planLimits";

export interface StoriesQuotaInfo {
  // Plan info
  plan: string;
  
  // Stories
  storiesUsed: number;
  storiesLimit: number;
  canCreate: boolean;
  
  // Chapters per story
  photosPerStory: number;
  canUploadVideo: boolean;
  
  // Access
  hasStoriesAccess: boolean;
  
  // Percentage
  storiesPercentage: number;
  
  // Loading state
  isLoading: boolean;
}

export function useStoriesQuotas(): StoriesQuotaInfo {
  const { user, profile } = useAuth();
  const { data: stories, isLoading } = useStories(user?.id);

  const plan = profile?.plan || "trial";
  const limits = getPlanLimit(plan);
  const storiesUsed = stories?.length || 0;

  const storiesPercentage = limits.stories > 0 
    ? Math.min(100, (storiesUsed / limits.stories) * 100) 
    : 0;

  return {
    plan,
    storiesUsed,
    storiesLimit: limits.stories,
    canCreate: canCreateStory(plan, storiesUsed),
    photosPerStory: limits.photosPerStory,
    canUploadVideo: limits.video,
    hasStoriesAccess: limits.stories > 0,
    storiesPercentage,
    isLoading,
  };
}

/**
 * Hook to check if user can add more chapters to a story
 */
export function useChapterQuotaCheck() {
  const quotas = useStoriesQuotas();

  const canAddChapter = (currentChapterCount: number): boolean => {
    return currentChapterCount < quotas.photosPerStory;
  };

  const getRemainingChapters = (currentChapterCount: number): number => {
    return Math.max(0, quotas.photosPerStory - currentChapterCount);
  };

  return {
    ...quotas,
    canAddChapter,
    getRemainingChapters,
  };
}
