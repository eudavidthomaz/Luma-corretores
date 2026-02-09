/**
 * Client-side image processing utilities
 */

export type ImageOptimizationSize = 'thumb' | 'medium' | 'full';

/**
 * Get optimized portfolio/story image URL using Supabase Image Transformation
 * @param url - Original image URL from Supabase storage
 * @param size - Optimization level: 'thumb' (400px), 'medium' (1200px), 'full' (original)
 * @returns Optimized URL with transformation parameters
 */
export function getOptimizedPortfolioUrl(url: string | null | undefined, size: ImageOptimizationSize = 'medium'): string {
  if (!url) return '';
  
  // Don't transform non-Supabase URLs or already transformed URLs
  if (!url.includes('supabase') || url.includes('?')) return url;
  
  const params = new URLSearchParams();
  
  switch (size) {
    case 'thumb':
      params.set('width', '400');
      params.set('quality', '60');
      break;
    case 'medium':
      params.set('width', '1200');
      params.set('quality', '80');
      break;
    case 'full':
      // Return original without transformation
      return url;
  }
  
  params.set('resize', 'contain');
  return `${url}?${params.toString()}`;
}

export interface ProcessedImage {
  thumbnail: Blob;
  thumbnailUrl: string;
  width: number;
  height: number;
}

const THUMBNAIL_MAX_SIZE = 1200;
const WEB_MAX_SIZE = 1600;
const WEB_QUALITY = 0.85;

/**
 * Generate a thumbnail from an image file
 */
export async function generateThumbnail(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Calculate thumbnail dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > THUMBNAIL_MAX_SIZE) {
            height = Math.round((height * THUMBNAIL_MAX_SIZE) / width);
            width = THUMBNAIL_MAX_SIZE;
          }
        } else {
          if (height > THUMBNAIL_MAX_SIZE) {
            width = Math.round((width * THUMBNAIL_MAX_SIZE) / height);
            height = THUMBNAIL_MAX_SIZE;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create thumbnail blob"));
              return;
            }

            resolve({
              thumbnail: blob,
              thumbnailUrl: URL.createObjectURL(blob),
              width: img.width,
              height: img.height,
            });
          },
          "image/jpeg",
          0.8
        );
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

/**
 * Get image dimensions from a file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

/**
 * Optimize an image for web display (carousel, etc.)
 * Reduces size while maintaining good quality
 */
export async function optimizeForWeb(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Calculate new dimensions maintaining aspect ratio
        let newWidth = originalWidth;
        let newHeight = originalHeight;

        // Only resize if larger than max size
        if (originalWidth > WEB_MAX_SIZE || originalHeight > WEB_MAX_SIZE) {
          if (originalWidth > originalHeight) {
            if (originalWidth > WEB_MAX_SIZE) {
              newWidth = WEB_MAX_SIZE;
              newHeight = Math.round((originalHeight / originalWidth) * WEB_MAX_SIZE);
            }
          } else {
            if (originalHeight > WEB_MAX_SIZE) {
              newHeight = WEB_MAX_SIZE;
              newWidth = Math.round((originalWidth / originalHeight) * WEB_MAX_SIZE);
            }
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Could not create optimized blob"));
            }
          },
          "image/jpeg",
          WEB_QUALITY
        );
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}
