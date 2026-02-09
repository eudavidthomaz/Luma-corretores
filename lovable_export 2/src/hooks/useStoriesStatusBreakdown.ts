import { useMemo } from "react";
import { Tables } from "@/integrations/supabase/types";

type Story = Tables<"stories">;

export interface StoriesStatusBreakdown {
  draft: number;
  published: number;
  inCarousel: number;
}

export function useStoriesStatusBreakdown(stories: Story[] | undefined): StoriesStatusBreakdown {
  return useMemo(() => {
    if (!stories) return { draft: 0, published: 0, inCarousel: 0 };

    return {
      draft: stories.filter((s) => !s.is_published).length,
      published: stories.filter((s) => s.is_published).length,
      inCarousel: stories.filter((s) => s.is_published && s.show_in_carousel).length,
    };
  }, [stories]);
}
