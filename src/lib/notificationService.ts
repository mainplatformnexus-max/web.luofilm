export interface NotificationPayload {
  title: string;
  options?: NotificationOptions & {
    poster?: string;
    cta?: string;
  };
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = async (payload: NotificationPayload) => {
  if (!('Notification' in window)) return;

  const hasPermission = Notification.permission === 'granted' || 
    await requestNotificationPermission();

  if (!hasPermission) return;

  try {
    const notification = new Notification(payload.title, {
      ...payload.options,
      badge: '/logo.png',
      tag: payload.title.replace(/\s+/g, '-'),
    });

    notification.onclick = () => {
      window.focus();
      window.parent.focus();
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
};

export const showContentNotification = async (
  contentType: 'movie' | 'series' | 'episode' | 'news' | 'channel' | 'adult',
  contentTitle: string,
  posterUrl?: string
) => {
  const typeLabels = {
    movie: 'New Movie',
    series: 'New Series',
    episode: 'New Episode',
    news: 'News',
    channel: 'New Channel',
    adult: 'New 18+ Content',
  };

  return showNotification({
    title: `${typeLabels[contentType]}: ${contentTitle}`,
    options: {
      body: 'Check it out now!',
      icon: posterUrl,
      poster: posterUrl,
      cta: 'Watch Now',
      badge: '/logo.png',
    },
  });
};

export const showFreeSubscriptionNotification = (username: string) => {
  return showNotification({
    title: `Welcome, ${username}!`,
    options: {
      body: 'You have stayed 10 minutes on our website. Enjoy 2 hours of free premium access!',
      icon: '/logo.png',
      cta: 'Start Watching',
    },
  });
};
