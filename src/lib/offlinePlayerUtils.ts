import { videoCacheService } from './videoCacheService';

interface PlaybackOptions {
  videoId: string;
  onlineUrl?: string;
  onOfflineDetected?: () => void;
  onOnlineDetected?: () => void;
}

/**
 * Get the appropriate video URL for playback
 * Checks for cached offline video first, then falls back to online URL
 */
export async function getPlaybackUrl(options: PlaybackOptions): Promise<{
  url: string | null;
  isOffline: boolean;
  isCached: boolean;
}> {
  const { videoId, onlineUrl } = options;

  try {
    const cachedVideo = await videoCacheService.getVideo(videoId);

    if (cachedVideo && cachedVideo.status === 'completed') {
      try {
        const blobUrl = await videoCacheService.createBlobUrl(videoId);
        return {
          url: blobUrl,
          isOffline: true,
          isCached: true,
        };
      } catch (error) {
        console.warn('Failed to create blob URL, falling back to online URL:', error);
      }
    }
  } catch (error) {
    console.warn('Failed to check cached video:', error);
  }

  return {
    url: onlineUrl || null,
    isOffline: false,
    isCached: false,
  };
}

/**
 * Cache a video for offline playback
 */
export async function cacheVideoForOffline(
  videoId: string,
  url: string,
  title: string,
  posterUrl?: string,
  type: 'movie' | 'series' | 'tv' | 'sport' = 'movie',
  quality?: 'original' | '720p' | '480p' | '360p',
  onProgress?: (progress: number, downloadedBytes?: number) => void
): Promise<void> {
  return videoCacheService.downloadVideo(
    videoId,
    url,
    title,
    posterUrl,
    type,
    quality,
    onProgress
  );
}

/**
 * Check if a video is cached and ready for offline playback
 */
export async function isCachedAndReady(videoId: string): Promise<boolean> {
  try {
    const cachedVideo = await videoCacheService.getVideo(videoId);
    return cachedVideo?.status === 'completed';
  } catch {
    return false;
  }
}

/**
 * Get cached video info
 */
export async function getCachedVideoInfo(videoId: string) {
  try {
    return await videoCacheService.getVideo(videoId);
  } catch {
    return null;
  }
}

/**
 * Remove offline cache for a video
 */
export async function removeOfflineCache(videoId: string): Promise<void> {
  return videoCacheService.deleteVideo(videoId);
}
