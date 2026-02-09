import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPublicCoverUrlHQ, getPublicThumbnailUrl } from "@/lib/galleryStorage";

interface GalleryPhoto {
  id: string;
  src: string; // Public thumbnail URL (FREE)
  thumbnailSrc?: string; // Same as src for blur placeholder
  originalPath: string; // Path to original in private bucket (for downloads)
  width: number;
  height: number;
  alt?: string;
}

interface PublicGalleryData {
  gallery: {
    id: string;
    title: string;
    description: string | null;
    eventDate: string | null;
    coverUrl: string | null;
    expiresAt: string;
    hasPassword: boolean;
    status: "active" | "expired";
    photosCount: number;
  };
  profile: {
    businessName: string;
    slug: string;
  };
  photos: GalleryPhoto[];
}

export function usePublicGallery(profileSlug: string, gallerySlug: string) {
  return useQuery({
    queryKey: ["public-gallery", profileSlug, gallerySlug],
    queryFn: async (): Promise<PublicGalleryData> => {
      // Get profile by slug
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, business_name, slug")
        .eq("slug", profileSlug)
        .single();

      if (profileError || !profile) {
        throw new Error("Fotógrafo não encontrado");
      }

      // Get gallery by slug and profile_id
      const { data: gallery, error: galleryError } = await supabase
        .from("galleries")
        .select("*")
        .eq("profile_id", profile.id)
        .eq("slug", gallerySlug)
        .single();

      if (galleryError || !gallery) {
        throw new Error("Galeria não encontrada");
      }

      // Check expiration
      const isExpired = new Date(gallery.expires_at) < new Date();

      // Get cover URL in HIGH QUALITY for hero display
      const coverUrl = getPublicCoverUrlHQ(gallery.cover_url);

      // Get INITIAL photos if no password (paginated - first 20 only)
      // Further photos are loaded via usePaginatedGalleryPhotos hook
      let photos: GalleryPhoto[] = [];
      if (!gallery.access_password && !isExpired) {
        const { data: photosData } = await supabase
          .from("gallery_photos")
          .select("*")
          .eq("gallery_id", gallery.id)
          .order("order_index", { ascending: true })
          .range(0, 19); // PAGINATION: Load only first 20 photos initially

        // Use PUBLIC thumbnail URLs with optimization - NO EDGE FUNCTION!
        photos = (photosData || []).map((p) => {
          // thumbnail_url contains the path in gallery-thumbnails bucket
          const thumbnailPath = p.thumbnail_url || p.file_path;
          // Optimized thumbnail: 400px width, 60% quality (~30KB vs ~500KB)
          const publicSrc = getPublicThumbnailUrl(thumbnailPath, {
            width: 400,
            quality: 60,
          });
          
          return {
            id: p.id,
            src: publicSrc,
            thumbnailSrc: publicSrc, // For blur placeholder
            originalPath: p.file_path, // Keep original path for downloads (private bucket)
            width: p.width || 800,
            height: p.height || 600,
            alt: p.filename,
          };
        });
      }

      return {
        gallery: {
          id: gallery.id,
          title: gallery.title,
          description: gallery.description,
          eventDate: gallery.event_date,
          coverUrl: coverUrl,
          expiresAt: gallery.expires_at,
          hasPassword: !!gallery.access_password,
          status: isExpired ? "expired" : "active",
          photosCount: gallery.photos_count || 0,
        },
        profile: {
          businessName: profile.business_name,
          slug: profile.slug || "",
        },
        photos,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useValidateGalleryPassword() {
  return async (galleryId: string, password: string): Promise<GalleryPhoto[]> => {
    const { data: gallery } = await supabase
      .from("galleries")
      .select("access_password")
      .eq("id", galleryId)
      .single();

    if (!gallery || gallery.access_password !== password) {
      throw new Error("Senha incorreta");
    }

    const { data: photos } = await supabase
      .from("gallery_photos")
      .select("*")
      .eq("gallery_id", galleryId)
      .order("order_index", { ascending: true });

    // Use PUBLIC thumbnail URLs with optimization - NO EDGE FUNCTION!
    return (photos || []).map((p) => {
      const thumbnailPath = p.thumbnail_url || p.file_path;
      const publicSrc = getPublicThumbnailUrl(thumbnailPath, {
        width: 400,
        quality: 60,
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
  };
}
