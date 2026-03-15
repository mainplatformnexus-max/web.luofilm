const FCM_VAPID_KEY = "BFjo2j1VFoVMApXtGuMP-TovW6Ut0sPpx7DOZQlRUnvluHgORSCtZ7p16fsQ02r6xXkLBENR9nuUurWrue_BARU";

let swRegistration: ServiceWorkerRegistration | null = null;

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    swRegistration = reg;
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NAVIGATE' && event.data?.url) {
        window.location.href = event.data.url;
      }
    });
    return reg;
  } catch (e) {
    console.warn('SW registration failed:', e);
    return null;
  }
};

export const getSwRegistration = () => swRegistration;

export const requestPushPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

export const showDeviceNotification = async (
  title: string,
  body: string,
  icon?: string,
  url?: string,
  tag?: string
): Promise<void> => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const reg = swRegistration || (await registerServiceWorker());

  if (reg && reg.active) {
    try {
      await reg.showNotification(title, {
        body,
        icon: icon || '/logo.png',
        badge: '/logo.png',
        tag: tag || 'luo-film',
        data: { url: url || '/' },
        vibrate: [200, 100, 200],
      } as NotificationOptions);
      return;
    } catch (e) {
    }
  }

  try {
    const notif = new Notification(title, {
      body,
      icon: icon || '/logo.png',
      badge: '/logo.png',
      tag: tag || 'luo-film',
    });
    notif.onclick = () => {
      window.focus();
      if (url) window.location.href = url;
      notif.close();
    };
  } catch (e) {}
};

export const initFCM = async (userId?: string) => {
  try {
    const { getMessaging, getToken, onMessage } = await import('firebase/messaging');
    const { default: app } = await import('@/lib/firebase');
    const { db } = await import('@/lib/firebase');
    const { doc, setDoc } = await import('firebase/firestore');

    const messaging = getMessaging(app);

    const reg = swRegistration || (await registerServiceWorker());
    if (!reg) return;

    const token = await getToken(messaging, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: reg,
    });

    if (token && userId) {
      await setDoc(doc(db, 'fcmTokens', userId), {
        token,
        userId,
        updatedAt: new Date().toISOString(),
        platform: 'web',
      }, { merge: true });
    }

    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'LUO FILM';
      const body = payload.notification?.body || '';
      const icon = payload.notification?.icon || '/logo.png';
      const url = payload.data?.url || '/';
      showDeviceNotification(title, body, icon, url, payload.data?.tag);
    });
  } catch (e) {
  }
};
