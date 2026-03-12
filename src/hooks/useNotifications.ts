import { useEffect, useRef } from 'react';
import { subscribeMovies, subscribeSeries } from '@/lib/firebaseServices';
import { showInAppNotification, playClingSound } from '@/components/NotificationPrompt';

const sendBrowserNotification = (title: string, body: string, icon?: string, url?: string) => {
  // Always show in-app floating notification
  showInAppNotification(title, body, icon, url);

  // Also send browser/OS notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: icon || '/logo.png',
        badge: '/logo.png',
      });
      notif.onclick = () => {
        window.focus();
        if (url) window.location.href = url;
        notif.close();
      };
    } catch (e) {
      console.warn('Browser notification failed:', e);
    }
  }
};

export const useNotifications = () => {
  const seenIds = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Listen for new movies
    const unsubMovies = subscribeMovies((movies) => {
      const latest = movies[0];
      if (!latest) return;
      const vid = latest.id || latest.name;
      if (seenIds.current.has(vid)) return;
      seenIds.current.add(vid);
      if (seenIds.current.size === 1) return; // skip first load

      sendBrowserNotification(
        `🎬 New Movie: ${latest.name}`,
        latest.description?.substring(0, 80) || 'Watch now on LUO FILM!',
        latest.posterUrl,
        `/watch/${latest.id}`
      );
    });

    // Listen for new series
    const unsubSeries = subscribeSeries((series) => {
      const latest = series[0];
      if (!latest) return;
      const vid = `series-${latest.id || latest.name}`;
      if (seenIds.current.has(vid)) return;
      seenIds.current.add(vid);
      if (seenIds.current.size <= 2) return; // skip first load

      sendBrowserNotification(
        `📺 New Series: ${latest.name}`,
        latest.description?.substring(0, 80) || 'Watch now on LUO FILM!',
        latest.posterUrl,
        `/watch/${latest.id}`
      );
    });

    // Rotating engagement messages every 10 minutes
    const messages = [
      { title: "💎 Subscribe & Unlock All!", body: "Get unlimited movies, series & downloads. Subscribe now!", icon: '/logo.png', url: '/profile' },
      { title: "🎬 Latest Releases", body: "New movies and episodes just dropped — watch them now!", icon: '/logo.png', url: '/movies' },
      { title: "💰 Earn as an Agent", body: "Sell LUO FILM access and earn real money. Join our Agent program!", icon: '/logo.png', url: '/agent' },
      { title: "📥 Save for Offline", body: "Cache your favorite videos to watch without internet!", icon: '/logo.png', url: '/downloads' },
      { title: "📡 Live TV & Sports", body: "Watch live TV channels and upcoming sports matches!", icon: '/logo.png', url: '/tv-channel' },
    ];
    let msgIdx = 0;

    // Show first engagement message after 3 minutes
    const firstTimer = setTimeout(() => {
      sendBrowserNotification(messages[msgIdx].title, messages[msgIdx].body, messages[msgIdx].icon, messages[msgIdx].url);
      msgIdx = (msgIdx + 1) % messages.length;

      // Then every 10 minutes
      intervalRef.current = setInterval(() => {
        sendBrowserNotification(messages[msgIdx].title, messages[msgIdx].body, messages[msgIdx].icon, messages[msgIdx].url);
        msgIdx = (msgIdx + 1) % messages.length;
      }, 10 * 60 * 1000);
    }, 3 * 60 * 1000);

    return () => {
      unsubMovies();
      unsubSeries();
      clearTimeout(firstTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  };

  return { requestPermission };
};
