import { useEffect } from 'react';
import { subscribeMovies, subscribeSeries, subscribeEpisodes } from '@/lib/firebaseServices';

export const useNotifications = () => {
  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(() => {});
      
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        if (options?.data?.url) {
          window.location.href = options.data.url;
        }
        notification.close();
      };
    }
  };

  useEffect(() => {
    if (Notification.permission !== 'granted') return;

    // Listen for new movies
    const unsubMovies = subscribeMovies((movies) => {
      const latest = movies[0];
      if (latest && latest.createdAt) {
        const createdTime = new Date(latest.createdAt).getTime();
        if (Date.now() - createdTime < 60000) { // New in last minute
          showNotification(`New Movie: ${latest.name}`, {
            body: latest.description?.substring(0, 100),
            image: latest.posterUrl,
            data: { url: `/watch/${latest.id}` }
          });
        }
      }
    });

    // Listen for new series
    const unsubSeries = subscribeSeries((series) => {
      const latest = series[0];
      if (latest && latest.createdAt) {
        const createdTime = new Date(latest.createdAt).getTime();
        if (Date.now() - createdTime < 60000) {
          showNotification(`New Series: ${latest.name}`, {
            body: latest.description?.substring(0, 100),
            image: latest.posterUrl,
            data: { url: `/watch/${latest.id}` }
          });
        }
      }
    });

    // Periodic "Thank you" or status messages
    const interval = setInterval(() => {
      showNotification("Enjoying LUO FILM?", {
        body: "Check out the latest TV channels and upcoming sports!",
        data: { url: '/' }
      });
    }, 15 * 60 * 1000); // Every 15 minutes

    return () => {
      unsubMovies();
      unsubSeries();
      clearInterval(interval);
    };
  }, []);

  return { requestPermission };
};
