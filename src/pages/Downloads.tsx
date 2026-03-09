import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Play, Download as DownloadIcon, HardDrive, TrendingDown } from "lucide-react";
import { useVideoCache } from "@/hooks/useVideoCache";
import { videoCacheService, type CachedVideo, type DataUsageStats } from "@/lib/videoCacheService";

const Downloads = () => {
  const navigate = useNavigate();
  const { videos, loading, loadVideos, deleteVideo, getCacheSize } = useVideoCache();
  const [cacheSize, setCacheSize] = useState(0);
  const [dataUsage, setDataUsage] = useState<DataUsageStats | null>(null);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    const updateSize = async () => {
      const size = await getCacheSize();
      setCacheSize(size);
    };
    updateSize();
  }, [videos, getCacheSize]);

  useEffect(() => {
    const loadDataUsage = async () => {
      const usage = await videoCacheService.getDataUsage();
      setDataUsage(usage);
    };
    loadDataUsage();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: CachedVideo['status']) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'downloading': return 'text-primary';
      case 'paused': return 'text-yellow-500';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'movie': return 'bg-blue-500/10 text-blue-500';
      case 'series': return 'bg-purple-500/10 text-purple-500';
      case 'tv': return 'bg-orange-500/10 text-orange-500';
      case 'sport': return 'bg-green-500/10 text-green-500';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 px-4 py-3 text-muted-foreground hover:text-foreground text-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-4xl mx-auto px-4 pb-20 lg:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Downloads</h1>
          <p className="text-muted-foreground text-sm">Manage your offline videos</p>
        </div>

        {/* Storage Info */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground">Storage & Data Usage</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Cached Videos</span>
                <span className="text-foreground font-medium">{formatSize(cacheSize)}</span>
              </div>
              <div className="bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min((cacheSize / (100 * 1024 * 1024 * 1024)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Up to 100GB available for downloads</p>
            </div>
          </div>
        </div>

        {/* Data Usage Stats */}
        {dataUsage && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingDown className="w-5 h-5 text-accent" />
              <h2 className="font-bold text-foreground">Data Usage</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Today</p>
                <p className="text-sm font-bold text-foreground">{formatSize(dataUsage.todayUsage)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">This Week</p>
                <p className="text-sm font-bold text-foreground">{formatSize(dataUsage.weekUsage)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">This Month</p>
                <p className="text-sm font-bold text-foreground">{formatSize(dataUsage.monthUsage)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Used</p>
                <p className="text-sm font-bold text-foreground">{formatSize(dataUsage.totalUsage)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Downloads List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Loading downloads...</p>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <DownloadIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No downloads yet</p>
            <p className="text-xs text-muted-foreground">Download videos to watch offline</p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video: any) => (
              <div
                key={video.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Poster */}
                  {video.posterUrl && (
                    <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={video.posterUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-medium text-foreground truncate">{video.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getTypeColor(video.type)}`}>
                            {video.type.toUpperCase()}
                          </span>
                          <span className={`text-xs font-medium ${getStatusColor(video.status)}`}>
                            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress */}
                    {video.status === 'downloading' && (
                      <div className="mb-2">
                        <div className="bg-secondary rounded-full h-1.5 overflow-hidden mb-1">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${video.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{video.progress}%</p>
                      </div>
                    )}

                    {/* Size */}
                    <p className="text-xs text-muted-foreground">{formatSize(video.size)}</p>
                  </div>

                  {/* Play Button - Show for completed and downloading */}
                  {(video.status === 'completed' || video.status === 'downloading') && (
                    <button
                      onClick={() => navigate(`/watch/${video.id}?offline=true`, { state: { isOffline: true, cacheId: video.id } })}
                      className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                      title={video.status === 'downloading' ? 'Watch while downloading' : 'Play'}
                    >
                      <Play className="w-4 h-4 ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Downloads;
