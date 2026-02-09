import { useMemo } from "react";
import { Gallery } from "@/hooks/useGalleries";

export interface GalleryMetrics {
  totalViews: number;
  totalDownloads: number;
  totalPhotos: number;
  totalStorage: number;
  engagementRate: number;
}

export function useGalleryMetrics(galleries: Gallery[] | undefined): GalleryMetrics {
  return useMemo(() => {
    if (!galleries || galleries.length === 0) {
      return {
        totalViews: 0,
        totalDownloads: 0,
        totalPhotos: 0,
        totalStorage: 0,
        engagementRate: 0,
      };
    }

    const totals = galleries.reduce(
      (acc, g) => ({
        views: acc.views + (g.views_count || 0),
        downloads: acc.downloads + (g.downloads_count || 0),
        photos: acc.photos + (g.photos_count || 0),
        storage: acc.storage + (g.total_size_bytes || 0),
      }),
      { views: 0, downloads: 0, photos: 0, storage: 0 }
    );

    const engagementRate = totals.views > 0
      ? Math.round((totals.downloads / totals.views) * 100)
      : 0;

    return {
      totalViews: totals.views,
      totalDownloads: totals.downloads,
      totalPhotos: totals.photos,
      totalStorage: totals.storage,
      engagementRate,
    };
  }, [galleries]);
}
