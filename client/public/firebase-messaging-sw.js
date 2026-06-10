// Firebase Cloud Messaging Background Service Worker
// IMPORTANT: This file MUST be at the root (public/) — it cannot be in a subdirectory
// It handles push notifications when the app tab is CLOSED or in the BACKGROUND

// Import Firebase SDKs from CDN (compat version for service workers)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// NOTE: These values must be hardcoded here — service workers cannot access Vite env vars
// These are PUBLIC client-side values (safe to expose — they are in your HTML anyway)
firebase.initializeApp({
  apiKey: "AIzaSyAOsH2--ilpD5o26AbJvcYkjs0XnBMc9wM",
  authDomain: "donbosco-erp.firebaseapp.com",
  projectId: "donbosco-erp",
  storageBucket: "donbosco-erp.firebasestorage.app",
  messagingSenderId: "269915569279",
  appId: "1:269915569279:web:a47a9e887da794ae3a134a",
});

const messaging = firebase.messaging();

// Handle background messages (when browser tab is closed / app not focused)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background FCM message received:', payload);

  const { title, body, icon } = payload.notification || {};
  const data = payload.data || {};

  const notificationTitle = title || 'Don Bosco School';
  const notificationOptions = {
    body: body || 'You have a new notification.',
    icon: icon || '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: data.type || 'donbosco-notification', // Replaces duplicate notifications of same type
    renotify: true,
    requireInteraction: false,
    data: {
      link: data.link || '/',
      type: data.type || 'general',
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open/focus the app when user taps the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const link = event.notification.data?.link || '/';
  const urlToOpen = new URL(link, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If the app is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
