# LUO FILM Project Documentation

## Recent Updates (Session 5)

### reCAPTCHA Enterprise Integration
- Added Google reCAPTCHA Enterprise script (`6LfgMYssAAAAACqxofm7doVagxWPMlhuzx3AVWdz`) to `index.html`
- `LoginModal.tsx` now calls `grecaptcha.enterprise.execute()` on login, registration, and Google sign-in
- Tokens generated for actions: `LOGIN`, `REGISTER`

### Privacy Policy & Terms Pages
- Created `src/pages/PrivacyPolicy.tsx` — full privacy policy including reCAPTCHA, FCM, data retention, user rights
- Created `src/pages/TermsAndConditions.tsx` — full terms covering accounts, Google sign-in, subscriptions, agent program, adult content
- Routes added: `/privacy` and `/terms`
- Login modal footer includes links to both pages
- Register form shows "By creating an account, you agree to our Terms & Privacy Policy"

### Google Sign-In Profile Completion — Country Selector
- `PhoneSetupModal.tsx` now includes full country dropdown (all world countries) with flag images
- Auto-detects user's country via IP geolocation
- Saves `country`, `countryCode`, `currency`, `currencySymbol` to Firestore alongside phone number

### Real Device Push Notifications (Service Worker)
- Created `public/firebase-messaging-sw.js` — Firebase Cloud Messaging service worker
  - Handles `push` events from FCM even when browser/app is closed
  - Handles `notificationclick` to navigate user to correct page
  - Handles `install`/`activate` lifecycle events
- Created `src/lib/pushNotifications.ts`:
  - `registerServiceWorker()` — registers the FCM SW on startup
  - `showDeviceNotification()` — uses `ServiceWorkerRegistration.showNotification()` for real OS-level notifications, falls back to `new Notification()`
  - `requestPushPermission()` — requests browser permission
  - `initFCM()` — initialises Firebase Cloud Messaging, gets FCM token, stores in Firestore `fcmTokens/{userId}`
- Updated `useNotifications.ts` to use `showDeviceNotification()` for all notifications
- VAPID key configured: `BFjo2j1VFoVMApXtGuMP-TovW6Ut0sPpx7DOZQlRUnvluHgORSCtZ7p16fsQ02r6xXkLBENR9nuUurWrue_BARU`
- FCM tokens are stored in Firestore `fcmTokens/{userId}` collection
- `useFCMSetup` hook in `App.tsx` initialises FCM on login and when notification permission is granted

## Recent Updates (Session 4)

### Homepage Redesign
- **Single "Best on LUO FILM" section**: All movies, series, and episodes merged in one grid sorted by upload date (newest first)
- **Interactive genre filter**: Clickable pill tags (All Videos, China Mainland, South Korea, etc.) that filter the main grid in real-time
- **Rankings – Top 100**: Separate section with numbered rank badges sorted by rating
- **Agent Exclusives**: Section showing agent-only content still within 5-day window
- **18+ Content**: Adult content section (only shows if isAdult content exists)

### Global Subscribe Modal
- Created `src/lib/globalModals.ts` with `showSubscribeModal()` / `registerSubscribeModal()` 
- Subscribe modal registered in AppLayout, triggered from anywhere (notifications, etc.)
- Subscription notification buttons now open the modal directly instead of navigating to /profile

### Enhanced Notification System
- **Welcome notification**: Shows on first login per account with random poster, "Movies" & "Series" buttons
- **TV Channel notification**: 2 minutes after page load, with live TV poster, red accent
- **Subscription promo**: 5 minutes in, uses last-watched movie poster, opens subscribe modal
- **Rotating messages**: Every 12 minutes with varied topics and action buttons
- **Better card design**: Progress bar draining across bottom, colored accent stripe, embedded action buttons
- Notifications use `SUBSCRIBE_MODAL` URL to trigger global modal instead of navigating

### Cache / Offline Download Fix
- Prioritizes `downloadLink` (direct MP4) over `streamLink` (m3u8 HLS) for caching
- Detects streaming-only URLs (m3u8, rtmp) and shows informative message instead of failing silently
- Falls back to proxy URL if direct download fails due to CORS
- Shows proper success/error messages for each scenario
- Stream-only content saves metadata to Downloads for quick online access

### OG Meta Tags (already existed, verified)
- Watch page updates og:title, og:description, og:image with movie/series name and poster
- Twitter card meta tags also updated dynamically
- IDs in index.html: og-title, og-desc, og-image, twitter-title, twitter-desc, twitter-image

## Recent Updates (Session 2)

### 1. Google Analytics Integration
- **Added**: Google Analytics tag (gtag.js) to `index.html`
- **Tracking ID**: G-D6XSJWP6NF
- **Purpose**: Track user analytics and engagement on the platform

### 2. Complete Offline Video System with Auto-Caching & Export
Implemented a complete offline video caching and playback solution with auto-caching on WiFi and device export:

#### Auto-Caching Features:
- **WiFi Detection**: Automatically detects WiFi vs mobile data connection
- **Smart Auto-Cache**: Automatically caches videos when played on WiFi (zero user interaction)
- **Network Monitoring**: Real-time network status tracking
- **Configurable Quality**: Auto-cache respects quality settings (720p default, customizable)

#### Export Functionality:
- **One-Click Export**: Export cached videos to device storage
- **Offline Export**: Can export videos even without internet connection
- **Auto-Cleanup**: Proper cleanup of blob URLs after export

#### Badge System:
- **18+ Badge**: Animated 3D red badge with pulsing glow for age-restricted content
- **Download Badge**: Orange animated badge showing available downloads
- **Quality Badge**: Purple/golden badge showing video quality (4K, etc.)

### 3. Offline Video Playback System

#### New Files Created:

**Offline Playback & Caching:**
1. **`src/hooks/useOfflineVideoPlayer.ts`**
   - Custom React hook for managing offline video playback state
   - Checks cached video availability
   - Falls back to online URL if no cached video exists

2. **`src/lib/offlinePlayerUtils.ts`**
   - Utility functions for offline video management
   - `getPlaybackUrl()` - Determines best video source
   - `cacheVideoForOffline()` - Downloads and caches videos
   - `isCachedAndReady()` - Checks if video is cached

3. **`src/lib/videoExport.ts`**
   - Handles exporting cached videos to device storage
   - `exportVideo()` - Downloads cached video to device
   - `sanitizeFilename()` - Safely formats filenames
   - `formatFileSize()` - Human-readable file sizes

4. **`src/components/OfflineVideoPlayerComponent.tsx`**
   - Advanced video player with offline support
   - Export button on cached videos (hover to reveal)
   - "Playing Offline" indicator badge
   - Fallback to online if cache unavailable

**Network Detection & Auto-Caching:**
5. **`src/lib/networkDetection.ts`**
   - WiFi vs mobile data detection using Navigator API
   - Real-time network status monitoring
   - Subscription system for network changes
   - Returns connection type and effective type

6. **`src/lib/autoCacheService.ts`**
   - Automatic video caching on WiFi
   - Smart service that triggers on video play
   - Respects user settings and network conditions
   - Prevents multiple downloads of same video
   - Configurable quality and concurrent downloads

**UI Badge Components:**
7. **`src/components/Badge18Plus.tsx`**
   - 3D animated 18+ badge with red theme
   - Rotating animation with glow effect
   - Pulsing scale animation
   - Tooltip on hover

8. **`src/components/DownloadBadge.tsx`**
   - Orange animated download indicator
   - Shows content is available for download
   - Animated sliding dot indicator

9. **`src/components/QualityBadge.tsx`**
   - Purple/golden quality badge
   - Shows video quality (4K, HD, etc.)
   - Golden shimmer animation effect

#### Modified Files:
1. **`src/pages/Watch.tsx`**
   - Added network status monitoring with real-time updates
   - Integrated offline video detection on content load
   - Auto-caching triggered when user plays video on WiFi
   - New badge displays: 18+, Download, Quality badges
   - Visual indicator for auto-caching in progress
   - Imported all new services and badge components

2. **`src/components/ArtPlayerComponent.tsx`**
   - Added `onVideoPlay` callback prop
   - Triggers auto-cache when video first plays
   - Integrates with auto-cache service

3. **`src/components/OfflineVideoPlayerComponent.tsx`**
   - Added export functionality with progress tracking
   - Export button appears on hover (for cached videos only)
   - Blue export button with proper error handling
   - Success/failure alerts on export completion

## How It Works

### Auto-Caching Flow:
1. **Network Detection**: System continuously monitors WiFi/mobile connection
2. **Video Play Trigger**: When user clicks play on online player
3. **Auto-Cache Logic**:
   - If on WiFi → automatically starts caching video in background
   - If on mobile → skips caching to save user data
   - If already cached → uses existing cache
4. **Background Download**: Caching happens silently without affecting playback
5. **Multiple Accesses**: Same video won't be cached twice

### Offline Video Playback Flow:
1. **Load Content**: When a drama/movie loads, the system checks cache first
2. **Source Priority**: Uses `getPlaybackUrl()` to determine source:
   - If cached and complete → uses blob URL for offline playback
   - If not cached → uses online streaming URL
3. **Player Selection**: 
   - `OfflineVideoPlayerComponent` → for cached videos (full offline support + export)
   - `ArtPlayerComponent` → for online streaming (with auto-cache on play)
4. **Visual Feedback**: 
   - "Playing Offline" orange badge on cached videos
   - "📡 Auto-caching..." message while caching on WiFi
   - 18+, Download, Quality badges show content capabilities

### Export Flow:
1. **Hover Detection**: Export button appears when hovering on cached video
2. **One-Click Export**: User clicks export button
3. **Download**: Video downloads to device storage as MP4
4. **Cleanup**: Proper blob URL cleanup after download

### Key Features:
- **Zero-Touch Auto-Caching**: Automatic on WiFi, manual control for mobile data
- **Complete Offline Playback**: No internet required for cached videos
- **Device Export**: Export cached videos to download folder
- **Seamless Fallback**: Auto-switches to online if offline fails
- **HLS Support**: Handles both HLS (.m3u8) and MP4 formats
- **Network-Aware**: Respects user's connection type
- **Proper Cleanup**: Destroys player instances and blob URLs on unmount

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

## Testing the Features

### Auto-Caching (WiFi):
1. Connect to WiFi
2. Play any video
3. Watch "📡 Auto-caching..." message
4. Exit and come back later - video now plays offline
5. Disable WiFi and reload - cached video plays without internet

### Manual Caching (Mobile Data):
1. Click the green "Download" button on mobile data
2. Watch progress increase
3. Video cached with your chosen quality
4. Can now play offline without data

### Export Cached Video:
1. Play any cached video
2. Hover over the video player
3. Click blue "Export" button (appears on hover)
4. Video downloads to device storage as MP4
5. Can share or use elsewhere

### Badge Display:
1. **18+ Badge**: Shown on age-restricted content (animated with 3D rotation)
2. **Download Badge**: Shows content available for download
3. **Quality Badge**: Shows premium quality (4K) with golden shimmer

## Configuration
Auto-cache settings can be customized via `autoCacheService`:
```javascript
autoCacheService.setConfig({
  enableAutoCacheOnWifi: true,      // Auto-cache on WiFi
  maxConcurrentDownloads: 1,        // 1 video at a time
  quality: '720p'                   // Default quality
});
```

## Notes
- **Storage**: Cached videos use browser's IndexedDB (persists beyond session)
- **Quality Options**: Original, 720p, 480p, 360p (configurable per download)
- **Data Tracking**: Usage tracked per day, week, month
- **Animations**: 18+ badge has 3D rotation + glow, badges have smooth transitions
- **Network Smart**: Auto-cache only on WiFi, respects Save Data setting
- **Export Anywhere**: Export works fully offline, downloads to device
