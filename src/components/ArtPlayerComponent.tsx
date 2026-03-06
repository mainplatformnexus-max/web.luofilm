import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

interface PlyrPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

const ArtPlayerComponent: React.FC<PlyrPlayerProps> = ({ src, poster, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      playerRef.current = new Plyr(videoRef.current, {
        title: title || 'Video Player',
        controls: [
          'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
        ],
        settings: ['quality', 'speed'],
        quality: {
          default: 720,
          options: [1080, 720, 480, 360],
        },
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && src) {
      playerRef.current.source = {
        type: 'video',
        title: title || 'Video',
        sources: [
          {
            src: src,
            type: 'video/mp4',
          },
        ],
        poster: poster,
      };
    }
  }, [src, poster, title]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden rounded-lg">
      <video ref={videoRef} className="plyr-react plyr" playsInline />
    </div>
  );
};

export default ArtPlayerComponent;
