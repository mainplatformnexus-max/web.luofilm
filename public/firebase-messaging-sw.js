importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB_ofBGMVg3xwSkvsl0FO9XPaPxR5zxFSE",
  authDomain: "luo-film.firebaseapp.com",
  projectId: "luo-film",
  storageBucket: "luo-film.firebasestorage.app",
  messagingSenderId: "273478932519",
  appId: "1:273478932519:web:9a21063adcb63e6c411602",
  measurementId: "G-HG60VRE1RY"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification?.title || 'LUO FILM';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update from LUO FILM.',
    icon: payload.notification?.icon || '/logo.png',
    badge: '/logo.png',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: payload.data?.tag || 'luo-film-notification',
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE', url });
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});
