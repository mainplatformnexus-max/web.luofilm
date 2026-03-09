export interface CachedVideo {
  id: string;
  title: string;
  url: string;
  posterUrl?: string;
  type: 'movie' | 'series' | 'tv' | 'sport';
  size: number;
  progress: number;
  status: 'downloading' | 'completed' | 'paused' | 'error';
  createdAt: number;
  expiresAt: number;
}

const DB_NAME = 'LuoFilmCache';
const STORE_NAME = 'videos';
const MAX_CACHE_SIZE = 1024 * 1024 * 1024; // 1GB

class VideoCacheService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async addVideo(video: CachedVideo): Promise<void> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(video);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateVideo(video: CachedVideo): Promise<void> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(video);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getVideo(id: string): Promise<CachedVideo | null> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllVideos(): Promise<CachedVideo[]> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async deleteVideo(id: string): Promise<void> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async downloadVideo(
    videoId: string,
    url: string,
    title: string,
    posterUrl?: string,
    type: 'movie' | 'series' | 'tv' | 'sport' = 'movie',
    onProgress?: (progress: number) => void
  ): Promise<void> {
    await this.initPromise;

    const video: CachedVideo = {
      id: videoId,
      title,
      url,
      posterUrl,
      type,
      size: 0,
      progress: 0,
      status: 'downloading',
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    await this.addVideo(video);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network error');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Cannot read response');

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        const progress = Math.min(100, (receivedLength / (response.headers.get('content-length') ? parseInt(response.headers.get('content-length')!) : 1)) * 100);
        video.progress = Math.round(progress);
        onProgress?.(video.progress);

        await this.updateVideo(video);
      }

      video.status = 'completed';
      video.size = receivedLength;
      await this.updateVideo(video);
    } catch (error) {
      video.status = 'error';
      await this.updateVideo(video);
      throw error;
    }
  }

  async getCacheSize(): Promise<number> {
    const videos = await this.getAllVideos();
    return videos.reduce((sum, v) => sum + v.size, 0);
  }

  async clearOldVideos(): Promise<void> {
    const videos = await this.getAllVideos();
    const now = Date.now();

    for (const video of videos) {
      if (video.expiresAt < now) {
        await this.deleteVideo(video.id);
      }
    }
  }
}

export const videoCacheService = new VideoCacheService();
