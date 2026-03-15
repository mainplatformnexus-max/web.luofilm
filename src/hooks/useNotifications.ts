import { useEffect, useRef } from 'react';
import { subscribeMovies, subscribeSeries, subscribeTVChannels } from '@/lib/firebaseServices';
import { showInAppNotification, type NotifButton } from '@/components/NotificationPrompt';
import { showDeviceNotification, registerServiceWorker, requestPushPermission } from '@/lib/pushNotifications';

const sendBrowserNotification = (
  title: string,
  body: string,
  icon?: string,
  url?: string,
  buttons?: NotifButton[],
  accent?: string,
  duration?: number
) => {
  showInAppNotification(title, body, icon, url, buttons, accent, duration);
  showDeviceNotification(title, body, icon, url, `lf-${Date.now()}`);
};

export const trackWatchedMovie = (poster: string, movieId: string) => {
  try {
    localStorage.setItem('lf-last-watched', JSON.stringify({ poster, movieId, ts: Date.now() }));
  } catch (e) {}
};

export const useNotifications = () => {
  const seenIds = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tvChannelPoster = useRef<string>('/logo.png');
  const allMoviesRef = useRef<any[]>([]);
  const allSeriesRef = useRef<any[]>([]);

  useEffect(() => {
    registerServiceWorker().catch(() => {});

    const unsubTV = subscribeTVChannels((channels) => {
      const active = channels.filter(c => c.isActive || !c.isActive);
      if (active.length > 0) {
        const pick = active[Math.floor(Math.random() * active.length)];
        tvChannelPoster.current = (pick as any).posterUrl || (pick as any).logoUrl || '/logo.png';
      }
    });

    const unsubMovies = subscribeMovies((movies) => {
      allMoviesRef.current = movies;
      const sorted = [...movies].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db_ = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db_ - da;
      });
      const latest = sorted[0];
      if (!latest) return;
      const vid = `movie-${latest.id}`;
      if (seenIds.current.has(vid)) return;
      seenIds.current.add(vid);
      if (seenIds.current.size <= 2) return;

      sendBrowserNotification(
        `New Movie: ${latest.name}`,
        latest.description?.substring(0, 90) || 'Just added on LUO FILM — Watch now!',
        latest.posterUrl,
        `/watch/${latest.id}`,
        [
          { label: 'Watch Now', url: `/watch/${latest.id}`, color: 'hsl(var(--primary))' },
          { label: 'All Movies', url: '/movies', color: '#333' },
        ],
        'hsl(var(--primary))',
        9000
      );
    });

    const unsubSeries = subscribeSeries((series) => {
      allSeriesRef.current = series;
      const sorted = [...series].sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db_ = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db_ - da;
      });
      const latest = sorted[0];
      if (!latest) return;
      const vid = `series-${latest.id}`;
      if (seenIds.current.has(vid)) return;
      seenIds.current.add(vid);
      if (seenIds.current.size <= 3) return;

      sendBrowserNotification(
        `New Series: ${latest.name}`,
        latest.description?.substring(0, 90) || 'A brand new series is now streaming!',
        latest.posterUrl,
        `/watch/${latest.id}`,
        [
          { label: 'Watch Now', url: `/watch/${latest.id}`, color: 'hsl(var(--primary))' },
          { label: 'All Series', url: '/series', color: '#333' },
        ],
        '#7c3aed',
        9000
      );
    });

    const tvTimer = setTimeout(() => {
      sendBrowserNotification(
        'Watch Live TV & Sports Now',
        'Catch live matches, news & entertainment channels — streaming right now on LUO FILM!',
        tvChannelPoster.current,
        '/tv-channel',
        [
          { label: 'Go Live', url: '/tv-channel', color: '#dc2626' },
          { label: 'Sports', url: '/tv-channel', color: '#ea580c' },
        ],
        '#dc2626',
        9000
      );
    }, 2 * 60 * 1000);

    const subTimer = setTimeout(() => {
      const lastWatched = (() => {
        try { return JSON.parse(localStorage.getItem('lf-last-watched') || '{}'); } catch { return {}; }
      })();
      const poster = lastWatched.poster || (() => {
        const all = [...allMoviesRef.current, ...allSeriesRef.current];
        return all.length > 0 ? all[Math.floor(Math.random() * all.length)].posterUrl : '/logo.png';
      })();
      sendBrowserNotification(
        'Unlock All Movies & Series',
        'Subscribe to LUO FILM and enjoy unlimited streaming, downloads & exclusive content with no limits!',
        poster,
        'SUBSCRIBE_MODAL',
        [
          { label: 'Subscribe Now', url: 'SUBSCRIBE_MODAL', color: '#d97706' },
          { label: 'Browse Free', url: '/movies', color: '#374151' },
        ],
        '#d97706',
        10000
      );
    }, 5 * 60 * 1000);

    const engagementMessages = [
      {
        title: 'Premium Access – Subscribe Today',
        body: 'Get unlimited movies, series & downloads. Join thousands of happy subscribers!',
        icon: '/logo.png',
        url: 'SUBSCRIBE_MODAL',
        buttons: [
          { label: 'Subscribe Now', url: 'SUBSCRIBE_MODAL', color: '#d97706' },
          { label: 'Movies', url: '/movies', color: '#1d4ed8' },
        ] as NotifButton[],
        accent: '#d97706',
      },
      {
        title: 'Discover Latest Movies',
        body: 'Fresh movies just added! Explore the full library on LUO FILM.',
        icon: '/logo.png',
        url: '/movies',
        buttons: [
          { label: 'Movies', url: '/movies', color: 'hsl(var(--primary))' },
          { label: 'Series', url: '/series', color: '#7c3aed' },
        ] as NotifButton[],
        accent: 'hsl(var(--primary))',
      },
      {
        title: 'Earn with the Agent Program',
        body: 'Sell LUO FILM subscriptions and earn real money. Join our growing Agent network!',
        icon: '/logo.png',
        url: '/agent',
        buttons: [
          { label: 'Become an Agent', url: '/agent', color: '#16a34a' },
        ] as NotifButton[],
        accent: '#16a34a',
      },
      {
        title: 'Download & Watch Offline',
        body: 'Save your favorite videos and watch them without internet, anytime, anywhere!',
        icon: '/logo.png',
        url: '/downloads',
        buttons: [
          { label: 'My Downloads', url: '/downloads', color: '#ea580c' },
        ] as NotifButton[],
        accent: '#ea580c',
      },
      {
        title: 'Live TV — Watch Now',
        body: 'Sports, news & entertainment are streaming live right now. Don\'t miss out!',
        icon: tvChannelPoster.current,
        url: '/tv-channel',
        buttons: [
          { label: 'Go Live', url: '/tv-channel', color: '#dc2626' },
        ] as NotifButton[],
        accent: '#dc2626',
      },
    ];
    let msgIdx = 0;

    const firstEngTimer = setTimeout(() => {
      const m = engagementMessages[msgIdx];
      sendBrowserNotification(m.title, m.body, m.icon, m.url, m.buttons, m.accent, 9000);
      msgIdx = (msgIdx + 1) % engagementMessages.length;

      intervalRef.current = setInterval(() => {
        const msg = engagementMessages[msgIdx];
        sendBrowserNotification(msg.title, msg.body, msg.icon, msg.url, msg.buttons, msg.accent, 9000);
        msgIdx = (msgIdx + 1) % engagementMessages.length;
      }, 12 * 60 * 1000);
    }, 8 * 60 * 1000);

    return () => {
      unsubMovies();
      unsubSeries();
      unsubTV();
      clearTimeout(tvTimer);
      clearTimeout(subTimer);
      clearTimeout(firstEngTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const requestPermission = async () => {
    return requestPushPermission();
  };

  return { requestPermission };
};

export const showWelcomeNotification = (
  username: string,
  randomPoster: string
) => {
  sendBrowserNotification(
    `Welcome, ${username}!`,
    `Thank you for joining luofilm.site! Explore all your favourite movies & series now.`,
    randomPoster,
    '/movies',
    [
      { label: 'Movies', url: '/movies', color: 'hsl(var(--primary))' },
      { label: 'Series', url: '/series', color: '#7c3aed' },
    ],
    'hsl(var(--primary))',
    10000
  );
};
