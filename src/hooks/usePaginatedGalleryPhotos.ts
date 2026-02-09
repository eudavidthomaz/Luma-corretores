import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPublicThumbnailUrl } from "@/lib/galleryStorage";

interface GalleryPhoto {
  id: string;
  src: string;
  thumbnailSrc?: string;
  originalPath: string;
  width: number;
  height: number;
  alt?: string;
}

interface UsePaginatedGalleryPhotosOptions {
  galleryId: string;
  pageSize?: number;
}

interface UsePaginatedGalleryPhotosReturn {
  photos: GalleryPhoto[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => Promise<void>;
  reset: () => void;
}

// Optimized thumbnail size for grid display (reduces bandwidth ~80%)
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_QUALITY = 60;

export function usePaginatedGalleryPhotos({
  galleryId,
  pageSize = 20,
}: UsePaginatedGalleryPhotosOptions): UsePaginatedGalleryPhotosReturn {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const fetchPhotos = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      if (!galleryId) return;
      
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const start = pageNum * pageSize;
        const end = start + pageSize - 1;

        // Fetch photos with pagination using .range()
        const { data: photosData, error, count } = await supabase
          .from("gallery_photos")
          .select("*", { count: "exact" })
          .eq("gallery_id", galleryId)
          .order("order_index", { ascending: true })
          .range(start, end);

        if (error) throw error;

        // Transform to optimized photo objects with smaller thumbnails
        const newPhotos: GalleryPhoto[] = (photosData || []).map((p) => {
          const thumbnailPath = p.thumbnail_url || p.file_path;
          // Use optimized thumbnail URL with resize parameters
          const publicSrc = getPublicThumbnailUrl(thumbnailPath, {
            width: THUMBNAIL_WIDTH,
            quality: THUMBNAIL_QUALITY,
          });

          return {
            id: p.id,
            src: publicSrc,
            thumbnailSrc: publicSrc,
            originalPath: p.file_path,
            width: p.width || 800,
            height: p.height || 600,
            alt: p.filename,
          };
        });

        if (isInitial) {
          setPhotos(newPhotos);
        } else {
          setPhotos((prev) => [...prev, ...newPhotos]);
        }

        // Update total count and hasMore flag
        if (count !== null) {
          setTotalCount(count);
          setHasMore(start + newPhotos.length < count);
        } else {
          setHasMore(newPhotos.length === pageSize);
        }
      } catch (error) {
        console.error("Error fetching gallery photos:", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [galleryId, pageSize]
  );

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPhotos(nextPage);
  }, [page, isLoadingMore, hasMore, fetchPhotos]);

  const reset = useCallback(() => {
    setPhotos([]);
    setPage(0);
    setHasMore(true);
    setTotalCount(0);
    fetchPhotos(0, true);
  }, [fetchPhotos]);

  // Initial load when galleryId changes
  useEffect(() => {
    if (galleryId) {
      setPhotos([]);
      setPage(0);
      setHasMore(true);
      setTotalCount(0);
      fetchPhotos(0, true);
    }
  }, [galleryId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    photos,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    loadMore,
    reset,
  };
}
