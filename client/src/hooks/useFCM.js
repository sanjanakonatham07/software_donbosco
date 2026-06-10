import { useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * useFCM — Custom hook for Firebase Cloud Messaging
 *
 * Call this inside your App with the current user object.
 * It automatically:
 *  1. Requests notification permission from the browser
 *  2. Gets FCM token for this device
 *  3. Sends token to backend (POST /api/student/fcm-token)
 *  4. Listens for foreground messages and shows a toast
 *
 * @param {object|null} user        - Current logged-in user from AuthContext
 * @param {string|null} token       - JWT auth token for API calls
 * @param {function}    apiRequest  - apiRequest helper from AuthContext
 * @param {function}    showToast   - Toast notification function (optional)
 */
const useFCM = (user, token, apiRequest, showToast) => {
  const initialized = useRef(false);

  useEffect(() => {
    console.log('[FCM Debug] Hook triggered:', {
      hasUser: !!user,
      role: user?.role,
      initialized: initialized.current,
      VAPID_KEY: VAPID_KEY,
      isSecureContext: window.isSecureContext,
      hasNotification: 'Notification' in window
    });

    // Only run for logged-in students
    if (!user || user.role !== 'student' || initialized.current) return;

    // FCM requires a valid VAPID key and HTTPS (or localhost)
    if (!VAPID_KEY || VAPID_KEY === 'PASTE_YOUR_VAPID_KEY_HERE') {
      console.warn('[FCM] VAPID key not configured. Push notifications disabled.');
      return;
    }

    // FCM only works in secure contexts
    if (!('Notification' in window)) {
      console.warn('[FCM] Notifications not supported in this browser');
      return;
    }

    const initFCM = async () => {
      try {
        initialized.current = true;

        // Step 1: Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('[FCM] Notification permission denied by user');
          return;
        }

        // Step 2: Initialize Firebase app (singleton)
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        const messaging = getMessaging(app);

        // Step 3: Get active PWA service worker registration
        let swRegistration;
        if ('serviceWorker' in navigator) {
          try {
            swRegistration = await navigator.serviceWorker.ready;
            console.log('[FCM] Active PWA SW registration obtained:', swRegistration.active?.scriptURL);
          } catch (swErr) {
            console.error('[FCM] Failed to get active service worker registration:', swErr);
          }
        }

        // Step 4: Get FCM device token
        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        });

        if (!fcmToken) {
          console.warn('[FCM] No FCM token received. Check VAPID key and service worker.');
          return;
        }

        console.log('[FCM] Token obtained:', fcmToken.substring(0, 20) + '...');

        // Step 5: Save token to backend
        try {
          await apiRequest('/student/fcm-token', {
            method: 'POST',
            body: JSON.stringify({ token: fcmToken }),
          });
          console.log('[FCM] Token registered with backend ✅');
        } catch (apiErr) {
          // Non-fatal — token can be re-registered on next login
          console.error('[FCM] Failed to register token with backend:', apiErr.message);
        }

        // Step 6: Handle FOREGROUND messages (app is open)
        onMessage(messaging, (payload) => {
          console.log('[FCM] Foreground message received:', payload);

          const title = payload.notification?.title || 'Don Bosco School';
          const body = payload.notification?.body || 'You have a new notification.';

          // Show toast if available, otherwise fall back to native notification
          if (showToast && typeof showToast === 'function') {
            showToast(`${title}: ${body}`, 'info');
          } else {
            // Fallback: show browser notification
            new Notification(title, {
              body,
              icon: '/icon-192x192.png',
              badge: '/icon-96x96.png',
            });
          }
        });
      } catch (err) {
        console.error('[FCM] Initialization error:', err.message);
        initialized.current = false; // Allow retry on next render
      }
    };

    initFCM();
  }, [user?.role, user?._id]); // Re-run if user changes
};

export default useFCM;
