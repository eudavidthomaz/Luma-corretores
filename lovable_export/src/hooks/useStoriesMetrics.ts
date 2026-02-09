import { useMemo } from "react";
import { Tables } from "@/integrations/supabase/types";

type Story = Tables<"stories">;

export interface StoriesMetrics {
  totalViews: number;
  publishedCount: number;
  draftCount: number;
  inCarouselCount: number;
}

export function useStoriesMetrics(stories: Story[] | undefined): StoriesMetrics {
  return useMemo(() => {
    if (!stories || stories.length === 0) {
      return {
        totalViews: 0,
        publishedCount: 0,
        draftCount: 0,
        inCarouselCount: 0,
      };
    }

    const published = stories.filter((s) => s.is_published);
    const draft = stories.filter((s) => !s.is_published);
    const inCarousel = stories.filter((s) => s.is_published && s.show_in_carousel);

    return {
      totalViews: stories.reduce((acc, s) => acc + (s.views_count || 0), 0),
      publishedCount: published.length,
      draftCount: draft.length,
      inCarouselCount: inCarousel.length,
    };
  }, [stories]);
}
