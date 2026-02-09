/**
 * Video utilities for parsing and embedding video URLs
 */

export type VideoProvider = 'youtube' | 'vimeo' | 'wistia' | null;

/**
 * Identify the video provider from a URL
 */
export function getVideoProvider(url: string): VideoProvider {
  if (!url) return null;
  
  const urlLower = url.toLowerCase();
  
  // YouTube patterns
  if (
    urlLower.includes('youtube.com') || 
    urlLower.includes('youtu.be') ||
    urlLower.includes('youtube-nocookie.com')
  ) {
    return 'youtube';
  }
  
  // Vimeo patterns
  if (urlLower.includes('vimeo.com')) {
    return 'vimeo';
  }
  
  // Wistia patterns
  if (urlLower.includes('wistia.com') || urlLower.includes('wi.st')) {
    return 'wistia';
  }
  
  return null;
}

/**
 * Extract video ID from various URL formats
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null;
  
  const provider = getVideoProvider(url);
  
  try {
    switch (provider) {
      case 'youtube': {
        // Handle: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
        let videoId = null;
        
        // youtu.be/ID format
        if (url.includes('youtu.be/')) {
          const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
          videoId = match?.[1] || null;
        }
        // youtube.com/shorts/ID format
        else if (url.includes('/shorts/')) {
          const match = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
          videoId = match?.[1] || null;
        }
        // youtube.com/embed/ID format
        else if (url.includes('/embed/')) {
          const match = url.match(/\/embed\/([a-zA-Z0-9_-]+)/);
          videoId = match?.[1] || null;
        }
        // youtube.com/watch?v=ID format
        else {
          const urlObj = new URL(url);
          videoId = urlObj.searchParams.get('v');
        }
        
        return videoId;
      }
      
      case 'vimeo': {
        // Handle: vimeo.com/ID, player.vimeo.com/video/ID
        const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        return match?.[1] || null;
      }
      
      case 'wistia': {
        // Handle: wistia.com/medias/ID, wi.st/medias/ID
        const match = url.match(/(?:wistia\.com|wi\.st)\/(?:medias|embed)\/([a-zA-Z0-9]+)/);
        return match?.[1] || null;
      }
      
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * Convert a video URL to an embeddable URL
 * @param url - The original video URL
 * @returns The embed URL or null if invalid
 */
export function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  const provider = getVideoProvider(url);
  const videoId = extractVideoId(url);
  
  if (!videoId) return null;
  
  switch (provider) {
    case 'youtube':
      // Use youtube-nocookie for privacy with autoplay params for cinematic hero
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
    
    case 'vimeo':
      // Background mode for cinematic autoplay
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&title=0&byline=0&portrait=0`;
    
    case 'wistia':
      return `https://fast.wistia.net/embed/iframe/${videoId}?autoPlay=true&silentAutoPlay=true&controlsVisibleOnLoad=false`;
    
    default:
      return null;
  }
}

/**
 * Get the thumbnail URL for a video
 * @param url - The original video URL
 * @returns The thumbnail URL or null if not available
 */
export function getVideoThumbnailUrl(url: string): string | null {
  if (!url) return null;
  
  const provider = getVideoProvider(url);
  const videoId = extractVideoId(url);
  
  if (!videoId) return null;
  
  switch (provider) {
    case 'youtube':
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    case 'vimeo':
      // Vimeo requires API call for thumbnails, return null for now
      return null;
    
    case 'wistia':
      // Wistia requires API call for thumbnails, return null for now
      return null;
    
    default:
      return null;
  }
}

/**
 * Validate if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false;
  return getVideoProvider(url) !== null && extractVideoId(url) !== null;
}
