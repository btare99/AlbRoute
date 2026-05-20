'use client';

/**
 * Premium Skeleton Loading Components
 * iOS 18 style shimmer with dark-mode glassmorphic design
 */

import React from 'react';

/* ─────────────────────────────────────────────
   BASE SKELETON BLOCK
   ───────────────────────────────────────────── */
export function Skeleton({
  width,
  height,
  borderRadius = 12,
  style,
  className,
}: {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`skeleton-shimmer ${className || ''}`}
      style={{
        width: width ?? '100%',
        height: height ?? 16,
        borderRadius,
        background: 'rgba(255,255,255,0.04)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   SKELETON CIRCLE (avatar, icon placeholders)
   ───────────────────────────────────────────── */
export function SkeletonCircle({
  size = 48,
  style,
}: {
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

/* ─────────────────────────────────────────────
   SKELETON TEXT (multi-line paragraphs)
   ───────────────────────────────────────────── */
export function SkeletonText({
  lines = 3,
  gap = 10,
  lineHeight = 14,
  lastLineWidth = '60%',
  style,
}: {
  lines?: number;
  gap?: number;
  lineHeight?: number;
  lastLineWidth?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={lineHeight}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          borderRadius={7}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PROFILE VIEW SKELETON
   ───────────────────────────────────────────── */
export function ProfileSkeleton() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Header Card */}
      <div style={{ padding: '30px 20px 20px 20px' }}>
        <div style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '15px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '16px',
        }}>
          <Skeleton width={56} height={56} borderRadius={18} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width="60%" height={18} borderRadius={8} />
            <Skeleton width="40%" height={13} borderRadius={6} />
          </div>
          <SkeletonCircle size={32} />
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '16px', borderRadius: '14px',
          }}>
            <Skeleton width={40} height={40} borderRadius={12} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton width={`${50 + Math.random() * 30}%`} height={15} borderRadius={7} />
              {i === 2 && <Skeleton width="35%" height={12} borderRadius={6} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   BUS TRACKER SKELETON
   ───────────────────────────────────────────── */
export function BusTrackerSkeleton() {
  return (
    <div style={{
      minHeight: '100%', background: 'var(--bg-dark)', color: '#fff',
      paddingBottom: 110,
    }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton width={200} height={26} borderRadius={8} />
            <Skeleton width={120} height={24} borderRadius={99} />
          </div>
        </div>
        {/* Search bar */}
        <Skeleton width="100%" height={48} borderRadius={16} />
      </div>

      {/* Route chips */}
      <div style={{ display: 'flex', gap: 8, padding: '0 20px', overflow: 'hidden' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} width={80} height={38} borderRadius={14} />
        ))}
      </div>

      {/* Route hero card */}
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{
          borderRadius: 24, padding: 18,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
            <Skeleton width={48} height={48} borderRadius={16} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton width="70%" height={16} borderRadius={7} />
              <Skeleton width="45%" height={12} borderRadius={6} />
            </div>
            <Skeleton width={50} height={36} borderRadius={12} />
          </div>
          {/* Stop dots */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '8px 0' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <React.Fragment key={i}>
                <SkeletonCircle size={i === 0 || i === 6 ? 12 : 7} />
                {i < 6 && <Skeleton width={40} height={2} borderRadius={1} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Bus cards */}
      <div style={{ padding: '20px 20px 0' }}>
        <Skeleton width={160} height={11} borderRadius={6} style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              borderRadius: 20, padding: 16,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Skeleton width={48} height={48} borderRadius={16} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Skeleton width={100} height={17} borderRadius={7} />
                    <Skeleton width={60} height={20} borderRadius={6} />
                  </div>
                  <Skeleton width="80%" height={13} borderRadius={6} />
                  <Skeleton width="65%" height={13} borderRadius={6} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <Skeleton width={40} height={26} borderRadius={7} />
                  <Skeleton width={50} height={11} borderRadius={5} />
                </div>
              </div>
              <Skeleton width="100%" height={4} borderRadius={99} style={{ marginTop: 14 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUBSCRIPTION PACKAGES SKELETON
   ───────────────────────────────────────────── */
export function PackagesSkeleton() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0a0f1a', color: '#fff', paddingBottom: 120,
    }}>
      {/* Header */}
      <div style={{ padding: '24px 20px' }}>
        <Skeleton width={180} height={26} borderRadius={8} />
        <Skeleton width={140} height={13} borderRadius={6} style={{ marginTop: 8 }} />
      </div>

      {/* Hero */}
      <div style={{ padding: '32px 24px 16px' }}>
        <Skeleton width={240} height={32} borderRadius={10} />
        <Skeleton width={200} height={15} borderRadius={7} style={{ marginTop: 10 }} />
      </div>

      {/* Package cards */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1.5px solid rgba(255,255,255,0.05)',
            borderRadius: 28, padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton width={150} height={18} borderRadius={8} />
                <Skeleton width={80} height={11} borderRadius={5} />
              </div>
              <Skeleton width={60} height={30} borderRadius={12} />
            </div>
            <Skeleton width="90%" height={13} borderRadius={6} style={{ marginBottom: 16 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} width={`${60 + Math.random() * 30}%`} height={11} borderRadius={5} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUBSCRIPTION VIEW SKELETON (my subscription card)
   ───────────────────────────────────────────── */
export function SubscriptionSkeleton() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-dark)', color: '#fff',
    }}>
      {/* Nav */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Skeleton width={38} height={38} borderRadius={12} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Skeleton width={140} height={16} borderRadius={7} />
          <Skeleton width={90} height={12} borderRadius={5} />
        </div>
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Skeleton width="100%" height={280} borderRadius={34} />
        <Skeleton width={300} height={13} borderRadius={6} style={{ marginTop: 28 }} />
        <Skeleton width={200} height={36} borderRadius={100} style={{ marginTop: 12 }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PASSES VIEW SKELETON
   ───────────────────────────────────────────── */
export function PassesSkeleton() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-dark)', color: '#fff',
    }}>
      {/* Nav */}
      <div style={{
        padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16,
        borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0,
      }}>
        <Skeleton width={38} height={38} borderRadius={12} />
        <Skeleton width={140} height={18} borderRadius={8} />
      </div>

      {/* Tabs */}
      <div style={{ padding: '20px 20px 0', display: 'flex', gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} width={140} height={44} borderRadius={20} />
        ))}
      </div>

      {/* Card */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <Skeleton width="100%" height={280} borderRadius={34} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EDIT PROFILE SKELETON
   ───────────────────────────────────────────── */
export function EditProfileSkeleton() {
  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Skeleton width={36} height={36} borderRadius={10} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Skeleton width={140} height={18} borderRadius={8} />
          <Skeleton width={100} height={12} borderRadius={6} />
        </div>
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <Skeleton width={84} height={84} borderRadius={28} style={{ marginBottom: 16 }} />
        <Skeleton width={120} height={18} borderRadius={8} />
        <Skeleton width={180} height={13} borderRadius={6} style={{ marginTop: 4 }} />
      </div>

      {/* Form cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
          padding: 24, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <Skeleton width={130} height={14} borderRadius={6} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton width={80} height={11} borderRadius={5} />
              <Skeleton width="100%" height={46} borderRadius={12} />
            </div>
          ))}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
          padding: 24, borderRadius: 24, display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <Skeleton width={110} height={14} borderRadius={6} />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton width={60} height={11} borderRadius={5} />
              <Skeleton width="100%" height={46} borderRadius={12} />
            </div>
          ))}
        </div>

        <Skeleton width="100%" height={48} borderRadius={14} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FAVORITES SKELETON
   ───────────────────────────────────────────── */
export function FavoritesSkeleton() {
  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 15 }}>
        <Skeleton width={38} height={38} borderRadius={12} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Skeleton width={80} height={16} borderRadius={7} />
          <Skeleton width={120} height={12} borderRadius={5} />
        </div>
        <Skeleton width={70} height={26} borderRadius={99} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
            padding: '12px 8px', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <SkeletonCircle size={13} />
            <Skeleton width={30} height={14} borderRadius={6} />
            <Skeleton width={40} height={10} borderRadius={4} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 8, padding: 6,
        background: 'rgba(255,255,255,0.03)', borderRadius: 16, marginBottom: 28,
        border: '0.5px solid rgba(255,255,255,0.08)',
      }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={40} borderRadius={12} style={{ flex: 1 }} />
        ))}
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            background: 'rgba(255,255,255,0.02)', borderRadius: 14,
            border: '0.5px solid rgba(255,255,255,0.07)',
          }}>
            <Skeleton width={38} height={38} borderRadius={10} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Skeleton width="60%" height={14} borderRadius={6} />
              <Skeleton width="40%" height={11} borderRadius={5} />
            </div>
            <Skeleton width={32} height={32} borderRadius={8} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHECKOUT SKELETON
   ───────────────────────────────────────────── */
export function CheckoutSkeleton() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-dark)', color: '#fff', padding: '24px 20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 32 }}>
        <Skeleton width={38} height={38} borderRadius={12} />
        <Skeleton width={160} height={18} borderRadius={8} />
      </div>

      {/* Package Summary Card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24, padding: 24, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Skeleton width={48} height={48} borderRadius={16} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton width="65%" height={18} borderRadius={7} />
            <Skeleton width="40%" height={12} borderRadius={5} />
          </div>
          <Skeleton width={70} height={28} borderRadius={10} />
        </div>
        <Skeleton width="100%" height={1} style={{ marginBottom: 16 }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <Skeleton width="40%" height={14} borderRadius={6} />
            <Skeleton width="25%" height={14} borderRadius={6} />
          </div>
        ))}
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton width={100} height={11} borderRadius={5} />
            <Skeleton width="100%" height={48} borderRadius={14} />
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <Skeleton width="100%" height={52} borderRadius={16} style={{ marginTop: 24 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAP VIEW SKELETON (for initial map load)
   ───────────────────────────────────────────── */
export function MapSkeleton() {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'var(--bg-dark)',
    }}>
      {/* Map background */}
      <Skeleton
        width="100%"
        height="100%"
        borderRadius={0}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Search bar overlay */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10,
      }}>
        <Skeleton width="100%" height={52} borderRadius={16} />
      </div>

      {/* Floating action buttons */}
      <div style={{
        position: 'absolute', bottom: 120, right: 16, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <Skeleton width={44} height={44} borderRadius={14} />
        <Skeleton width={44} height={44} borderRadius={14} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TRIP PLANNER SKELETON
   ───────────────────────────────────────────── */
export function TripPlannerSkeleton() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-dark)', color: '#fff',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 20px 10px 20px',
        display: 'flex', alignItems: 'center', gap: '15px',
      }}>
        <Skeleton width={38} height={38} borderRadius={12} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Skeleton width="140px" height={16} borderRadius={7} />
          <Skeleton width="90px" height={12} borderRadius={5} />
        </div>
      </div>

      {/* Main Form content */}
      <div style={{
        flex: 1, padding: '15px 20px',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '20px 16px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Vertical connecting line */}
          <div style={{
            position: 'absolute',
            left: '27.5px',
            top: '36px',
            bottom: '36px',
            width: '2px',
            background: 'rgba(255,255,255,0.08)',
          }} />

          {/* First input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <SkeletonCircle size={24} />
            <Skeleton width="60%" height={18} borderRadius={7} />
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginLeft: '32px' }} />

          {/* Second input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <SkeletonCircle size={24} />
            <Skeleton width="50%" height={18} borderRadius={7} />
          </div>

          {/* Swap circle button */}
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            <SkeletonCircle size={34} />
          </div>
        </div>

        {/* My location shortcut */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Skeleton width={100} height={14} borderRadius={6} />
        </div>

        {/* Submit button */}
        <Skeleton width="100%" height={48} borderRadius={12} style={{ marginTop: '10px' }} />

        {/* Suggested routes section */}
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Skeleton width={120} height={12} borderRadius={5} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton width={90} height={32} borderRadius={8} />
            <Skeleton width={110} height={32} borderRadius={8} />
            <Skeleton width={95} height={32} borderRadius={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

