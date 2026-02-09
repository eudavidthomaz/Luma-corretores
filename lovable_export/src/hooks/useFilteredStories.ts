import { useMemo } from "react";
import { Tables } from "@/integrations/supabase/types";

type Story = Tables<"stories">;

export interface StoriesFilters {
  search: string;
  status: "all" | "published" | "draft";
  category: string;
  sort: "newest" | "oldest" | "views" | "name";
}

export const defaultStoriesFilters: StoriesFilters = {
  search: "",
  status: "all",
  category: "all",
  sort: "newest",
};

export function useFilteredStories(
  stories: Story[] | undefined,
  filters: StoriesFilters
): Story[] {
  return useMemo(() => {
    if (!stories) return [];

    let result = [...stories];

    // Search
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter((s) => s.title.toLowerCase().includes(query));
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((s) =>
        filters.status === "published" ? s.is_published : !s.is_published
      );
    }

    // Category filter
    if (filters.category !== "all") {
      result = result.filter(
        (s) => s.category_id === filters.category || s.category === filters.category
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "views":
          return (b.views_count || 0) - (a.views_count || 0);
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [stories, filters]);
}
