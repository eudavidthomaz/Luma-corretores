import { useMemo } from "react";
import { Gallery, getDaysUntilExpiration } from "@/hooks/useGalleries";

export interface GalleryFilters {
  search: string;
  status: "all" | "draft" | "active" | "expiring" | "expired";
  sort: "newest" | "oldest" | "expiring" | "name";
}

export const defaultGalleryFilters: GalleryFilters = {
  search: "",
  status: "all",
  sort: "newest",
};

export function useFilteredGalleries(
  galleries: Gallery[] | undefined,
  filters: GalleryFilters
): Gallery[] {
  return useMemo(() => {
    if (!galleries) return [];

    let result = [...galleries];

    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query) ||
          g.slug.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((g) => {
        const daysLeft = getDaysUntilExpiration(g.expires_at);

        switch (filters.status) {
          case "expired":
            return g.status === "expired" || daysLeft <= 0;
          case "draft":
            return g.status === "draft";
          case "expiring":
            return g.status === "active" && daysLeft > 0 && daysLeft <= 3;
          case "active":
            return g.status === "active" && daysLeft > 3;
          default:
            return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sort) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "expiring":
          return getDaysUntilExpiration(a.expires_at) - getDaysUntilExpiration(b.expires_at);
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [galleries, filters]);
}
