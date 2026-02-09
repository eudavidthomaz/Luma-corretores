import { supabase } from "@/integrations/supabase/client";

// ============================================
// GALLERY STORAGE UTILITIES
// ============================================
// 
// STRATEGY:
// - gallery-thumbnails (PUBLIC bucket): Use getPublicUrl() - FREE, no Edge Function
// - gallery-photos (PRIVATE bucket): Use signed URLs via Edge Function - for downloads only
//
// This prevents excessive Edge Function calls for preview images.
// ============================================

// In-memory cache for signed URLs (originals only)
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

// Cache duration: 50 minutes (URLs valid for 60 min, we refresh 10 min early)
const CACHE_DURATION_MS = 50 * 60 * 1000;

/**
 * Get PUBLIC URL for a thumbnail with optional size optimization
 * Use this for displaying images in grids, previews, etc.
 * 
 * @param path - Path to the thumbnail in gallery-thumbnails bucket
 * @param options - Optional resize parameters for Supabase Image Transformation
 */
export function getPublicThumbnailUrl(
  path: string, 
  options?: { width?: number; height?: number; quality?: number }
): string {
  // If already a full URL, return as-is
  if (path.startsWith("http")) {
    return path;
  }
  
  const { data } = supabase.storage
    .from("gallery-thumbnails")
    .getPublicUrl(path);
  
  let url = data.publicUrl;
  
  // Add Supabase Image Transformation parameters if provided
  // This reduces bandwidth by serving optimized images
  if (options) {
    const params = new URLSearchParams();
    if (options.width) params.set("width", options.width.toString());
    if (options.height) params.set("height", options.height.toString());
    if (options.quality) params.set("quality", options.quality.toString());
    params.set("resize", "cover");
    
    // Append render parameters to URL
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}${params.toString()}`;
  }
  
  return url;
}

/**
 * Get PUBLIC URL for gallery cover (uses thumbnails bucket)
 */
export function getPublicCoverUrl(coverPath: string | null): string | null {
  if (!coverPath) return null;
  
  // If already a full URL, return as-is
  if (coverPath.startsWith("http")) {
    return coverPath;
  }
  
  // Cover images are stored in gallery-thumbnails (public)
  const { data } = supabase.storage
    .from("gallery-thumbnails")
    .getPublicUrl(coverPath);
  
  return data.publicUrl;
}

/**
 * Get PUBLIC URL for gallery cover in HIGH QUALITY
 * Use this for hero sections where the cover is displayed fullscreen
 * 
 * @param coverPath - Path to the cover in gallery-thumbnails bucket
 */
export function getPublicCoverUrlHQ(coverPath: string | null): string | null {
  if (!coverPath) return null;
  
  // If already a full URL, add transformation params
  if (coverPath.startsWith("http")) {
    const url = new URL(coverPath);
    url.searchParams.set("width", "1920");
    url.searchParams.set("quality", "80");
    url.searchParams.set("resize", "contain");
    return url.toString();
  }
  
  // Cover images are stored in gallery-thumbnails (public)
  const { data } = supabase.storage
    .from("gallery-thumbnails")
    .getPublicUrl(coverPath);
  
  // Add Supabase Image Transformation for high quality hero display
  const params = new URLSearchParams();
  params.set("width", "1920");
  params.set("quality", "80");
  params.set("resize", "contain"); // Mantém proporção sem cortar
  
  return `${data.publicUrl}?${params.toString()}`;
}

/**
 * Fetch signed URLs from Edge Function (for ORIGINALS only)
 * This is expensive - only use for downloads!
 */
async function fetchSignedUrlsFromEdge(
  paths: string[]
): Promise<Array<{ path: string; signedUrl: string }>> {
  const { data, error } = await supabase.functions.invoke("gallery-signed-urls", {
    body: { paths },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error("Falha ao gerar URLs assinadas");
  }

  if (!data?.urls) {
    throw new Error("Resposta inválida do servidor");
  }

  return data.urls;
}

/**
 * Get signed URL for an ORIGINAL file (for download purposes only)
 * Uses Edge Function - only call this when user wants to download!
 */
export async function getSignedUrlForDownload(path: string): Promise<string> {
  // Check cache first
  const cached = signedUrlCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  // Call Edge Function to generate signed URL
  const urls = await fetchSignedUrlsFromEdge([path]);
  const signedUrl = urls[0]?.signedUrl;

  if (!signedUrl) {
    throw new Error("Não foi possível gerar URL de download");
  }

  // Store in cache
  signedUrlCache.set(path, {
    url: signedUrl,
    expiresAt: Date.now() + CACHE_DURATION_MS,
  });

  return signedUrl;
}

/**
 * Get signed URLs for multiple ORIGINAL files (batch download)
 * Uses Edge Function - only call this for bulk downloads!
 */
export async function getSignedUrlsForDownload(paths: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const pathsToFetch: string[] = [];

  // Check cache for each path
  for (const path of paths) {
    const cached = signedUrlCache.get(path);
    if (cached && cached.expiresAt > Date.now()) {
      result.set(path, cached.url);
    } else {
      pathsToFetch.push(path);
    }
  }

  // Fetch only uncached paths via Edge Function
  if (pathsToFetch.length > 0) {
    try {
      const urls = await fetchSignedUrlsFromEdge(pathsToFetch);

      for (const item of urls) {
        if (item.signedUrl && item.path) {
          signedUrlCache.set(item.path, {
            url: item.signedUrl,
            expiresAt: Date.now() + CACHE_DURATION_MS,
          });
          result.set(item.path, item.signedUrl);
        }
      }
    } catch (error) {
      console.error("Failed to get signed URLs:", error);
    }
  }

  return result;
}

/**
 * Clear the signed URL cache (useful when gallery changes)
 */
export function clearSignedUrlCache(): void {
  signedUrlCache.clear();
}

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================
// @deprecated Use getSignedUrlForDownload instead
export const getSignedUrl = getSignedUrlForDownload;
// @deprecated Use getSignedUrlsForDownload instead  
export const getSignedUrls = getSignedUrlsForDownload;
