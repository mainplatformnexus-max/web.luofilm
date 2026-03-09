# LUO FILM Project Documentation

## Recent Updates (Latest Session)

### 1. Google Analytics Integration
- **Added**: Google Analytics tag (gtag.js) to `index.html`
- **Tracking ID**: G-D6XSJWP6NF
- **Purpose**: Track user analytics and engagement on the platform

### 2. Offline Video Playback System
Implemented a complete offline video caching and playback solution:

#### New Files Created:
1. **`src/hooks/useOfflineVideoPlayer.ts`**
   - Custom React hook for managing offline video playback state
   - Checks cached video availability
   - Falls back to online URL if no cached video exists
   - Provides refetch capability

2. **`src/lib/offlinePlayerUtils.ts`**
   - Utility functions for offline video management:
     - `getPlaybackUrl()` - Determines best video source (cached or online)
     - `cacheVideoForOffline()` - Downloads and caches videos for offline
     - `isCachedAndReady()` - Checks if video is cached and ready
     - `getCachedVideoInfo()` - Retrieves cached video metadata
     - `removeOfflineCache()` - Deletes cached videos

3. **`src/components/OfflineVideoPlayerComponent.tsx`**
   - Advanced video player component with offline support
   - Features:
     - Automatic detection of cached vs online videos
     - Fallback to online streaming if cache unavailable
     - Visual indicator ("Playing Offline" badge) when using cached content
     - Supports HLS and standard MP4 formats via Plyr
     - Proper cleanup of HLS and player instances

#### Modified Files:
1. **`src/pages/Watch.tsx`**
   - Added state for tracking offline playback (`playingOffline`, `cachedVideoUrl`)
   - Integrated offline video checking on content load
   - Updated player rendering to use `OfflineVideoPlayerComponent` when cached video available
   - Falls back to `ArtPlayerComponent` for online streaming
   - Imported new utility functions and components

## How It Works

### Offline Video Playback Flow:
1. **Load Content**: When a drama/movie loads, the system checks if a cached version exists
2. **Check Cache**: Uses `getPlaybackUrl()` to determine video source:
   - If cached and complete → uses blob URL for offline playback
   - If not cached → uses online streaming URL
3. **Player Selection**: 
   - `OfflineVideoPlayerComponent` → for cached videos (full offline support)
   - `ArtPlayerComponent` → for online streaming
4. **Visual Feedback**: Shows "Playing Offline" badge when cached video is active
5. **Fallback**: If cached video fails to load, automatically falls back to online

### Key Features:
- **No internet required for cached videos**: Uses browser IndexedDB and blob URLs
- **Seamless fallback**: Automatically switches to online if offline playback fails
- **HLS support**: Handles both HLS (.m3u8) and MP4 video formats
- **Quality controls**: Supports video quality selection via Plyr player
- **Proper resource cleanup**: Destroys HLS instances and players on unmount

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Video Players**: Plyr, Hls.js, Shaka Player, ArtPlayer, Mux Player
- **Storage**: IndexedDB (via VideoCacheService)
- **Analytics**: Google Analytics (gtag.js)
- **PWA**: Vite PWA Plugin with offline support

## Database (IndexedDB)
- **Database Name**: `LuoFilmCache`
- **Stores**:
  - `videos`: Stores cached video metadata and blob data
  - `dataUsage`: Tracks data usage statistics
- **Video Expiration**: 30 days (configurable)

## Testing the Feature
1. Download a video to cache using the "Download" button
2. Disable internet or go offline
3. Reload the page - the player should automatically use the cached video
4. Look for the "Playing Offline" badge in the player UI
5. Video should play without any internet connection

## Notes
- Cached videos are stored in browser's IndexedDB (not affected by cache clearing in most cases)
- Each video can have multiple quality options (original, 720p, 480p, 360p)
- Data usage is tracked per day, week, and month
- All player controls work normally with cached videos
