'use client';
import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#0a0f1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
      transition: 'all 0.5s ease-in-out',
    }}>
      <div style={{
        position: 'relative',
        width: '120px',
        height: '120px',
        marginBottom: '24px',
      }}>
        {/* Pulsing rings */}
        <div style={{
          position: 'absolute',
          inset: '-20px',
          border: '2px solid var(--primary)',
          borderRadius: '50%',
          opacity: 0,
          animation: 'splash-pulse 2s infinite'
        }} />
        <div style={{
          position: 'absolute',
          inset: '-10px',
          border: '2px solid var(--primary)',
          borderRadius: '50%',
          opacity: 0,
          animation: 'splash-pulse 2s infinite 0.5s'
        }} />

        {/* Logo */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          animation: 'splash-logo 1.5s ease-out'
        }}>
          <img
            src="/logo-Urban.png"
            alt="AlbRoute Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '29px' }}
          />
        </div>
      </div>

      <h1 style={{
        fontSize: '28px',
        fontWeight: '900',
        color: '#fff',
        letterSpacing: '1px',
        marginBottom: '8px',
        animation: 'fadeIn 0.8s ease-out 0.3s both'
      }}>
        Urbani Im
      </h1>
      <p style={{
        fontSize: '14px',
        color: 'var(--text-muted)',
        animation: 'fadeIn 0.8s ease-out 0.5s both'
      }}>
        Tirana Transit System
      </p>

      {/* Loading bar */}
      <div style={{
        width: '200px',
        height: '4px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
        marginTop: '40px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
          width: '50%',
          animation: 'splash-loading 1.5s infinite linear'
        }} />
      </div>

      <style jsx>{`
        @keyframes splash-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes splash-logo {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splash-loading {
          0% { left: -50%; }
          100% { left: 100%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
