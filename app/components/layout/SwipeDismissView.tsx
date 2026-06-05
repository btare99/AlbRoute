'use client';
import { useState, useRef, useEffect } from 'react';

interface SwipeDismissViewProps {
  children: React.ReactNode;
  background?: React.ReactNode;
  onDismiss: () => void;
  threshold?: number;
  edgeWidth?: number;
  direction?: 'horizontal' | 'vertical';
  className?: string;
  isOpen?: boolean;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  dragHandleClass?: string;
}

export default function SwipeDismissView({
  children,
  background,
  onDismiss,
  threshold = 120,
  edgeWidth = 40,
  direction = 'horizontal',
  className = '',
  isOpen = true,
  isFixed = true,
  onSwipeUp,
  onSwipeDown,
  dragHandleClass,
  style = {}
}: SwipeDismissViewProps & { isFixed?: boolean, style?: React.CSSProperties }) {
  const [startPos, setStartPos] = useState<number | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [dimension, setDimension] = useState(typeof window !== 'undefined' ? (direction === 'horizontal' ? window.innerWidth : window.innerHeight) : 400);

  useEffect(() => {
    const handleResize = () => setDimension(direction === 'horizontal' ? window.innerWidth : window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [direction]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // If dragHandleClass is provided, only allow swipe if touch started on handle
    if (dragHandleClass) {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${dragHandleClass}`)) return;
    }

    const touch = e.touches[0];
    const pos = direction === 'horizontal' ? touch.clientX : touch.clientY;

    if (direction === 'horizontal') {
      if (pos < edgeWidth || !isFixed) {
        setStartPos(pos);
        setIsSwiping(true);
      }
    } else {
      setStartPos(pos);
      setIsSwiping(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startPos === null || !isSwiping) return;
    const touch = e.touches[0];
    const pos = direction === 'horizontal' ? touch.clientX : touch.clientY;
    const diff = pos - startPos;

    if (diff > 0) {
      setCurrentOffset(diff);
      if (diff > 10 && e.cancelable) {
        e.preventDefault();
      }
    } else if (diff < 0 && direction === 'vertical' && onSwipeUp) {
      setCurrentOffset(diff);
      if (Math.abs(diff) > 10 && e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (startPos === null) return;

    if (currentOffset < -50 && direction === 'vertical' && onSwipeUp) {
      onSwipeUp();
      setIsSwiping(false);
      setCurrentOffset(0);
    } else if (currentOffset > threshold) {
      setCurrentOffset(dimension);
      setIsSwiping(false);
      setTimeout(() => {
        onDismiss();
      }, 200);
    } else if (currentOffset > 50 && direction === 'vertical' && onSwipeDown) {
      onSwipeDown();
      setIsSwiping(false);
      setCurrentOffset(0);
    } else {
      setIsSwiping(false);
      setCurrentOffset(0);
    }
    setStartPos(null);
  };

  const progress = Math.min(currentOffset / dimension, 1);
  const backdropOpacity = 0.4 * (1 - progress);

  const bgTranslate = - (dimension * 0.2) * (1 - progress);

  const containerStyle: React.CSSProperties = {
    position: isFixed ? 'fixed' : 'absolute',
    inset: isFixed ? 0 : 'auto',
    bottom: isFixed ? 0 : 0,
    left: isFixed ? 0 : 0,
    right: isFixed ? 0 : 0,
    zIndex: isFixed ? 5000 : 1001,
    background: (isFixed && background) ? '#000' : 'transparent',
    overflow: 'visible',
    touchAction: direction === 'horizontal' ? 'pan-y' : 'pan-x',
    pointerEvents: isOpen ? 'auto' : 'none',
    ...style
  };

  const transform = direction === 'horizontal'
    ? `translateX(${currentOffset}px)`
    : `translateY(${currentOffset}px)`;

  const bgTransform = direction === 'horizontal'
    ? `translateX(${bgTranslate}px)`
    : `translateY(${bgTranslate}px)`;

  return (
    <div style={containerStyle} className={className}>
      {background && isFixed && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          transform: bgTransform,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          willChange: 'transform',
          pointerEvents: 'none'
        }}>
          {background}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            opacity: backdropOpacity,
            zIndex: 2
          }} />
        </div>
      )}

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          height: isFixed ? '100%' : 'auto',
          width: '100%',
          position: 'relative',
          zIndex: 3,
          background: isFixed ? 'var(--bg-dark)' : 'transparent',
          transform: transform,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          boxShadow: (currentOffset > 0 && isFixed) ? (direction === 'horizontal' ? '-10px 0 30px rgba(0,0,0,0.5)' : '0 -10px 30px rgba(0,0,0,0.5)') : 'none',
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
}
