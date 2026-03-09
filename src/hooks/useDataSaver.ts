import { useState, useEffect, useCallback } from 'react';

export const useDataSaver = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<'original' | '720p' | '480p' | '360p'>('720p');

  useEffect(() => {
    const saved = localStorage.getItem('dataSaverMode') === 'true';
    const savedQuality = (localStorage.getItem('videoQuality') || '720p') as any;
    setIsEnabled(saved);
    setSelectedQuality(savedQuality);
  }, []);

  const toggleDataSaver = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem('dataSaverMode', enabled ? 'true' : 'false');
    if (enabled) {
      setSelectedQuality('480p');
      localStorage.setItem('videoQuality', '480p');
    } else {
      setSelectedQuality('720p');
      localStorage.setItem('videoQuality', '720p');
    }
  }, []);

  const setQuality = useCallback((quality: 'original' | '720p' | '480p' | '360p') => {
    setSelectedQuality(quality);
    localStorage.setItem('videoQuality', quality);
  }, []);

  return {
    isEnabled,
    quality: selectedQuality,
    toggleDataSaver,
    setQuality,
  };
};
