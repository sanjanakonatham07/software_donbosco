import { useState, useEffect } from 'react';

/**
 * usePWAInstall
 * 
 * A custom React hook to manage the PWA "Add to Home Screen" prompt.
 * 
 * Returns:
 *   - installPrompt: boolean - whether the install button should be shown
 *   - handleInstall: () => void - call this when the user clicks "Install"
 *   - handleDismiss: () => void - call this to hide the prompt
 *   - isInstalled: boolean - whether the app is already installed as a PWA
 */
const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running as standalone (installed PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return; // Don't show install prompt if already installed
    }

    // Listen for the browser's install prompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // Prevent automatic prompt
      setDeferredPrompt(e);
      setInstallPrompt(true); // Signal that we can show install UI
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); // Show the native install dialog
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setInstallPrompt(false);
  };

  const handleDismiss = () => {
    setInstallPrompt(false);
  };

  return { installPrompt, handleInstall, handleDismiss, isInstalled };
};

export default usePWAInstall;
