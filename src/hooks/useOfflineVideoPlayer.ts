import { useState, useEffect, useCallback } from 'react';
import { videoCacheService } from '@/lib/videoCacheService';

interface OfflineVideoState {
  videoUrl: string | null;
  isOffline: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useOfflineVideoPlayer = (videoId: string, onlineUrl?: string) => {
  const [state, setState] = useState<OfflineVideoState>({
    videoUrl: null,
    isOffline: false,
    isLoading: true,
    error: null,
  });

  const checkCachedVideo = useCallback(async () => {
    try {
      const cachedVideo = await videoCacheService.getVideo(videoId);

      if (cachedVideo && cachedVideo.status === 'completed') {
        const blobUrl = await videoCacheService.createBlobUrl(videoId);
        setState({
          videoUrl: blobUrl,
          isOffline: true,
          isLoading: false,
          error: null,
        });
        return;
      }

      if (onlineUrl) {
        setState({
          videoUrl: onlineUrl,
          isOffline: false,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          videoUrl: null,
          isOffline: false,
          isLoading: false,
          error: 'No cached video or online URL available',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load video';
      setState({
        videoUrl: onlineUrl || null,
        isOffline: false,
        isLoading: false,
        error: errorMessage,
      });
    }
  }, [videoId, onlineUrl]);

  useEffect(() => {
    checkCachedVideo();
  }, [checkCachedVideo]);

  return {
    ...state,
    refetch: checkCachedVideo,
  };
};
