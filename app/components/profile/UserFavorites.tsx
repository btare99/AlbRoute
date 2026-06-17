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
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          padding: '20px 16px 16px',
          width: 'calc(100% - 32px)',
          maxWidth: '360px',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}
      >
        <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#fff', textAlign: 'center', lineHeight: 1.4 }}>
          {t.fav_confirm_title || 'Fshi nga të preferuarat?'}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: '44px', borderRadius: '12px', fontFamily: 'inherit',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            }}
          >
            {t.fav_cancel || 'Anulo'}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, height: '44px', borderRadius: '12px', fontFamily: 'inherit',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)',
              color: '#ef4444', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            }}
          >
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
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-dark)', position: 'relative' }}>

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

          {/* SECTION 2: LINJAT E PREFERUARA (Vertical full-width cards) */}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <AnimatePresence mode="popLayout">
                  {savedRoutes.map((route) => {
                    const r = BUS_ROUTES.find((x: any) => x.id === route.id) || route;
                    const activeBusesCount = buses.filter((b: any) => b.routeId === r.id).length;
                    return (
                      <motion.div
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        style={{
                          position: 'relative',
                          background: 'rgba(255,255,255,0.025)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '18px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'stretch',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)';
                          (e.currentTarget as HTMLDivElement).style.borderColor = `${r.color}40`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)';
                          (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)';
                        }}
                      >
                        {/* Colored left accent stripe */}
                        <div style={{ width: '3px', background: r.color, flexShrink: 0 }} />

                        {/* Single compact row */}
                        <div style={{ flex: 1, padding: '11px 10px 11px 13px', display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                          {/* Badge */}
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                            background: r.color, boxShadow: `0 3px 10px ${r.color}45`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '900', fontSize: '12px', color: '#fff',
                          }}>
                            {r.id}
                          </div>

                          {/* Text info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                              <div style={{
                                width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
                                background: activeBusesCount > 0 ? '#10b981' : 'rgba(255,255,255,0.15)',
                                boxShadow: activeBusesCount > 0 ? '0 0 5px #10b981' : 'none',
                              }} />
                              <span style={{ fontSize: '10px', fontWeight: '600', color: activeBusesCount > 0 ? '#10b981' : 'rgba(255,255,255,0.3)' }}>
                                {activeBusesCount > 0 ? `${activeBusesCount} Live` : t.fav_no_active}
                              </span>
                              {(r.stops?.length ?? 0) > 0 && (
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: '500' }}>
                                  · {r.stops?.length} {language === 'al' ? 'stac.' : 'stops'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Track button */}
                          <button
                            onClick={() => { setSelectedRoute(r.id); setView('tracker'); }}
                            style={{
                              height: '30px', borderRadius: '8px', padding: '0 10px', fontFamily: 'inherit',
                              background: `${r.color}20`, border: `1px solid ${r.color}40`,
                              color: r.color, fontSize: '11px', fontWeight: '800',
                              display: 'flex', alignItems: 'center', gap: '4px',
                              cursor: 'pointer', flexShrink: 0,
                            }}
                          >
                            <IonIcon icon={arrowForwardOutline} style={{ fontSize: 11 }} />
                            <span>{t.fav_track}</span>
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setPendingDelete({ id: r.id, label: r.name, type: 'route' }); }}
                            style={{
                              width: '26px', height: '26px', borderRadius: '7px', flexShrink: 0,
                              background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#ef4444', cursor: 'pointer',
                            }}
                          >
                            <IonIcon icon={closeOutline} style={{ fontSize: 11 }} />
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

        </motion.div>

      </div>
    </div>
  );
}