import { useState, useCallback } from 'react';
import { videoCacheService, type CachedVideo } from '@/lib/videoCacheService';

export const useVideoCache = () => {
  const [videos, setVideos] = useState<CachedVideo[]>([]);
  const [loading, setLoading] = useState(false);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const cached = await videoCacheService.getAllVideos();
      setVideos(cached);
    } catch (error) {
      console.error('Failed to load cached videos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadVideo = useCallback(
    async (
      videoId: string,
      url: string,
      title: string,
      posterUrl?: string,
      type: 'movie' | 'series' | 'tv' | 'sport' = 'movie',
      quality: 'original' | '720p' | '480p' | '360p' = '720p',
      onProgress?: (progress: number) => void
    ) => {
      try {
        await videoCacheService.downloadVideo(videoId, url, title, posterUrl, type, quality, onProgress);
        await loadVideos();
      } catch (error) {
        console.error('Download failed:', error);
        throw error;
      }
    },
    [loadVideos]
  );

  const deleteVideo = useCallback(async (videoId: string) => {
    try {
      await videoCacheService.deleteVideo(videoId);
      await loadVideos();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  }, [loadVideos]);

  const getCacheSize = useCallback(async () => {
    return videoCacheService.getCacheSize();
  }, []);

  return {
    videos,
    loading,
    loadVideos,
    downloadVideo,
    deleteVideo,
    getCacheSize,
  };
};
