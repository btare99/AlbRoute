'use client';
import { useState, useRef, useEffect } from 'react';

interface SwipeBackViewProps {
  children: React.ReactNode;
  onBack: () => void;
  threshold?: number;
  edgeWidth?: number;
}

export default function SwipeBackView({ children, onBack, threshold = 120, edgeWidth = 40 }: SwipeBackViewProps) {
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
    
    // Strictly horizontal: ignore if dragging left or if it seems like a vertical scroll
    if (diff > 0) {
      setCurrentX(diff);
      // Prevent scrolling while swiping back
      if (diff > 10 && e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (startX === null) return;
    
    const velocity = currentX; // Simple proxy for velocity
    if (currentX > threshold || velocity > 200) {
      // Complete the slide out animation
      setCurrentX(screenWidth);
      setIsSwiping(false);
      setTimeout(() => {
        onBack();
      }, 200);
    } else {
      // Snap back
      setIsSwiping(false);
      setCurrentX(0);
    }
    setStartX(null);
  };

  // Calculate opacity for the darkened background based on progress
  const progress = Math.min(currentX / screenWidth, 1);
  const backdropOpacity = 0.5 * (1 - progress);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 5000,
      background: '#000',
      overflow: 'hidden',
      touchAction: 'pan-y' // Allow vertical scroll but we control horizontal
    }}>
      {/* Darkened Backdrop / Previous Page Simulation */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg-dark)',
        opacity: backdropOpacity,
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Sliding Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          height: '100%',
          width: '100%',
          position: 'relative',
          zIndex: 2,
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
