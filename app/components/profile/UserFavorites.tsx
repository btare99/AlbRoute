'use client';
import { useState } from 'react';
import { IonIcon } from '@/app/components/common/IonIcon';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../../store/useStore';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  trashOutline,
  busOutline,
  arrowForwardOutline,
  locationOutline,
  navigateOutline,
  notificationsOutline,
  notificationsOffOutline,
  timeOutline,
  starOutline,
  shieldOutline,
  checkmarkCircleOutline,
  trendingUpOutline,
  addOutline,
  alertCircleOutline,
  closeOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { translations } from '../../store/translations';

// ── Types ────────────────────────────────────────────────────────────────────
interface SavedRoute {
  id: string;
  name: string;
  color: string;
  stops?: string[];
}

interface SavedStop {
  id: string | number;
  name: string;
}

// ── Delete confirm modal (Animated with Framer Motion) ────────────────────────
function ConfirmModal({ label, onConfirm, onCancel, t }: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
  t: Record<string, string>;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 15 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        style={{
          background: 'rgba(20, 25, 40, 0.65)', border: '0.5px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(40px) saturate(190%)',
          WebkitBackdropFilter: 'blur(40px) saturate(190%)',
          borderRadius: '20px', padding: '24px', maxWidth: '320px', width: '100%',
          display: 'flex', flexDirection: 'column', gap: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IonIcon icon={alertCircleOutline} style={{ fontSize: 18, color: '#ef4444' }} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff', margin: 0 }}>
              {t.fav_confirm_title || 'Fshi nga të preferuarat?'}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>
              {label}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <IonIcon icon={closeOutline} style={{ fontSize: 14, marginRight: 6 }} />
            {t.fav_cancel || 'Anulo'}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.12)', border: '0.5px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <IonIcon icon={trashOutline} style={{ fontSize: 14, marginRight: 6 }} />
            {t.fav_delete || 'Fshi'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Framer Motion Entrance Variants ──────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 24, opacity: 0, scale: 0.97 },
  show: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 14
    }
  }
};

export default function UserFavorites() {
  const savedRoutes: SavedRoute[] = useStore((state: any) => state.savedRoutes) || [];
  const removeSavedRoute = useStore((state: any) => state.removeSavedRoute);
  const savedStops: SavedStop[] = useStore((state: any) => state.savedStops) || [];
  const removeSavedStop = useStore((state: any) => state.removeSavedStop);
  const setView = useStore((state: any) => state.setView);
  const setSelectedRoute = useStore((state: any) => state.setSelectedRoute);
  const setTripFrom = useStore((state: any) => state.setTripFrom);
  const addNotification = useStore((state: any) => state.addNotification);
  const buses = useStore((state: any) => state.buses) || [];
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;
  const recentRouteId = useStore((state: any) => state.recentRouteId);
  const currentCoverIndex = useStore((state: any) => state.currentCoverIndex);

  const [notified, setNotified] = useState<Record<string, boolean>>({});
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string; type: 'route' | 'stop' } | null>(null);

  const totalFavorites = savedRoutes.length + savedStops.length;
  const activeRoutesCount = savedRoutes.filter(r =>
    buses.some((b: any) => b.routeId === r.id)
  ).length;

  const toggleNotify = (id: string, name: string) => {
    setNotified(prev => {
      const next = { ...prev, [id]: !prev[id] };
      addNotification(
        next[id]
          ? (t.fav_notify_on || 'Njoftimet u aktivizuan për {id}').replace('{id}', name)
          : (t.fav_notify_off || 'Njoftimet u çaktivizuan për {id}').replace('{id}', name),
        'info'
      );
      return next;
    });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'route') removeSavedRoute(pendingDelete.id);
    else removeSavedStop(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.8; }
        }
        .live-pulse {
          animation: pulse 1.5s infinite alternate;
        }
      `}</style>

      {/* Animated delete confirm modal */}
      <AnimatePresence>
        {pendingDelete && (
          <ConfirmModal
            label={pendingDelete.label}
            onConfirm={confirmDelete}
            onCancel={() => setPendingDelete(null)}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Curved Gradient Header (Cover) */}
      <div style={{
        position: 'relative',
        height: 'calc(95px + env(safe-area-inset-top, 0px))',
        overflow: 'visible',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        zIndex: 10,
        background: '#0a0f1d',
        flexShrink: 0
      }}>
        {/* Slideshow background images */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) => (
          <div
            key={num}
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, rgba(245, 158, 11, 0.8) 0%, rgba(234, 88, 12, 0.85) 100%), url("/tirana_cover_${num}.png") center/cover no-repeat`,
              opacity: currentCoverIndex === i ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              zIndex: 0
            }}
          />
        ))}
        {/* Navigation header */}
        <div style={{
          position: 'absolute', top: 'calc(12px + env(safe-area-inset-top, 0px))', left: '20px', right: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5
        }}>
          <span style={{
            color: '#fff', fontSize: '18px', fontWeight: '800',
            letterSpacing: '0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}>
            Favourites
          </span>
        </div>

        {/* Organic Wave Bottom Divider */}
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '30px', zIndex: 2 }}>
          <path fill="var(--bg-dark)" d="M0,160 C 180,160 180,210 360,210 C 540,210 540,110 720,110 C 900,110 900,210 1080,210 C 1260,210 1260,160 1440,160 L 1440,220 L 0,220 Z"></path>
        </svg>
      </div>

      {/* Main dashboard body */}
      <div 
        style={{
          padding: '20px',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          paddingBottom: 'calc(80px + max(24px, calc(16px + env(safe-area-inset-bottom, 12px))))'
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* SECTION 0: RECENT ROUTE */}
          {(() => {
            const recentRoute = BUS_ROUTES.find(r => r.id === recentRouteId);
            const recentBusesCount = recentRoute ? buses.filter((b: any) => b.routeId === recentRoute.id).length : 0;
            if (!recentRoute) return null;
            return (
              <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, paddingLeft: '4px' }}>
                  {language === 'al' ? 'Linja e Fundit' : language === 'it' ? 'Ultimo Percorso' : 'Recent Route'}
                </h3>
                <div
                  onClick={() => { setSelectedRoute(recentRoute.id); setView('tracker'); }}
                  style={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderLeft: `4px solid ${recentRoute.color}`,
                    borderRadius: '0 20px 20px 0',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: recentRoute.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '900', fontSize: '14px', color: '#fff',
                      boxShadow: `0 4px 15px ${recentRoute.color}40`,
                    }}>
                      {recentRoute.id}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                        {recentRoute.name}
                      </h4>
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255, 255, 255, 0.35)' }}>
                        {recentRoute.label}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: recentBusesCount > 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${recentBusesCount > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
                      padding: '6px 12px', borderRadius: '10px',
                      fontSize: '11px', fontWeight: '700', color: recentBusesCount > 0 ? '#10b981' : 'rgba(255,255,255,0.4)',
                    }}>
                      <div className="live-pulse" style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 8px #10b981',
                        display: recentBusesCount > 0 ? 'block' : 'none'
                      }} />
                      <span>{recentBusesCount} Live</span>
                    </div>
                    <IonIcon icon={arrowForwardOutline} style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.25)' }} />
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* SECTION 1: PANELI I UDHËTIMIT (Travel Panel & Levels) */}
          <motion.div 
            variants={itemVariants}
            style={{
              background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f59e0b',
                }}>
                  <IonIcon icon={trendingUpOutline} style={{ fontSize: 16 }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {language === 'al' ? 'Statusi i Udhëtimit' : 'Travel Status'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'rgba(255, 255, 255, 0.35)' }}>
                    {language === 'al' ? 'Pikat dhe niveli juaj' : 'Your points and level'}
                  </p>
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#f59e0b'
              }}>
                {language === 'al' ? 'Niveli 4' : 'Level 4'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.04)', paddingTop: '14px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: '600' }}>540 / 600 pts</span>
                  <span style={{ color: '#f59e0b', fontWeight: '700' }}>90%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: '90%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ea580c)', borderRadius: '99px' }} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: '20px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>+140</span>
                <span style={{ display: 'block', fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '700' }}>
                  {language === 'al' ? 'Minuta Kursim' : 'Mins Saved'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* SECTION 2: LINJAT E PREFERUARA (Horizontal Swipe Carousel) */}
          <motion.div variants={itemVariants}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                {t.routes}
              </h3>
              {savedRoutes.length > 0 && (
                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '700' }}>
                  {savedRoutes.length} {language === 'al' ? 'Të ruajtura' : 'Saved'}
                </span>
              )}
            </div>

            {savedRoutes.length === 0 ? (
              <div style={{
                padding: '36px 20px', textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)', border: '1.5px dashed rgba(255, 255, 255, 0.05)',
                borderRadius: '20px',
              }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.35)' }}>{t.fav_no_routes}</p>
                <button
                  onClick={() => setView('tracker')}
                  style={{
                    marginTop: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '6px 14px', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  {language === 'al' ? 'Kërko Linjat' : 'Search Routes'}
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px',
                scrollbarWidth: 'none', margin: '0 -20px', paddingLeft: '20px', paddingRight: '20px'
              } as any}>
                <AnimatePresence mode="popLayout">
                  {savedRoutes.map((route) => {
                    const r = BUS_ROUTES.find((x: any) => x.id === route.id) || route;
                    const activeBusesCount = buses.filter((b: any) => b.routeId === r.id).length;
                    return (
                      <motion.div
                        key={r.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -20 }}
                        transition={{ type: 'spring', stiffness: 140, damping: 15 }}
                        style={{
                          flexShrink: 0,
                          width: '150px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '24px',
                          padding: '18px 16px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          position: 'relative',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                          e.currentTarget.style.borderColor = `${r.color}50`;
                          e.currentTarget.style.boxShadow = `0 12px 30px ${r.color}20, 0 8px 20px rgba(0,0,0,0.2)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                        }}
                      >
                        {/* Delete small floating button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setPendingDelete({ id: r.id, label: r.name, type: 'route' }); }}
                          style={{
                            position: 'absolute', top: '10px', right: '10px',
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#ef4444', cursor: 'pointer', zIndex: 5,
                          }}
                        >
                          <IonIcon icon={closeOutline} style={{ fontSize: 11 }} />
                        </button>

                        {/* Route Badge in Card */}
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          background: r.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '900', fontSize: '14px', color: '#fff',
                          boxShadow: `0 4px 15px ${r.color}40`,
                        }}>
                          {r.id}
                        </div>

                        <div style={{ flex: 1, minWidth: 0, marginTop: '4px' }}>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {r.name}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                            <div style={{
                              width: '5px', height: '5px', borderRadius: '50%',
                              background: activeBusesCount > 0 ? '#10b981' : 'rgba(255,255,255,0.2)',
                              boxShadow: activeBusesCount > 0 ? '0 0 6px #10b981' : 'none'
                            }} />
                            <span style={{ fontSize: '10px', color: activeBusesCount > 0 ? '#10b981' : 'rgba(255,255,255,0.35)', fontWeight: '600' }}>
                              {activeBusesCount > 0 ? `${activeBusesCount} Live` : t.fav_no_active}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Bottom Actions */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <button
                            onClick={() => toggleNotify(r.id, r.name)}
                            style={{
                              flex: 1, height: '28px', borderRadius: '6px',
                              background: notified[r.id] ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${notified[r.id] ? '#f59e0b30' : 'rgba(255,255,255,0.05)'}`,
                              color: notified[r.id] ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            }}
                          >
                            <IonIcon icon={notified[r.id] ? notificationsOutline : notificationsOffOutline} style={{ fontSize: 12 }} />
                          </button>
                          <button
                            onClick={() => { setSelectedRoute(r.id); setView('tracker'); }}
                            style={{
                              flex: 2, height: '28px', borderRadius: '6px',
                              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                              color: 'rgba(255,255,255,0.8)', fontSize: '10px', fontWeight: '800',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer',
                            }}
                          >
                            <IonIcon icon={arrowForwardOutline} style={{ fontSize: 10 }} />
                            <span>{t.fav_track}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* SECTION 3: STACIONET E PREFERUARA (Grid Masonry Layout) */}
          <motion.div variants={itemVariants}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                {t.stations}
              </h3>
              {savedStops.length > 0 && (
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>
                  {savedStops.length} {language === 'al' ? 'Stacione' : 'Stops'}
                </span>
              )}
            </div>

            {savedStops.length === 0 ? (
              <div style={{
                padding: '36px 20px', textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)', border: '1.5px dashed rgba(255, 255, 255, 0.05)',
                borderRadius: '20px',
              }}>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.35)' }}>{t.fav_no_stops}</p>
                <button
                  onClick={() => setView('map')}
                  style={{
                    marginTop: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '6px 14px', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  {language === 'al' ? 'Hap Hartën' : 'Open Map'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', position: 'relative' }}>
                <AnimatePresence mode="popLayout">
                  {savedStops.map((stop) => {
                    const s = BUS_STOPS.find((x: any) => x.id === stop.id || x.name === stop.name) || stop;
                    const stopId = String(s.id || s.name);
                    const stopRoutes = BUS_ROUTES.filter((r: any) =>
                      r.stops?.includes(s.id) || r.stops?.includes(s.name)
                    );
                    return (
                      <motion.div
                        key={stopId}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -15 }}
                        transition={{ type: 'spring', stiffness: 140, damping: 15 }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '20px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          position: 'relative',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        {/* Delete stop absolute */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setPendingDelete({ id: stopId, label: s.name, type: 'stop' }); }}
                          style={{
                            position: 'absolute', top: '10px', right: '10px',
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#ef4444', cursor: 'pointer', zIndex: 5,
                          }}
                        >
                          <IonIcon icon={closeOutline} style={{ fontSize: 11 }} />
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#3b82f6', flexShrink: 0
                          }}>
                            <IonIcon icon={locationOutline} style={{ fontSize: 14 }} />
                          </div>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                            {s.name}
                          </h4>
                        </div>

                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '10px', color: 'rgba(255, 255, 255, 0.35)', fontWeight: '600' }}>
                            {stopRoutes.length} {t.fav_routes_pass_here}
                          </p>
                          {/* Miniature badges for route connections */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {stopRoutes.slice(0, 3).map((r) => (
                              <span
                                key={r.id}
                                style={{
                                  fontSize: '9px', fontWeight: '800', color: '#fff',
                                  background: r.color, padding: '1px 5px', borderRadius: '4px',
                                }}
                              >
                                {r.id}
                              </span>
                            ))}
                            {stopRoutes.length > 3 && (
                              <span style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: '4px' }}>
                                +{stopRoutes.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => { setTripFrom(s.name); setView('planner'); }}
                          style={{
                            width: '100%', height: '30px', borderRadius: '8px',
                            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
                            color: '#10b981', fontSize: '11px', fontWeight: '700',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            cursor: 'pointer', transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(16,185,129,0.16)';
                            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(16,185,129,0.08)';
                            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.15)';
                          }}
                        >
                          <IonIcon icon={navigateOutline} style={{ fontSize: 11 }} />
                          <span>{language === 'al' ? 'Plano' : 'Plan'}</span>
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* SECTION 4: EKO HISTORIKU (Eco Activity Log) */}
          <motion.div variants={itemVariants}>
            <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', padding: '0 4px' }}>
              {t.fav_activity}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: language === 'al' ? 'Udhëtim ekologjik i kryer' : 'Eco trip completed', time: '1 orë më parë', pts: '+15 pts', icon: checkmarkCircleOutline, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.15)' },
                { label: language === 'al' ? 'Ruajtët linjën Selitë - Allias' : 'Saved Selitë - Allias route', time: 'Dje', pts: '+5 pts', icon: starOutline, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.15)' },
                { label: language === 'al' ? 'Kontrolluar pozicioni live i busit' : 'Checked live bus location', time: 'Para 3 ditësh', pts: '+2 pts', icon: busOutline, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.15)' },
              ].map((act, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                    background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                  }}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: act.bg, border: `1px solid ${act.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: act.color, flexShrink: 0
                  }}>
                    <IonIcon icon={act.icon} style={{ fontSize: 14 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {act.label}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.3)', marginTop: '2px' }}>
                      {act.time}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981' }}>
                    {act.pts}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* SECTION 5: SECURITY FOOTER */}
          <motion.div 
            variants={itemVariants}
            style={{
              marginTop: '8px', padding: '16px', borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.08)',
              display: 'flex', gap: '14px', alignItems: 'center',
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: '#10b981'
            }}>
              <IonIcon icon={shieldOutline} style={{ fontSize: 16 }} />
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#fff', margin: 0 }}>
                {t.fav_data_protection}
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(16, 185, 129, 0.5)', margin: '2px 0 0' }}>
                {t.fav_encryption}
              </p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}