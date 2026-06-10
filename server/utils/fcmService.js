const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

// Initialize Firebase Admin SDK once (singleton pattern)
if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[FCM] Firebase Admin credentials are missing from environment variables. Push notifications are disabled.');
  } else {
    try {
      // Sanitize private key: trim whitespace, strip surrounding quotes, and replace escaped newlines
      privateKey = privateKey.trim();
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          project_id: projectId,
          client_email: clientEmail,
          private_key: privateKey,
        }),
      });
      console.log('[FCM] Firebase Admin SDK initialized successfully');
    } catch (err) {
      console.error('[FCM] Firebase Admin SDK initialization failed:', err.message);
    }
  }
}

/**
 * Send FCM push notification to one or multiple device tokens.
 *
 * @param {string[]} tokens     - Array of FCM device tokens
 * @param {string}   title      - Notification title
 * @param {string}   body       - Notification body
 * @param {object}   data       - Optional key-value payload (deep-link data etc.)
 * @returns {Promise<object>}   - Firebase multicast response summary
 */
const sendFCMNotification = async (tokens, title, body, data = {}) => {
  // Filter out empty/null tokens
  const validTokens = [...new Set(tokens.filter(Boolean))];

  if (validTokens.length === 0) {
    console.log('[FCM] No valid tokens — skipping push notification');
    return { successCount: 0, failureCount: 0 };
  }

  // FCM allows max 500 tokens per multicast message — batch if needed
  const BATCH_SIZE = 500;
  let totalSuccess = 0;
  let totalFailure = 0;

  for (let i = 0; i < validTokens.length; i += BATCH_SIZE) {
    const batch = validTokens.slice(i, i + BATCH_SIZE);

    const message = {
      tokens: batch,
      notification: {
        title,
        body,
      },
      // Android-specific: ensures notification appears even when app is in background
      android: {
        priority: 'high',
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK', // opens app on tap
          sound: 'default',
          channelId: 'donbosco-erp-notifications',
        },
      },
      // Web Push (Chrome/Edge PWA) config
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
          vibrate: [200, 100, 200],
          requireInteraction: false,
        },
        fcmOptions: {
          link: data.link || '/',
        },
      },
      // Custom data payload — accessible in service worker
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
    };

    try {
      const response = await getMessaging().sendEachForMulticast(message);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      // Log failed tokens for debugging (without blocking)
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          // These error codes mean the token is stale/unregistered — safe to ignore
          const ignorable = [
            'messaging/invalid-registration-token',
            'messaging/registration-token-not-registered',
            'messaging/invalid-argument',
          ];
          if (!ignorable.includes(errorCode)) {
            console.error(`[FCM] Token[${idx}] failed: ${errorCode}`);
          }
        }
      });
    } catch (err) {
      console.error('[FCM] Multicast send error:', err.message);
      totalFailure += batch.length;
    }
  }

  console.log(`[FCM] Sent: ✅ ${totalSuccess} success, ❌ ${totalFailure} failed`);
  return { successCount: totalSuccess, failureCount: totalFailure };
};

module.exports = { sendFCMNotification };
