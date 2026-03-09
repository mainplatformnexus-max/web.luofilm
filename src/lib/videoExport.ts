/**
 * Export cached videos to device storage
 */

import { videoCacheService } from './videoCacheService';

interface ExportProgress {
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  progress: number;
  error?: string;
}

class VideoExportService {
  /**
   * Export a cached video to device storage (download)
   * Works in both online and offline modes
   */
  async exportVideo(
    videoId: string,
    filename: string,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<void> {
    try {
      onProgress?.({ status: 'in-progress', progress: 0 });

      // Get cached video
      const cachedVideo = await videoCacheService.getVideo(videoId);
      if (!cachedVideo) {
        throw new Error('Video not found in cache');
      }

      // Get video blob
      const blob = await videoCacheService.getVideoBlob(videoId);
      if (!blob) {
        throw new Error('Failed to retrieve video blob');
      }

      onProgress?.({ status: 'in-progress', progress: 50 });

      // Create download link
      const url = URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);

      onProgress?.({ status: 'completed', progress: 100 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      onProgress?.({ status: 'error', progress: 0, error: message });
      throw error;
    }
  }

  /**
   * Format bytes to human-readable size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format filename to be safe for download
   */
  sanitizeFilename(title: string): string {
    return title
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 200);
  }
}

export const videoExportService = new VideoExportService();
