import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generate a stable visitor hash for this browser session
function getVisitorHash(): string {
  const storageKey = "luma_visitor_hash";
  let hash = localStorage.getItem(storageKey);
  
  if (!hash) {
    hash = crypto.randomUUID();
    localStorage.setItem(storageKey, hash);
  }
  
  return hash;
}

export function useGalleryFavorites(galleryId: string | undefined) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const visitorHash = getVisitorHash();

  // Load favorites for this visitor
  useEffect(() => {
    if (!galleryId) return;

    async function loadFavorites() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from("gallery_favorites")
          .select("photo_id")
          .eq("gallery_id", galleryId)
          .eq("visitor_hash", visitorHash);

        if (data) {
          setFavorites(new Set(data.map((f) => f.photo_id)));
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFavorites();
  }, [galleryId, visitorHash]);

  const toggleFavorite = useCallback(
    async (photoId: string) => {
      if (!galleryId) return;

      const isFavorite = favorites.has(photoId);

      // Optimistic update
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFavorite) {
          next.delete(photoId);
        } else {
          next.add(photoId);
        }
        return next;
      });

      try {
        if (isFavorite) {
          // Remove favorite
          await supabase
            .from("gallery_favorites")
            .delete()
            .eq("photo_id", photoId)
            .eq("visitor_hash", visitorHash);
        } else {
          // Add favorite
          await supabase.from("gallery_favorites").insert({
            gallery_id: galleryId,
            photo_id: photoId,
            visitor_hash: visitorHash,
          });
        }
      } catch (error) {
        // Revert on error
        console.error("Failed to toggle favorite:", error);
        setFavorites((prev) => {
          const next = new Set(prev);
          if (isFavorite) {
            next.add(photoId);
          } else {
            next.delete(photoId);
          }
          return next;
        });
      }
    },
    [galleryId, favorites, visitorHash]
  );

  const isFavorite = useCallback(
    (photoId: string) => favorites.has(photoId),
    [favorites]
  );

  return {
    favorites,
    favoritesCount: favorites.size,
    isLoading,
    toggleFavorite,
    isFavorite,
  };
}

// Hook for photographers to see all favorites for a gallery
export function useGalleryFavoritesAdmin(galleryId: string | undefined) {
  const [favoritesByVisitor, setFavoritesByVisitor] = useState<
    Map<string, { photoIds: string[]; createdAt: string }>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!galleryId) return;

    async function loadAllFavorites() {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from("gallery_favorites")
          .select("photo_id, visitor_hash, created_at")
          .eq("gallery_id", galleryId)
          .order("created_at", { ascending: false });

        if (data) {
          const grouped = new Map<string, { photoIds: string[]; createdAt: string }>();
          
          for (const fav of data) {
            const existing = grouped.get(fav.visitor_hash);
            if (existing) {
              existing.photoIds.push(fav.photo_id);
            } else {
              grouped.set(fav.visitor_hash, {
                photoIds: [fav.photo_id],
                createdAt: fav.created_at,
              });
            }
          }
          
          setFavoritesByVisitor(grouped);
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllFavorites();
  }, [galleryId]);

  return {
    favoritesByVisitor,
    totalSelections: favoritesByVisitor.size,
    isLoading,
  };
}
