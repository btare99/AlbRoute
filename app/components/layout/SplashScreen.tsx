'use client';
import { useEffect, useState } from 'react';
import useStore from '../../store/useStore';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setIsVisible(false), 2500);
    const remove = setTimeout(() => {
      setShouldRender(false);
      useStore.getState().setSplashFinished(true);
    }, 3000);
    return () => { clearTimeout(hide); clearTimeout(remove); };
  }, []);

  if (!shouldRender) return null;

  return (
    <>
      <style>{`
        @keyframes spPop {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .sp-icon  { animation: spPop  0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        .sp-title { animation: spUp   0.45s ease 0.12s both; }
        .sp-sub   { animation: spUp   0.45s ease 0.20s both; }
        .sp-track { animation: spUp   0.45s ease 0.28s both; }
        .sp-bar   { animation: spFill 2s cubic-bezier(0.4,0,0.2,1) 0.3s both; }
        .sp-hint  { animation: spUp   0.45s ease 0.36s both; }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: '#0a0f1a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
      >
        {/* Icon */}
        <div
          className="sp-icon"
          style={{
            width: 80,
            height: 80,
            borderRadius: 22,
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}
        >
          <img
            src="/logo.png"
            alt="Urbani Im Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Text */}
        <h1
          className="sp-title"
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: '#ffffff',
            margin: '0 0 6px',
            letterSpacing: '-0.3px',
          }}
        >
          Urbani Im
        </h1>
        <p
          className="sp-sub"
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.5)',
            margin: '0 0 40px',
          }}
        >
          Tirana Transit System
        </p>

        {/* Progress bar */}
        <div
          className="sp-track"
          style={{
            width: 160,
            height: 3,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 99,
            overflow: 'hidden',
          }}
        >
          <div
            className="sp-bar"
            style={{
              height: '100%',
              background: '#2563eb',
              borderRadius: 99,
            }}
          />
        </div>

        <p
          className="sp-hint"
          style={{
            marginTop: 16,
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          Loading routes…
        </p>
      </div>
    </>
  );
}