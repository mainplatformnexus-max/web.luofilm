import React, { useEffect, useRef, useState } from 'react';
import { videoCacheService } from '@/lib/videoCacheService';
import { videoExportService } from '@/lib/videoExport';
import { Wifi, AlertCircle, Download } from 'lucide-react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import Hls from 'hls.js';

interface OfflineVideoPlayerComponentProps {
  videoId: string;
  onlineUrl?: string;
  posterUrl?: string;
  title?: string;
  onOfflineDetected?: (isOffline: boolean) => void;
}

const OfflineVideoPlayerComponent: React.FC<OfflineVideoPlayerComponentProps> = ({
  videoId,
  onlineUrl,
  posterUrl,
  title,
  onOfflineDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportBtn, setShowExportBtn] = useState(false);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        // Try to load cached video first
        const cachedVideo = await videoCacheService.getVideo(videoId);
        
        if (cachedVideo?.status === 'completed') {
          setIsCached(true);
          setIsOffline(true);
          setError(null);
          onOfflineDetected?.(true);
          return;
        }

        // Fall back to online URL
        if (onlineUrl) {
          setIsCached(false);
          setIsOffline(false);
          onOfflineDetected?.(false);
        } else {
          setError('No cached video or online URL available');
        }
      } catch (err) {
        console.error('Error checking cached video:', err);
        if (onlineUrl) {
          setIsOffline(false);
          onOfflineDetected?.(false);
        }
      }
    };

    loadVideo();
  }, [videoId, onlineUrl, onOfflineDetected]);

  useEffect(() => {
    if (!videoRef.current) return;

    const setupPlayer = async () => {
      const video = videoRef.current!;

      // Determine which URL to use
      let videoUrl = onlineUrl || '';
      
      if (isCached) {
        try {
          videoUrl = await videoCacheService.createBlobUrl(videoId);
        } catch (err) {
          console.error('Failed to create blob URL:', err);
          setError('Failed to load cached video');
          return;
        }
      }

      if (!videoUrl) return;

      const isHls = videoUrl.includes('.m3u8');

      // Default options
      const options: Plyr.Options = {
        title: title || 'Video Player',
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen',
        ],
        settings: ['quality', 'speed'],
        ratio: '16:9',
      };

      // Cleanup previous player and HLS instance
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      if (isHls) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const levels = hls.levels;
            if (levels && levels.length > 0) {
              const qualities = levels.map((l) => l.height);
              options.quality = {
                default: qualities[0],
                options: qualities,
                forced: true,
                onChange: (newQuality: number) => {
                  hls.levels.forEach((level, levelIndex) => {
                    if (level.height === newQuality) {
                      hls.currentLevel = levelIndex;
                    }
                  });
                },
              };
              const player = new Plyr(video, options);
              playerRef.current = player;
            }
          });
        } else {
          video.src = videoUrl;
          const player = new Plyr(video, options);
          playerRef.current = player;
        }
      } else {
        video.src = videoUrl;
        const player = new Plyr(video, options);
        playerRef.current = player;
      }
    };

    setupPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [isCached, videoId, onlineUrl]);

  if (error) {
    return (
      <div className="relative w-full bg-black" style={{ aspectRatio: '16/9' }}>
        <div className="w-full h-full flex flex-col items-center justify-center text-red-500 gap-2">
          <AlertCircle className="w-10 h-10" />
          <p className="text-sm text-center px-4">{error}</p>
        </div>
      </div>
    );
  }

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = videoExportService.sanitizeFilename(title || 'video');
      await videoExportService.exportVideo(videoId, filename);
      alert('Video exported successfully!');
    } catch (err) {
      alert('Failed to export video: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <video 
        ref={videoRef} 
        controls 
        style={{ width: '100%' }} 
        poster={posterUrl}
        onMouseEnter={() => isCached && setShowExportBtn(true)}
        onMouseLeave={() => setShowExportBtn(false)}
      />
      {isOffline && (
        <div className="absolute top-4 right-4 bg-orange-500/90 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium z-50">
          <Wifi className="w-4 h-4 opacity-60" />
          Playing Offline
        </div>
      )}
      {isCached && showExportBtn && (
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="absolute top-4 left-4 bg-blue-500/90 hover:bg-blue-600/90 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium z-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      )}
    </div>
  );
};

export default OfflineVideoPlayerComponent;
