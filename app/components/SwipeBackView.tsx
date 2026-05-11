'use client';
import { useState, useRef, useEffect } from 'react';

interface SwipeBackViewProps {
  children: React.ReactNode;
  onBack: () => void;
  threshold?: number;
  edgeWidth?: number;
}

export default function SwipeBackView({ children, onBack, threshold = 100, edgeWidth = 40 }: SwipeBackViewProps) {
  const [startX, setStartX] = useState<number | null>(null);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    // Only start swipe if it originates from the left edge
    if (touch.clientX < edgeWidth) {
      setStartX(touch.clientX);
      setIsSwiping(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX === null || !isSwiping) return;
    const touch = e.touches[0];
    const diff = touch.clientX - startX;
    
    // Only allow positive translation (dragging to the right)
    if (diff > 0) {
      setCurrentX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (startX === null) return;
    
    if (currentX > threshold) {
      // Trigger back action
      onBack();
    }
    
    // Reset state
    setStartX(null);
    setCurrentX(0);
    setIsSwiping(false);
  };

  return (
    <div
      ref={viewRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        transform: `translateX(${currentX}px)`,
        transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        willChange: 'transform',
        overflow: 'hidden'
      }}
    >
      {children}
      
      {/* Visual indicator / Overlay shadow for swipe feel */}
      {currentX > 0 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: -20,
          bottom: 0,
          width: 20,
          background: 'linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.2))',
          pointerEvents: 'none'
        }} />
      )}
    </div>
  );
}
