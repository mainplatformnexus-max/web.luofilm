# Luo Film

A React-based streaming platform frontend built with Vite, TypeScript, and Firebase.

## Project Structure

- `src/` - All frontend source code
  - `pages/` - Page components (Index, Watch, Movies, Series, TVChannel, LiveSport, Agent, AgentWatch, AudiencePage, SharedContent, AdminDashboard, SectionPage, HowToUse, Profile, Settings, Downloads, NotFound)
  - `components/` - Reusable UI components
  - `contexts/` - React context providers (AuthContext)
  - `hooks/` - Custom React hooks (useNotificationTimer, useVideoCache)
  - `lib/` - Firebase config, services, notificationService, videoCacheService
  - `data/` - Static data files
- `public/` - Static assets

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 5
- **Routing**: React Router DOM v6
- **Auth & Database**: Firebase (Auth + Firestore)
- **UI**: Tailwind CSS, shadcn/ui (Radix UI), lucide-react
- **State/Data**: TanStack React Query v5
- **Video**: ArtPlayer, HLS.js, Shaka Player
- **PWA**: vite-plugin-pwa
- **Forms**: react-hook-form + zod
- **Caching**: IndexedDB for offline video storage

## Running the App

The workflow "Start application" runs `npm run dev` on port 5000.

## Firebase Project

Project ID: `luo-film`
Auth domain: `luo-film.firebaseapp.com`

## Recent Updates (March 2026)

### Navigation Updates
- **Settings in Main Navigation**: Added Settings link to navigation menu near Agent 1X (both desktop and mobile)
- **Downloads in Navigation**: Added Downloads to mobile bottom navigation
- **Downloads Button**: Added Downloads button to header for quick access
- Enhanced navigation with Zap icon for Settings

### Settings Page
- Full-featured Settings page (`src/pages/Settings.tsx`)
- Account details, phone number, last login, member status
- Notification preferences for new content, promotions, downloads, subscription reminders
- Security settings with password change option
- Data & Network settings

### Data Saver Mode
- Toggle in Settings page under "Data & Network"
- Videos play at 480p or lower when enabled
- Perfect for mobile users on limited data
- Persistent setting stored in localStorage

### Downloads & Offline Caching
- **Downloads Page** (`src/pages/Downloads.tsx`):
  - Full download manager interface
  - Shows download progress for in-progress downloads
  - Displays cache storage usage (up to 1GB per user)
  - One-click delete for cached videos
  - Quick-play button for completed downloads
  - Status indicators: downloading, completed, paused, error

- **Video Cache Service** (`src/lib/videoCacheService.ts`):
  - IndexedDB-based persistent storage
  - Download videos for offline viewing
  - Automatic 30-day expiration for cached videos
  - Progress tracking during download
  - Cache size management

- **useVideoCache Hook** (`src/hooks/useVideoCache.ts`):
  - React hook for managing cached videos
  - Load, download, delete, and track cache size
  - Integration-ready for video player components

### Browser Notifications System
- **Real browser notifications** using Notification API (like YouTube/TikTok)
- **Content Notifications**: Shows when admin uploads new content (movies, series, episodes, news, channels, 18+)
- **User Engagement**: 10-minute stay notification offering 2 hours free access
- Functions in `src/lib/notificationService.ts`:
  - `requestNotificationPermission()` - Request browser permission
  - `showNotification()` - Generic notification
  - `showContentNotification()` - For content uploads
  - `showFreeSubscriptionNotification()` - For user engagement
- **10-Minute Timer** (`src/hooks/useNotificationTimer.ts`):
  - Automatic notification after 10 minutes on site
  - Once per day per user (localStorage tracking)
  - Works on web and PWA app

### Mobile Navigation Enhancement
- Larger bottom navigation (icons 36px, padding py-2)
- Better tap targets and spacing
- Increased spacer height (h-20) for content clearance
- Downloads and Account buttons easily accessible

### TV Channel
- **FREE for all users** - no subscription required
- Live TV channels accessible without premium membership

## Notes

- Frontend-only app — no Express backend
- Firebase credentials hardcoded in `src/lib/firebase.ts`
- Port configured to 5000 for Replit preview compatibility
- Notifications work like YouTube — real browser notifications on desktop and mobile
- Offline caching works on both web and PWA installed app
- Data saver mode adapts video quality to connection speed
