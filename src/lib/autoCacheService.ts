/**
 * Auto-cache service that automatically caches videos when played on WiFi
 */

import { videoCacheService } from './videoCacheService';
import { networkDetection } from './networkDetection';

interface AutoCacheConfig {
  enableAutoCacheOnWifi: boolean;
  maxConcurrentDownloads: number;
  quality: 'original' | '720p' | '480p' | '360p';
}

class AutoCacheService {
  private config: AutoCacheConfig = {
    enableAutoCacheOnWifi: true,
    maxConcurrentDownloads: 1,
    quality: '720p',
  };
  private activeDownloads: Set<string> = new Set();
  private networkUnsubscribe: (() => void) | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Subscribe to network changes
    this.networkUnsubscribe = networkDetection.subscribe((status) => {
      if (status.type !== 'wifi') {
        // Stop new downloads if switched away from WiFi
        this.pause();
      }
    });

    // Load config from localStorage
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem('autoCacheConfig');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (err) {
      console.warn('Failed to load auto-cache config:', err);
    }
  }

  setConfig(config: Partial<AutoCacheConfig>) {
    this.config = { ...this.config, ...config };
    try {
      localStorage.setItem('autoCacheConfig', JSON.stringify(this.config));
    } catch (err) {
      console.warn('Failed to save auto-cache config:', err);
    }
  }

  getConfig(): AutoCacheConfig {
    return { ...this.config };
  }

  /**
   * Attempt to auto-cache a video when user plays it (only on WiFi)
   */
  async onVideoPlay(videoId: string, url: string, title: string, posterUrl?: string) {
    if (!this.config.enableAutoCacheOnWifi) return;
    if (!networkDetection.isWifi()) return;

    // Check if already cached or downloading
    const cached = await videoCacheService.getVideo(videoId);
    if (cached?.status === 'completed') return;
    if (this.activeDownloads.has(videoId)) return;

    // Don't exceed concurrent downloads
    if (this.activeDownloads.size >= this.config.maxConcurrentDownloads) {
      return; // Queue would go here if needed
    }

    // Start downloading
    await this.startCaching(videoId, url, title, posterUrl);
  }

  private async startCaching(videoId: string, url: string, title: string, posterUrl?: string) {
    this.activeDownloads.add(videoId);

    try {
      await videoCacheService.downloadVideo(
        videoId,
        url,
        title,
        posterUrl,
        'movie',
        this.config.quality
      );
    } catch (error) {
      console.warn(`Failed to auto-cache video ${videoId}:`, error);
    } finally {
      this.activeDownloads.delete(videoId);
    }
  }

  /**
   * Pause auto-caching (e.g., when switching away from WiFi)
   */
  pause() {
    // In a full implementation, this would pause active downloads
    // For now, we just stop starting new ones
  }

  /**
   * Resume auto-caching
   */
  resume() {
    // Resume auto-caching if on WiFi
  }

  /**
   * Get active download count
   */
  getActiveDownloads(): number {
    return this.activeDownloads.size;
  }

  /**
   * Check if auto-cache is enabled and on WiFi
   */
  isActive(): boolean {
    return this.config.enableAutoCacheOnWifi && networkDetection.isWifi();
  }

  destroy() {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
  }
}

export const autoCacheService = new AutoCacheService();
