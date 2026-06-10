import React, { useState } from 'react';
import usePWAInstall from '../hooks/usePWAInstall';

/**
 * PWAInstallBanner
 * 
 * A subtle, dismissible install banner shown to users who can install the PWA.
 * Appears as a sticky bottom banner on mobile and a floating card on desktop.
 */
const PWAInstallBanner = () => {
  const { installPrompt, handleInstall, handleDismiss, isInstalled } = usePWAInstall();
  const [visible, setVisible] = useState(true);

  if (!installPrompt || isInstalled || !visible) return null;

  const onDismiss = () => {
    setVisible(false);
    handleDismiss();
  };

  return (
    <div
      id="pwa-install-banner"
      role="banner"
      aria-label="Install Don Bosco School App"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: '#ffffff',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        boxShadow: '0 20px 40px rgba(30, 58, 138, 0.4), 0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: '360px',
        width: 'calc(100vw - 3rem)',
        animation: 'pwaSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '44px',
        height: '44px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: '0.875rem',
          marginBottom: '0.2rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          Install Don Bosco School
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.3,
        }}>
          Add to your home screen for faster access
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={onDismiss}
          aria-label="Dismiss install prompt"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.8)',
            borderRadius: '8px',
            padding: '0.4rem 0.6rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
        >
          Later
        </button>
        <button
          onClick={handleInstall}
          id="pwa-install-btn"
          aria-label="Install app"
          style={{
            background: '#ffffff',
            border: 'none',
            color: '#1e3a8a',
            borderRadius: '8px',
            padding: '0.4rem 0.85rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#eff6ff';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#ffffff';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Install
        </button>
      </div>

      <style>{`
        @keyframes pwaSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 480px) {
          #pwa-install-banner {
            bottom: 0 !important;
            right: 0 !important;
            border-radius: 14px 14px 0 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PWAInstallBanner;
