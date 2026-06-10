import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Register Service Worker for PWA (auto-updates in background)
const updateSW = registerSW({
  onNeedRefresh() {
    // New content available - show a non-intrusive toast or auto-update
    if (confirm('New version of Don Bosco School ERP is available. Update now?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('[PWA] App is ready for offline use.');
  },
  onRegistered(registration) {
    console.log('[PWA] Service Worker registered successfully.');
  },
  onRegisterError(error) {
    console.error('[PWA] Service Worker registration failed:', error);
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
