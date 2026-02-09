import { useMemo } from "react";
import { Gallery, getDaysUntilExpiration } from "@/hooks/useGalleries";

export interface GalleryStatusBreakdown {
  draft: number;
  active: number;
  expiringSoon: number;
  expired: number;
  total: number;
}

export function useGalleryStatusBreakdown(galleries: Gallery[] | undefined): GalleryStatusBreakdown {
  return useMemo(() => {
    if (!galleries) {
      return { draft: 0, active: 0, expiringSoon: 0, expired: 0, total: 0 };
    }

    const breakdown = galleries.reduce(
      (acc, g) => {
        const daysLeft = getDaysUntilExpiration(g.expires_at);

        if (g.status === "expired" || daysLeft <= 0) {
          acc.expired++;
        } else if (g.status === "draft") {
          acc.draft++;
        } else if (daysLeft <= 3) {
          acc.expiringSoon++;
        } else {
          acc.active++;
        }

        return acc;
      },
      { draft: 0, active: 0, expiringSoon: 0, expired: 0 }
    );

    return {
      ...breakdown,
      total: galleries.length,
    };
  }, [galleries]);
}
