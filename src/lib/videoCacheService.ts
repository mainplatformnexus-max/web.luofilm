export interface CachedVideo {
  id: string;
  title: string;
  url: string;
  blob?: Blob;
  posterUrl?: string;
  type: 'movie' | 'series' | 'tv' | 'sport';
  size: number;
  progress: number;
  status: 'downloading' | 'completed' | 'paused' | 'error';
  createdAt: number;
  expiresAt: number;
  quality: 'original' | '720p' | '480p' | '360p';
}

export interface DataUsageStats {
  todayUsage: number;
  weekUsage: number;
  monthUsage: number;
  totalUsage: number;
  lastUpdated: number;
}

const DB_NAME = 'LuoFilmCache';
const VIDEOS_STORE = 'videos';
const DATA_STORE = 'dataUsage';

class VideoCacheService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  private async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 3);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(VIDEOS_STORE)) {
          db.createObjectStore(VIDEOS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(DATA_STORE)) {
          db.createObjectStore(DATA_STORE, { keyPath: 'date' });
        }
      };
    });
  }

  async addVideo(video: Omit<CachedVideo, 'blob'>): Promise<void> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([VIDEOS_STORE], 'readwrite');
      const store = tx.objectStore(VIDEOS_STORE);
      const request = store.add(video);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateVideo(video: Omit<CachedVideo, 'blob'>): Promise<void> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([VIDEOS_STORE], 'readwrite');
      const store = tx.objectStore(VIDEOS_STORE);
      const request = store.put(video);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async saveBlob(id: string, blob: Blob): Promise<void> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([VIDEOS_STORE], 'readwrite');
      const store = tx.objectStore(VIDEOS_STORE);
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const video = getRequest.result;
        if (video) {
          video.blob = blob;
          const putRequest = store.put(video);
          putRequest.onerror = () => reject(putRequest.error);
          putRequest.onsuccess = () => resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getVideo(id: string): Promise<CachedVideo | null> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([VIDEOS_STORE], 'readonly');
      const store = tx.objectStore(VIDEOS_STORE);
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getVideoBlob(id: string): Promise<Blob | null> {
    const video = await this.getVideo(id);
    return video?.blob || null;
  }

  async getAllVideos(): Promise<Omit<CachedVideo, 'blob'>[]> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([VIDEOS_STORE], 'readonly');
      const store = tx.objectStore(VIDEOS_STORE);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.map(({ blob, ...rest }: any) => rest));
      };
    });
  }

  async deleteVideo(id: string): Promise<void> {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([VIDEOS_STORE], 'readwrite');
      const store = tx.objectStore(VIDEOS_STORE);
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async trackDataUsage(bytes: number): Promise<void> {
    await this.initPromise;
    const today = new Date().toDateString();
    
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([DATA_STORE], 'readwrite');
      const store = tx.objectStore(DATA_STORE);
      
      const getRequest = store.get(today);
      getRequest.onsuccess = () => {
        const existing = getRequest.result || { date: today, usage: 0 };
        existing.usage = (existing.usage || 0) + bytes;
        
        const putRequest = store.put(existing);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };
    });
  }

  async getDataUsage(): Promise<DataUsageStats> {
    await this.initPromise;
    const today = new Date();
    const todayStr = today.toDateString();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction([DATA_STORE], 'readonly');
      const store = tx.objectStore(DATA_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const records = request.result || [];
        let todayUsage = 0;
        let weekUsage = 0;
        let monthUsage = 0;
        let totalUsage = 0;

        records.forEach((record: any) => {
          const recordDate = new Date(record.date);
          const usage = record.usage || 0;

          if (record.date === todayStr) todayUsage = usage;
          if (recordDate >= weekAgo) weekUsage += usage;
          if (recordDate >= monthAgo) monthUsage += usage;
          totalUsage += usage;
        });

        resolve({
          todayUsage,
          weekUsage,
          monthUsage,
          totalUsage,
          lastUpdated: Date.now(),
        });
      };
    });
  }

  async downloadVideo(
    videoId: string,
    url: string,
    title: string,
    posterUrl?: string,
    type: 'movie' | 'series' | 'tv' | 'sport' = 'movie',
    quality?: 'original' | '720p' | '480p' | '360p',
    onProgress?: (progress: number, downloadedBytes?: number) => void
  ): Promise<void> {
    const finalQuality = quality || '720p';
    await this.initPromise;

    const video: Omit<CachedVideo, 'blob'> = {
      id: videoId,
      title,
      url,
      posterUrl,
      type,
      size: 0,
      progress: 0,
      status: 'downloading',
      quality: finalQuality,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    await this.addVideo(video);

    try {
      const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw new Error(`Network error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Cannot read response');

      const chunks: Uint8Array[] = [];
      let receivedLength = 0;
      const totalLength = parseInt(response.headers.get('content-length') || '0', 10);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;
        const progress = totalLength ? Math.round((receivedLength / totalLength) * 100) : 0;
        
        video.progress = progress;
        video.size = receivedLength;
        if (onProgress) onProgress(progress, receivedLength);

        await this.updateVideo(video);
        await this.trackDataUsage(value.length);
      }

      const blob = new Blob(chunks, { type: 'video/mp4' });
      await this.saveBlob(videoId, blob);

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
