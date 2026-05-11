'use client';
import { useState, useRef, useEffect } from 'react';

interface SwipeBackViewProps {
  children: React.ReactNode;
  background?: React.ReactNode;
  onBack: () => void;
  threshold?: number;
  edgeWidth?: number;
}

export default function SwipeBackView({ children, background, onBack, threshold = 120, edgeWidth = 40 }: SwipeBackViewProps) {
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 400);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientX < edgeWidth) {
      setStartX(touch.clientX);
      setIsSwiping(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === null || !isSwiping) return;
    const touch = e.touches[0];
    const diff = touch.clientX - startX;
    
    if (diff > 0) {
      setCurrentX(diff);
      if (diff > 10 && e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (startX === null) return;
    
    if (currentX > threshold) {
      setCurrentX(screenWidth);
      setIsSwiping(false);
      setTimeout(() => {
        onBack();
      }, 200);
    } else {
      setIsSwiping(false);
      setCurrentX(0);
    }
    setStartX(null);
  };

  const progress = Math.min(currentX / screenWidth, 1);
  const backdropOpacity = 0.4 * (1 - progress);
  // Parallax: background moves from -30% to 0%
  const bgTranslate = - (screenWidth * 0.2) * (1 - progress);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 5000,
      background: '#000',
      overflow: 'hidden',
      touchAction: 'pan-y'
    }}>
      {/* Real Previous Page Background */}
      {background && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          transform: `translateX(${bgTranslate}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          willChange: 'transform',
          pointerEvents: 'none' // Don't interact with background during swipe
        }}>
          {background}
          {/* Dimmer overlay on background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            opacity: backdropOpacity,
            zIndex: 2
          }} />
        </div>
      )}

      {/* Sliding Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          zIndex: 3,
          background: 'var(--bg-dark)',
          transform: `translateX(${currentX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          boxShadow: currentX > 0 ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
}
