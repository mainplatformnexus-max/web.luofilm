import { useEffect } from 'react';
import { subscribeMovies, subscribeSeries, subscribeEpisodes } from '@/lib/firebaseServices';

export const useNotifications = () => {
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notification");
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showNotification("Notifications Enabled!", {
          body: "You will now receive updates for new movies and series."
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
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

    // Periodic engagement messages
    const messages = [
      { title: "Subscribe & Save!", body: "Get unlimited access to all movies and series. Subscribe now!", url: "/profile" },
      { title: "Latest Releases", body: "Don't miss out on the newest trending movies and episodes!", url: "/movies" },
      { title: "Earn Money as an Agent", body: "Sell movies on our Agent page and start earning today!", url: "/agent" },
      { title: "Offline Viewing", body: "Remember to cache your favorite videos for offline watching!", url: "/downloads" },
      { title: "High-Speed Streaming", body: "Our data servers are optimized for the best viewing experience!", url: "/" }
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      const msg = messages[messageIndex];
      showNotification(msg.title, {
        body: msg.body,
        data: { url: msg.url }
      });
      messageIndex = (messageIndex + 1) % messages.length;
    }, 10 * 60 * 1000); // Every 10 minutes rotate through messages

    return () => {
      unsubMovies();
      unsubSeries();
      clearInterval(interval);
    };
  }, []);

  return { requestPermission };
};
