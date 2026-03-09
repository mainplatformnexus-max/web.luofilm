# Luo Film

A React-based streaming platform frontend built with Vite, TypeScript, and Firebase.

## Project Structure

- `src/` - All frontend source code
  - `pages/` - Page components (Index, Watch, Movies, Series, TVChannel, LiveSport, Agent, AgentWatch, AudiencePage, SharedContent, AdminDashboard, SectionPage, HowToUse, Profile, Settings, NotFound)
  - `components/` - Reusable UI components
  - `contexts/` - React context providers (AuthContext)
  - `hooks/` - Custom React hooks (useNotificationTimer for 10-min stay notifications)
  - `lib/` - Firebase config, services, and notificationService for browser notifications
  - `data/` - Static data files
- `public/` - Static assets

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 5
- **Routing**: React Router DOM v6
- **Auth & Database**: Firebase (Auth + Firestore) — config hardcoded in `src/lib/firebase.ts`
- **UI**: Tailwind CSS, shadcn/ui (Radix UI), lucide-react
- **State/Data**: TanStack React Query v5
- **Video**: ArtPlayer, HLS.js, Shaka Player
- **PWA**: vite-plugin-pwa
- **Forms**: react-hook-form + zod

## Running the App

The workflow "Start application" runs `npm run dev` on port 5000.

## Firebase Project

Project ID: `luo-film`
Auth domain: `luo-film.firebaseapp.com`

## Recent Updates (March 2026)

### Settings Page
- Added desktop Settings page (`src/pages/Settings.tsx`) with all account information, notification preferences, and security settings
- Accessible from user profile menu in header (both desktop and mobile)
- Desktop layout with sidebar for additional help and account info

### Mobile Navigation Enhancement
- Increased mobile bottom navigation bar size for better usability
- Larger tap targets (icons from 32px to 36px)
- Increased vertical padding and spacing
- Better visual hierarchy with improved text sizing

### Browser Notifications System
- Created `src/lib/notificationService.ts` with real browser Notification API support
- Support for content notifications: shows poster image with call-to-action
- Support for subscription notifications: shows message with free subscription offer
- Functions for:
  - `requestNotificationPermission()` - Request browser notification permission
  - `showNotification()` - Generic notification display
  - `showContentNotification()` - For admin content uploads (movies, series, episodes, news, channels, 18+)
  - `showFreeSubscriptionNotification()` - For 10-minute stay reward

### 10-Minute Stay Notification
- Created `src/hooks/useNotificationTimer.ts` hook
- Automatically shows notification after user stays 10 minutes on website
- Once per day per user (tracked in localStorage)
- Offers 2 hours of free premium access
- Works on both web and PWA app

### Header Navigation Updates
- Added Settings link in user profile dropdown (desktop and mobile)
- Added Admin link to user dropdown (visible only to admin)
- Moved Admin from main nav to user menu for cleaner navigation

## Notes

- This is a frontend-only app — no Express backend
- Firebase credentials are hardcoded in `src/lib/firebase.ts`
- Port changed from 8080 to 5000 for Replit webview compatibility
- Browser notifications work like YouTube — request permission and show native OS notifications
- Notification system works on both web and PWA installed app versions
