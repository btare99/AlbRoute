'use client';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../../store/useStore';
import { IonIcon } from '@/app/components/common/IonIcon';
import {
  searchOutline,
  closeOutline,
  starOutline,
  chevronUpOutline,
  chevronDownOutline,
  busOutline,
  peopleOutline,
  flashOutline,
  locationOutline,
  timeOutline,
  navigateOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { translations } from '../../store/translations';

const EARTH_RADIUS_M = 6371000;
const haversineMeters = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = EARTH_RADIUS_M;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function BusTracker() {
  const buses = useStore((state: any) => state.buses) || [];
  const selectedBus = useStore((state: any) => state.selectedBus);
  const setSelectedBus = useStore((state: any) => state.setSelectedBus);
  const savedRoutes = useStore((state: any) => state.savedRoutes) || [];
  const saveRoute = useStore((state: any) => state.saveRoute);
  const removeSavedRoute = useStore((state: any) => state.removeSavedRoute);
  const addNotification = useStore((state: any) => state.addNotification);
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;
  const setView = useStore((state: any) => state.setView);
  const setTripFrom = useStore((state: any) => state.setTripFrom);
  const recentRouteId = useStore((state: any) => state.recentRouteId);
  const setRecentRouteId = useStore((state: any) => state.setRecentRouteId);
  const currentCoverIndex = useStore((state: any) => state.currentCoverIndex);

  const guestMode = useStore((state: any) => state.guestMode);
  const setGuestMode = useStore((state: any) => state.setGuestMode);

  const [selectedRouteId, setSelectedRouteId] = useState(selectedBus?.routeId || recentRouteId || 'L1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllStops, setShowAllStops] = useState(false);
  const [expandedBusId, setExpandedBusId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRouteId) {
      setRecentRouteId(selectedRouteId);
    }
  }, [selectedRouteId, setRecentRouteId]);

  // ── Guest Mode Locked Layout ───────────────────────────────────────────────
  if (guestMode) {
    const isAl = language === 'al';
    const isIt = language === 'it';
    const title = isAl ? "Ndjekja e Autobuzëve Live" : isIt ? "Monitoraggio Bus Live" : "Live Bus Tracking";
    const desc = isAl
      ? "Ky funksion është i disponueshëm vetëm për përdoruesit e regjistruar. Hyni ose krijoni një llogari falas për të ndjekur autobusët live në hartë dhe për të parë ngarkesën e tyre."
      : isIt
        ? "Questa funzione è disponibile solo per gli utenti registrati. Accedi o crea un account gratuito per tracciare i bus in tempo reale."
        : "This feature is only available for registered users. Log in or create a free account to track buses in real-time.";
    const btnLabel = isAl ? "Hyni ose Regjistrohuni" : isIt ? "Accedi o Registrati" : "Sign In or Register";

    return (
      <div style={{
        height: '100%',
        minHeight: '100dvh',
        background: 'var(--bg-dark)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <style jsx>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50%       { opacity: 0.8; }
          }
        `}</style>
        {/* Top radial glow */}
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '100%', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 1
        }} />

        {/* Floating amber glow behind card */}
        <div style={{
          position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 1
        }} />

        <div style={{
          zIndex: 2,
          maxWidth: '400px',
          width: '100%',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          borderRadius: '32px',
          padding: '40px 28px',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both'
        }}>
          {/* Lock icon container with soft pulsing glow */}
          <div style={{
            width: '84px', height: '84px', borderRadius: '26px',
            background: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(245,158,11,0.15)',
            position: 'relative'
          }}>
            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 8px rgba(245,158,11,0.4))' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span style={{
              position: 'absolute',
              width: '100%', height: '100%',
              borderRadius: '26px',
              border: '1px solid rgba(245,158,11,0.1)',
              animation: 'pulse 2s infinite alternate',
              pointerEvents: 'none'
            }} />
          </div>

          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '800',
              margin: '0 0 12px',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {title}
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: '1.6', fontWeight: 500 }}>
              {desc}
            </p>
          </div>

          <button
            onClick={() => setGuestMode(false)}
            style={{
              width: '100%',
              height: '52px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000000',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: '800',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: '0 8px 30px rgba(245,158,11,0.35)',
              letterSpacing: '0.2px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(245,158,11,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(245,158,11,0.35)';
            }}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    );
  }

  // ── Filtering & Computations ───────────────────────────────────────────────
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return BUS_ROUTES;
    const q = searchQuery.toLowerCase();
    return BUS_ROUTES.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.label.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const routeBuses = buses.filter((b: any) => b.routeId === selectedRouteId);
  const route = BUS_ROUTES.find(r => r.id === selectedRouteId);
  const isSaved = savedRoutes.some((r: any) => r.id === selectedRouteId);

  const toggleFavorite = () => {
    if (isSaved) {
      removeSavedRoute(selectedRouteId);
      addNotification(t.favorites_removed.replace('{route}', route?.name || ''), 'info');
    } else {
      saveRoute(route!);
      addNotification(t.favorites_added.replace('{route}', route?.name || ''), 'success');
    }
  };

  const stopsToShow = route
    ? (showAllStops ? route.stops : route.stops.slice(0, 8))
    : [];

  const getLoad = (load: number) => {
    if (load > 40) return { label: t.full, color: '#FF3B30', pct: Math.min((load / 50) * 100, 100) };
    if (load > 25) return { label: t.medium, color: '#FF9F0A', pct: Math.min((load / 50) * 100, 100) };
    return { label: t.empty, color: '#30D158', pct: Math.min((load / 50) * 100, 100) };
  };

  // ── Find matched and unmatched buses for vertical timeline matching ───────
  const matchedBusIds = new Set<string>();
  const stopsBusesMap = new Map<string, any[]>();

  route?.stops.forEach(sid => {
    const stop = BUS_STOPS.find(s => s.id === sid);
    if (stop) {
      const matched = routeBuses.filter((b: any) => {
        if (!b.currentStop) return false;
        const isMatch = b.currentStop.toLowerCase() === stop.name.toLowerCase() ||
          b.currentStop.toLowerCase() === stop.id.toLowerCase();
        if (isMatch) matchedBusIds.add(b.id);
        return isMatch;
      });
      stopsBusesMap.set(sid, matched);
    }
  });

  const unmatchedBuses = routeBuses.filter((b: any) => !matchedBusIds.has(b.id));

  return (
    <div style={{
      minHeight: '100%',
      background: 'var(--bg-dark)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      overflowY: 'auto',
      paddingBottom: 110,
      position: 'relative'
    }}>
      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.8; }
        }
        .live-pulse {
          animation: pulse 1.5s infinite alternate;
        }
      `}</style>

      {/* ━━━━ HEADER ━━━━ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        height: 'calc(135px + env(safe-area-inset-top, 0px))',
        overflow: 'visible',
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
        background: '#0a0f1d'
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
            Live Buses
          </span>
        </div>

        {/* Search bar inside header */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '20px',
          right: '20px',
          zIndex: 5,
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '14px',
          padding: '10px 16px 10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          overflow: 'hidden'
        }}>

          <IonIcon icon={searchOutline} style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', flexShrink: 0, zIndex: 1 }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.search_route_placeholder}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: '#fff', fontSize: 15, width: '100%',
              caretColor: '#fff',
              zIndex: 1
            }}
          />
        </div>

        {/* Organic Wave Bottom Divider */}
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '45px', zIndex: 2 }}>
          <path fill="var(--bg-dark)" d="M0,160 C 180,160 180,210 360,210 C 540,210 540,110 720,110 C 900,110 900,210 1080,210 C 1260,210 1260,160 1440,160 L 1440,220 L 0,220 Z"></path>
        </svg>
      </div>

      {/* ━━━━ ROUTE CHIPS ━━━━ */}
      <div style={{
        display: 'flex', gap: 10,
        overflowX: 'auto', padding: '14px 20px 10px',
        scrollbarWidth: 'none',
      } as any}>
        {filteredRoutes.map((r, idx) => {
          const isActive = selectedRouteId === r.id;
          const live = buses.filter((b: any) => b.routeId === r.id).length;
          return (
            <motion.button
              key={`${r.id}-${idx}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              onClick={() => { setSelectedRouteId(r.id); setShowAllStops(false); }}
              style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px',
                borderRadius: 9999,
                border: isActive ? `1px solid ${r.color}cc` : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13, fontWeight: 700,
                background: isActive
                  ? `linear-gradient(135deg, ${r.color} 0%, ${r.color}dd 100%)`
                  : 'rgba(255,255,255,0.02)',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.25s cubic-bezier(.16,1,.3,1)',
                boxShadow: isActive ? `0 8px 24px ${r.color}45, inset 0 1px 0 rgba(255,255,255,0.15)` : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                } else {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 10px 28px ${r.color}55, inset 0 1px 0 rgba(255,255,255,0.2)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                } else {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${r.color}45, inset 0 1px 0 rgba(255,255,255,0.15)`;
                }
              }}
            >
              {/* Soft colored circle dot for inactive routes */}
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: r.color,
                boxShadow: `0 0 6px ${r.color}`,
                display: isActive ? 'none' : 'inline-block',
                flexShrink: 0
              }} />

              <span>{r.name}</span>

              {live > 0 && (
                <span style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(16,185,129,0.08)',
                  border: isActive ? 'none' : '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 99, padding: '1px 6px',
                  fontSize: 10, fontWeight: 800,
                  color: isActive ? '#fff' : '#10b981',
                }}>{live}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ━━━━ ROUTE HERO & LIVE TIMELINE VIEW ━━━━ */}
      <AnimatePresence mode="wait">
        {route && (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Route summary card */}
            <div style={{
              borderRadius: 24,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: route.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', color: '#fff',
                  boxShadow: `0 6px 16px ${route.color}35`,
                }}>
                  {route.name}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff' }}>
                    {route.label}
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                    {route.stops.length} {language === 'al' ? 'stacione' : 'stations'} · ~{route.stops.length * 3} min
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {/* Save button */}
                <button
                  onClick={toggleFavorite}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: isSaved ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.03)',
                    border: isSaved ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(255,255,255,0.05)',
                    color: isSaved ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <IonIcon icon={starOutline} style={{ fontSize: 15 }} />
                </button>
              </div>
            </div>

            {/* UNIFIED INTERACTIVE TIMELINE / BUS LIST VIEW */}
            <div>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                marginBottom: '16px', paddingLeft: '4px'
              }}>
                {language === 'al' ? 'Autobusët në këtë Linjë' : 'Buses on this Line'}
              </p>

              {routeBuses.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Warning card for no active buses */}
                  <div style={{
                    padding: '24px 20px',
                    borderRadius: 20,
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.15)',
                    textAlign: 'center',
                    color: '#f59e0b',
                    fontSize: 14,
                    fontWeight: 600,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <IonIcon icon={busOutline} style={{ fontSize: 28, color: '#f59e0b' }} />
                    <div>
                      {language === 'al' ? "Nuk ka autobusë aktivë në këtë linjë për momentin." : "No active buses on this line at the moment."}
                    </div>
                  </div>

                  {/* Fallback general stops list */}
                  <p style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
                    marginTop: 12, marginBottom: 12, paddingLeft: '4px'
                  }}>
                    {language === 'al' ? 'Harta e Stacioneve' : 'Stations Map'}
                  </p>

                  <div style={{
                    position: 'relative',
                    paddingLeft: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}>
                    {/* Timeline connector bar (dashed modern style) */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      bottom: '8px',
                      left: '7px',
                      width: '0',
                      borderLeft: `2px dashed ${route.color}60`,
                      zIndex: 1,
                    }} />

                    {stopsToShow.map((sid: string, idx: number) => {
                      const stop = BUS_STOPS.find(s => s.id === sid);
                      const isFirst = idx === 0;
                      const isLast = idx === route.stops.length - 1;

                      return (
                        <div key={`${sid}-${idx}`} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {/* Timeline dot node (Hollow circle masking the line behind it) */}
                          <div style={{
                            position: 'absolute',
                            left: '-31px',
                            top: '5px',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#0a0f1d', // Solid background matching the page theme
                            border: `2px solid ${route.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                          }} />

                          {/* Station Details Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.85)' }}>
                                {stop?.name}
                              </h4>
                              <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.3)' }}>
                                {isFirst ? (language === 'al' ? 'Termini Fillestar' : 'Start Terminal') : isLast ? (language === 'al' ? 'Termini Fundit' : 'End Terminal') : (language === 'al' ? 'Stacion kalimi' : 'Transit Stop')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Show All Stations / Show Less Button */}
                    {route.stops.length > 8 && (
                      <button
                        onClick={() => setShowAllStops(v => !v)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '700',
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 12px',
                          alignSelf: 'flex-start',
                          borderRadius: '10px',
                          fontFamily: 'inherit',
                          transition: 'all 0.2s ease',
                          marginTop: '4px'
                        }}
                      >
                        {showAllStops ? (
                          <>
                            <IonIcon icon={chevronUpOutline} style={{ fontSize: 12, color: route.color }} />
                            <span>{t.show_less}</span>
                          </>
                        ) : (
                          <>
                            <IonIcon icon={chevronDownOutline} style={{ fontSize: 12, color: route.color }} />
                            <span>{t.show_all_stations.replace('{count}', route.stops.length.toString())}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {routeBuses.map((bus: any, idx: number) => {
                    const isExpanded = expandedBusId === bus.id;
                    const load = getLoad(bus.passengerLoad);
                    const isReturn = bus.direction === 'return';
                    const busDirLabel = isReturn
                      ? (language === 'al' ? "Kthim" : language === 'it' ? "Ritorno" : "Return")
                      : (language === 'al' ? "Vajtje" : language === 'it' ? "Andata" : "Forward");

                    // Retrieve stops for this bus direction
                    const busStopsIds = isReturn ? (route.returnStops || [...route.stops].reverse()) : route.stops;
                    const busStops = busStopsIds.map(id => BUS_STOPS.find(s => s.id === id)).filter(Boolean) as any[];

                    // Find activeStopIdx (where the bus is currently located)
                    let activeStopIdx = -1;
                    if (bus.currentStop) {
                      activeStopIdx = busStops.findIndex(s => s.name.toLowerCase() === bus.currentStop.toLowerCase());
                    }
                    if (activeStopIdx === -1 && bus.nextStop) {
                      const nextIdx = busStops.findIndex(s => s.name.toLowerCase() === bus.nextStop.toLowerCase());
                      if (nextIdx > 0) {
                        activeStopIdx = nextIdx - 1;
                      }
                    }
                    if (activeStopIdx === -1) {
                      let minD = Infinity;
                      busStops.forEach((s, idx) => {
                        const d = haversineMeters(bus.lat, bus.lng, s.lat, s.lng);
                        if (d < minD) {
                          minD = d;
                          activeStopIdx = idx;
                        }
                      });
                    }

                    // Calculate arrival times for upcoming stops
                    const etas = new Map<string, number>();
                    let cumulativeSec = 0;

                    const nextIdx = activeStopIdx + 1;
                    if (nextIdx < busStops.length) {
                      const d = haversineMeters(bus.lat, bus.lng, busStops[nextIdx].lat, busStops[nextIdx].lng);
                      const speed = Math.max(bus.speed || 25, 15) * 1000 / 3600;
                      cumulativeSec += d / speed;
                      etas.set(busStops[nextIdx].id, Math.round(cumulativeSec / 60));
                    }

                    for (let j = nextIdx + 1; j < busStops.length; j++) {
                      const d = haversineMeters(busStops[j - 1].lat, busStops[j - 1].lng, busStops[j].lat, busStops[j].lng);
                      cumulativeSec += d / (25 * 1000 / 3600) + 20; // 25 km/h avg speed + 20s dwell
                      etas.set(busStops[j].id, Math.round(cumulativeSec / 60));
                    }

                    return (
                      <div
                        key={bus.id || bus.busId || bus.plate || idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: isExpanded ? `1.5px solid ${route.color}50` : '1.5px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: 20,
                          overflow: 'hidden',
                          boxShadow: isExpanded ? '0 12px 30px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                          marginBottom: 16,
                        }}
                      >
                        {/* Bus Card Header */}
                        <div
                          onClick={() => setSelectedBus(bus)}
                          style={{
                            padding: 16,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            background: isExpanded ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                            transition: 'background 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {/* Plate & Status */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 38, height: 38, borderRadius: 12,
                                background: `${route.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: route.color
                              }}>
                                <IonIcon icon={busOutline} style={{ fontSize: 18 }} />
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#fff' }}>
                                  {bus.plate || bus.id || t.no_plate}
                                </h4>
                                <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: bus.status === 'stopped' ? '#ff9f0a' : '#30d158',
                                    display: 'inline-block'
                                  }} />
                                  {bus.status === 'stopped'
                                    ? (language === 'al' ? 'Ndaluar' : language === 'it' ? 'Fermato' : 'Stopped')
                                    : (language === 'al' ? 'Në lëvizje' : language === 'it' ? 'In movimento' : 'In motion')}
                                  <span>·</span>
                                  <span>{busDirLabel}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div style={{
                            display: 'flex',
                            gap: 16,
                            paddingTop: 10,
                            borderTop: '1px solid rgba(255,255,255,0.04)',
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.5)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <IonIcon icon={peopleOutline} style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                              <span>{language === 'al' ? 'Ngarkesa' : language === 'it' ? 'Passeggeri' : 'Load'}: <strong>{bus.passengerLoad}/50</strong> ({load.label})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <IonIcon icon={flashOutline} style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                              <span>{language === 'al' ? 'Shpejtësia' : language === 'it' ? 'Velocità' : 'Speed'}: <strong>{Math.round(bus.speed)} km/h</strong></span>
                            </div>
                          </div>

                          {/* Load Progress Indicator */}
                          <div style={{ height: 3, background: 'rgba(255,255,255,0.03)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${load.pct}%`, height: '100%', background: load.color, borderRadius: 99 }} />
                          </div>

                          {/* Toggle arrow button centered at the bottom */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBus(bus);
                              setExpandedBusId(isExpanded ? null : bus.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(255, 255, 255, 0.35)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '100%',
                              padding: '8px 0 2px',
                              transition: 'all 0.2s ease',
                              outline: 'none',
                              marginTop: 4,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = route.color}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.35)'}
                          >
                            <IonIcon icon={isExpanded ? chevronUpOutline : chevronDownOutline} style={{ fontSize: 18 }} />
                          </button>
                        </div>

                        {/* Expanded Station Timeline */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              style={{
                                overflow: 'hidden',
                                background: 'rgba(0, 0, 0, 0.12)',
                                borderTop: '1px solid rgba(255,255,255,0.05)',
                              }}
                            >
                              <div style={{ padding: '20px 16px 20px 24px' }}>
                                <div style={{
                                  position: 'relative',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 20,
                                }}>
                                  {/* Timeline connector bar (dashed modern style) */}
                                  <div style={{
                                    position: 'absolute',
                                    top: 8,
                                    bottom: 8,
                                    left: 6,
                                    width: 0,
                                    borderLeft: '2px dashed rgba(255, 255, 255, 0.12)',
                                    zIndex: 1,
                                  }} />

                                  {/* Highlighted active path segment (solid glowing line) */}
                                  <div style={{
                                    position: 'absolute',
                                    top: 8,
                                    height: `${(Math.max(0, activeStopIdx) / (busStops.length - 1)) * 100}%`,
                                    maxHeight: 'calc(100% - 16px)',
                                    left: 6,
                                    width: 2,
                                    background: `linear-gradient(180deg, ${route.color} 0%, ${route.color}cc 100%)`,
                                    boxShadow: `0 0 6px ${route.color}80`,
                                    borderRadius: 99,
                                    transition: 'height 0.3s ease',
                                    zIndex: 1,
                                  }} />

                                  {busStops.map((stop: any, idx: number) => {
                                    const isCurrent = idx === activeStopIdx;
                                    const isPassed = idx < activeStopIdx;
                                    const isUpcoming = idx > activeStopIdx;
                                    const isFirst = idx === 0;
                                    const isLast = idx === busStops.length - 1;
                                    const eta = etas.get(stop.id);

                                    // Node styling - Hollow circle masking the line behind it
                                    let nodeBorder = '2px solid rgba(255, 255, 255, 0.25)';
                                    let scale = 1;
                                    let leftOffset = 1;
                                    let dotSize = 12;
                                    let glow = 'none';

                                    if (isCurrent) {
                                      nodeBorder = `2.5px solid ${route.color}`;
                                      leftOffset = 0;
                                      dotSize = 14;
                                      glow = `0 0 10px ${route.color}`;
                                    } else if (isPassed) {
                                      nodeBorder = `2px solid ${route.color}`;
                                      leftOffset = 1;
                                      dotSize = 12;
                                    }

                                    return (
                                      <div
                                        key={`${stop.id}-${idx}`}
                                        style={{
                                          position: 'relative',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          paddingLeft: 22,
                                          opacity: isPassed ? 0.6 : 1,
                                          transition: 'opacity 0.2s',
                                        }}
                                      >
                                        {/* Timeline dot (Hollow circular node masking the line underneath) */}
                                        <div style={{
                                          position: 'absolute',
                                          left: leftOffset,
                                          width: dotSize,
                                          height: dotSize,
                                          borderRadius: '50%',
                                          background: '#121829', // Matches parent drawer background to block the connector line
                                          border: nodeBorder,
                                          transform: `scale(${scale})`,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: glow,
                                          zIndex: 2,
                                          transition: 'all 0.3s ease',
                                        }} />

                                        {/* Station Info */}
                                        <div style={{ flex: 1, paddingRight: 10 }}>
                                          <h5 style={{
                                            margin: 0,
                                            fontSize: 13,
                                            fontWeight: isCurrent ? 800 : 600,
                                            color: isCurrent ? '#fff' : isPassed ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.9)',
                                            transition: 'color 0.2s',
                                          }}>
                                            {stop.name}
                                          </h5>
                                          <p style={{
                                            margin: '2px 0 0',
                                            fontSize: 10,
                                            color: isCurrent ? route.color : 'rgba(255,255,255,0.35)',
                                            fontWeight: isCurrent ? 700 : 500,
                                          }}>
                                            {isCurrent ? (
                                              bus.status === 'stopped'
                                                ? (language === 'al' ? "Stacioni aktual · Ndaluar" : language === 'it' ? "Stazione attuale · Fermato" : "Current station · Stopped")
                                                : (language === 'al' ? "Stacioni aktual · Në lëvizje" : language === 'it' ? "Stazione attuale · In movimento" : "Current station · In motion")
                                            ) : isPassed ? (
                                              language === 'al' ? "Kaluar" : language === 'it' ? "Passato" : "Passed"
                                            ) : (
                                              isFirst ? (language === 'al' ? 'Termini Fillestar' : 'Start Terminal') :
                                                isLast ? (language === 'al' ? 'Termini Fundit' : 'End Terminal') : ""
                                            )}
                                          </p>
                                        </div>

                                        {/* Arrival ETA Badge */}
                                        {isUpcoming && eta !== undefined && (
                                          <div style={{
                                            padding: '4px 8px',
                                            borderRadius: 8,
                                            background: 'rgba(48, 209, 88, 0.1)',
                                            border: '1px solid rgba(48, 209, 88, 0.2)',
                                            color: '#30d158',
                                            fontSize: 11,
                                            fontWeight: 700,
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {eta <= 0
                                              ? (language === 'al' ? '< 1 min' : '< 1 min')
                                              : (language === 'al' ? `~${eta} min` : `~${eta} min`)}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}