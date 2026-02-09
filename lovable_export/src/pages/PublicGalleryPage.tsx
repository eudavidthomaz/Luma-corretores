import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePublicGallery, useValidateGalleryPassword } from "@/hooks/usePublicGallery";
import { useGalleryFavorites } from "@/hooks/useGalleryFavorites";
import { usePaginatedGalleryPhotos } from "@/hooks/usePaginatedGalleryPhotos";
import {
  GalleryThemeProvider,
  GalleryHero,
  GalleryAccessForm,
  GalleryMasonryGrid,
  GalleryPhotoLightbox,
  GalleryDownloadBar,
  GalleryExpiredState,
  GalleryLoadingSkeleton,
  GalleryFooter,
} from "@/components/gallery-public";
import { supabase } from "@/integrations/supabase/client";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { getSignedUrlForDownload, getSignedUrlsForDownload } from "@/lib/galleryStorage";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// OTIMIZAÇÃO: Track analytics via RPC direto (GRÁTIS vs Edge Function)
// Com debounce por sessão para evitar views duplicadas
async function trackGalleryAnalytics(galleryId: string, action: "view" | "download") {
  // Debounce: só registra 1 view/download por sessão
  const sessionKey = `gallery_${action}_${galleryId}`;
  if (sessionStorage.getItem(sessionKey)) {
    return; // Já contou nesta sessão
  }
  
  try {
    await supabase.rpc('increment_gallery_counter', {
      p_gallery_id: galleryId,
      p_counter_type: action
    });
    
    sessionStorage.setItem(sessionKey, 'true');
  } catch (error) {
    console.error("Failed to track analytics:", error);
  }
}

interface Photo {
  id: string;
  src: string;
  originalPath: string;
  width: number;
  height: number;
  alt?: string;
}

export default function PublicGalleryPage() {
  const { profileSlug, gallerySlug } = useParams<{
    profileSlug: string;
    gallerySlug: string;
  }>();

  const { data, isLoading, error } = usePublicGallery(
    profileSlug || "",
    gallerySlug || ""
  );

  const validatePassword = useValidateGalleryPassword();
  const [unlockedPhotos, setUnlockedPhotos] = useState<Photo[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Paginated photos hook - only active when gallery is unlocked
  const {
    photos: paginatedPhotos,
    isLoadingMore,
    hasMore,
    totalCount,
    loadMore,
  } = usePaginatedGalleryPhotos({
    galleryId: data?.gallery.id || "",
    pageSize: 20,
  });

  // Use paginated photos when available, fallback to initial data
  const photos = unlockedPhotos || (paginatedPhotos.length > 0 ? paginatedPhotos : data?.photos) || [];
  const isUnlocked = !data?.gallery.hasPassword || unlockedPhotos !== null;

  // Favorites hook
  const { favorites, favoritesCount, toggleFavorite, isFavorite } = useGalleryFavorites(
    isUnlocked ? data?.gallery.id : undefined
  );

  // Track view when gallery is loaded and unlocked
  useEffect(() => {
    if (data?.gallery.id && isUnlocked && data.gallery.status !== "expired") {
      trackGalleryAnalytics(data.gallery.id, "view");
    }
  }, [data?.gallery.id, isUnlocked, data?.gallery.status]);

  const handlePasswordSubmit = useCallback(
    async (password: string): Promise<boolean> => {
      if (!data?.gallery.id) return false;
      try {
        const photos = await validatePassword(data.gallery.id, password);
        setUnlockedPhotos(photos);
        return true;
      } catch {
        return false;
      }
    },
    [data?.gallery.id, validatePassword]
  );

  const scrollToGallery = useCallback(() => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleDownloadSingle = useCallback(async (photo: Photo) => {
    if (data?.gallery.id) {
      trackGalleryAnalytics(data.gallery.id, "download");
    }
    try {
      // Generate signed URL for original file (ONLY for downloads!)
      const signedUrl = await getSignedUrlForDownload(photo.originalPath);
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      const filename = photo.alt || `foto-${photo.id}.jpg`;
      saveAs(blob, filename);
    } catch (err) {
      console.error("Failed to download photo:", err);
    }
  }, [data?.gallery.id]);

  const handleDownloadAll = useCallback(async () => {
    if (photos.length === 0) return;

    // Track download analytics
    if (data?.gallery.id) {
      trackGalleryAnalytics(data.gallery.id, "download");
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Generate all signed URLs at once (ONLY for downloads!)
      const paths = photos.map((p) => p.originalPath);
      const signedUrls = await getSignedUrlsForDownload(paths);

      const zip = new JSZip();
      const folder = zip.folder(data?.gallery.title || "fotos");

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const signedUrl = signedUrls.get(photo.originalPath);
        if (!signedUrl) continue;

        try {
          const response = await fetch(signedUrl);
          const blob = await response.blob();
          const ext = photo.alt?.split(".").pop() || "jpg";
          folder?.file(`foto-${String(i + 1).padStart(3, "0")}.${ext}`, blob);
          setDownloadProgress(Math.round(((i + 1) / photos.length) * 100));
        } catch (err) {
          console.error("Failed to download photo:", err);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${data?.gallery.title || "galeria"}.zip`);
    } catch (err) {
      console.error("Failed to download all photos:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [photos, data?.gallery.id, data?.gallery.title]);

  const handleDownloadFavorites = useCallback(async () => {
    const favoritePhotos = photos.filter((p) => favorites.has(p.id));
    if (favoritePhotos.length === 0) return;

    // Track download analytics
    if (data?.gallery.id) {
      trackGalleryAnalytics(data.gallery.id, "download");
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Generate all signed URLs at once (ONLY for downloads!)
      const paths = favoritePhotos.map((p) => p.originalPath);
      const signedUrls = await getSignedUrlsForDownload(paths);

      const zip = new JSZip();
      const folder = zip.folder(`${data?.gallery.title || "fotos"}-favoritas`);

      for (let i = 0; i < favoritePhotos.length; i++) {
        const photo = favoritePhotos[i];
        const signedUrl = signedUrls.get(photo.originalPath);
        if (!signedUrl) continue;

        try {
          const response = await fetch(signedUrl);
          const blob = await response.blob();
          const ext = photo.alt?.split(".").pop() || "jpg";
          folder?.file(`favorita-${String(i + 1).padStart(3, "0")}.${ext}`, blob);
          setDownloadProgress(Math.round(((i + 1) / favoritePhotos.length) * 100));
        } catch (err) {
          console.error("Failed to download photo:", err);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${data?.gallery.title || "galeria"}-favoritas.zip`);
    } catch (err) {
      console.error("Failed to download favorites:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [photos, favorites, data?.gallery.id, data?.gallery.title]);

  if (isLoading) {
    return (
      <GalleryThemeProvider>
        <GalleryLoadingSkeleton />
      </GalleryThemeProvider>
    );
  }

  if (error || !data) {
    return (
      <GalleryThemeProvider>
        <div className="min-h-screen flex items-center justify-center">
          <p className="font-body text-gallery-text-muted">
            Galeria não encontrada
          </p>
        </div>
      </GalleryThemeProvider>
    );
  }

  if (data.gallery.status === "expired") {
    return (
      <GalleryThemeProvider>
        <GalleryExpiredState photographerName={data.profile.businessName} />
      </GalleryThemeProvider>
    );
  }

  if (data.gallery.hasPassword && !isUnlocked) {
    return (
      <GalleryThemeProvider>
        <GalleryAccessForm
          galleryTitle={data.gallery.title}
          onSubmit={handlePasswordSubmit}
        />
      </GalleryThemeProvider>
    );
  }

  return (
    <GalleryThemeProvider>
      <GalleryHero
        title={data.gallery.title}
        description={data.gallery.description}
        eventDate={data.gallery.eventDate}
        coverUrl={data.gallery.coverUrl}
        expiresAt={data.gallery.expiresAt}
        photosCount={photos.length}
        onScrollToGallery={scrollToGallery}
      />

      <div ref={galleryRef} className="py-12 md:py-16">
        <GalleryMasonryGrid
          photos={photos}
          onPhotoClick={(index) => setLightboxIndex(index)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
        
        {/* Load More Button - Pagination */}
        {hasMore && photos.length > 0 && (
          <div className="flex justify-center mt-10">
            <Button
              variant="outline"
              size="lg"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="min-w-[200px] border-champagne-gold/30 text-charcoal-ink 
                         hover:bg-champagne-gold/10 hover:border-champagne-gold/50
                         transition-all duration-300"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>Carregar Mais ({totalCount - photos.length} restantes)</>
              )}
            </Button>
          </div>
        )}
      </div>

      <GalleryFooter photographerName={data.profile.businessName} />

      <GalleryDownloadBar
        photosCount={photos.length}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        onDownloadAll={handleDownloadAll}
        onDownloadFavorites={handleDownloadFavorites}
        favoritesCount={favoritesCount}
      />

      <GalleryPhotoLightbox
        photos={photos}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        onDownload={handleDownloadSingle}
        isFavorite={lightboxIndex !== null ? isFavorite(photos[lightboxIndex]?.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </GalleryThemeProvider>
  );
}
