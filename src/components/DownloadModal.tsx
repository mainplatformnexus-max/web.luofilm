import { Download, X } from "lucide-react";
import { useVideoCache } from "@/hooks/useVideoCache";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  posterUrl?: string;
  type: 'movie' | 'series' | 'tv' | 'sport';
}

const DownloadModal = ({
  open,
  onClose,
  videoId,
  videoUrl,
  videoTitle,
  posterUrl,
  type,
}: DownloadModalProps) => {
  const { toast } = useToast();
  const { downloadVideo } = useVideoCache();
  const [selectedQuality, setSelectedQuality] = useState<'original' | '720p' | '480p' | '360p'>('720p');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (!videoUrl) {
      toast({ title: "Error", description: "Video URL not available", variant: "destructive" });
      return;
    }

    setDownloading(true);
    try {
      await downloadVideo(
        videoId,
        videoUrl,
        videoTitle,
        posterUrl,
        type,
        (progressValue) => setProgress(progressValue)
      );
      toast({ title: "Success", description: "Video downloaded for offline viewing" });
      onClose();
    } catch (error) {
      toast({ title: "Error", description: "Failed to download video", variant: "destructive" });
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Download Video</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Video Quality</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Original", value: "original" },
                { label: "720p", value: "720p" },
                { label: "480p", value: "480p" },
                { label: "360p", value: "360p" },
              ].map((q) => (
                <button
                  key={q.value}
                  onClick={() => setSelectedQuality(q.value as any)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                    selectedQuality === q.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {downloading && (
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground">Downloading...</span>
                <span className="text-foreground font-medium">{progress}%</span>
              </div>
              <div className="bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
