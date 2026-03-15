import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import Hls from 'hls.js';

interface ArtPlayerComponentProps {
  src: string;
  poster?: string;
  title?: string;
  onVideoPlay?: () => void;
}

const ArtPlayerComponent: React.FC<ArtPlayerComponentProps> = ({ src, poster, title, onVideoPlay }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hasCalledPlayCallback = useRef(false);

  // Trigger auto-cache on first play
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const handlePlay = () => {
      if (!hasCalledPlayCallback.current && onVideoPlay) {
        hasCalledPlayCallback.current = true;
        onVideoPlay();
      }
    };

    video.addEventListener('play', handlePlay, { once: true });
    return () => video.removeEventListener('play', handlePlay);
  }, [onVideoPlay]);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const isHls = src.includes('.m3u8');

    // Default options
    const options: Plyr.Options = {
      title: title || 'Video Player',
      controls: [
        'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
      ],
      settings: ['quality', 'speed'],
      ratio: '16:9',
    };

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels = hls.levels;
          if (levels && levels.length > 0) {
            const qualities = levels.map(l => l.height);
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
          }
          playerRef.current = new Plyr(video, options);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        playerRef.current = new Plyr(video, options);
      }
    } else {
      video.src = src;
      playerRef.current = new Plyr(video, options);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src, title]);

  return (
    <div className="w-full h-full bg-black overflow-hidden">
      <video
        ref={videoRef}
        className="plyr-react plyr w-full h-full"
        playsInline
        data-poster={poster}
      />
      <style>{`
        .plyr {
          width: 100%;
          height: 100%;
        }
        .plyr--video {
          width: 100%;
          height: 100%;
        }
        .plyr video {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .plyr__video-wrapper {
          width: 100%;
          height: 100%;
          aspect-ratio: unset;
        }
      `}</style>
    </div>
  );
};

export default ArtPlayerComponent;
