'use client';
import { useState, useMemo } from 'react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../store/useStore';
import { Bus, Clock, Users, Navigation, Star, Radio, Search, ChevronDown, ChevronUp, ArrowRight, X } from 'lucide-react';
import { translations } from '../store/translations';

export default function BusTracker() {
  const buses = useStore((state: any) => state.buses);
  const selectedBus = useStore((state: any) => state.selectedBus);
  const setSelectedBus = useStore((state: any) => state.setSelectedBus);
  const savedRoutes = useStore((state: any) => state.savedRoutes);
  const saveRoute = useStore((state: any) => state.saveRoute);
  const removeSavedRoute = useStore((state: any) => state.removeSavedRoute);
  const addNotification = useStore((state: any) => state.addNotification);
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;

  const [selectedRouteId, setSelectedRouteId] = useState(selectedBus?.routeId || 'L1');
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllStops, setShowAllStops] = useState(false);

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
      addNotification(language === 'al' ? `Linja ${route?.name} u hoq nga të preferuarat.` : language === 'en' ? `Route ${route?.name} removed from favorites.` : `Linea ${route?.name} rimossa dai preferiti.`, 'info');
    } else {
      saveRoute(route!);
      addNotification(language === 'al' ? `Linja ${route?.name} u shtua tek të preferuarat!` : language === 'en' ? `Route ${route?.name} added to favorites!` : `Linea ${route?.name} aggiunta ai preferiti!`, 'success');
    }
  };

  const stopsToShow = showAllStops
    ? route?.stops || []
    : (route?.stops || []).slice(0, 8);

  const getLoadInfo = (load: number) => {
    if (load > 40) return { label: t.full, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
    if (load > 25) return { label: t.medium, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' };
    return { label: t.empty, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' };
  };

  return (
    <div className="page-content">

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Bus size={18} style={{ color: '#fff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>{t.bus_tracker_title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0, marginTop: '2px' }}>
            {t.bus_tracker_subtitle}
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 10px', borderRadius: '99px',
          background: 'rgba(16,185,129,0.08)',
          border: '0.5px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
            {t.live} · {buses.length} {t.active_buses_count.toLowerCase()}
          </span>
        </div>
      </div>

      {/* ── Kërkim + Zgjedhje Linje ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '16px',
        marginBottom: '14px',
      }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '9px 12px',
          marginBottom: '14px',
        }}>
          <Search size={14} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.search_route_placeholder}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: '#fff', fontSize: '13px', width: '100%',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
            }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div style={{
          fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
          marginBottom: '10px',
        }}>
          {filteredRoutes.length} {t.routes.toLowerCase()} {searchQuery ? `· "${searchQuery}"` : ''}
        </div>

        {/* Route grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
          {filteredRoutes.map((r, idx) => {
            const activeBuses = buses.filter((b: any) => b.routeId === r.id).length;
            const isActive = selectedRouteId === r.id;
            const isHovered = hoveredRouteId === r.id;
            return (
              <button
                key={`${r.id}-${idx}`}
                onClick={() => setSelectedRouteId(r.id)}
                onMouseEnter={() => setHoveredRouteId(r.id)}
                onMouseLeave={() => setHoveredRouteId(null)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.15s',
                  border: `0.5px solid ${isActive || isHovered ? r.color + '60' : 'rgba(255,255,255,0.07)'}`,
                  background: isActive || isHovered ? `${r.color}15` : 'rgba(255,255,255,0.03)',
                  color: isActive || isHovered ? r.color : 'rgba(255,255,255,0.35)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                <span>{r.name}</span>
                {activeBuses > 0 && (
                  <span style={{
                    background: isActive || isHovered ? r.color : 'rgba(255,255,255,0.1)',
                    color: isActive || isHovered ? '#fff' : 'rgba(255,255,255,0.4)',
                    borderRadius: '99px', padding: '1px 6px',
                    fontSize: '10px', fontWeight: '700',
                  }}>{activeBuses}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Info linja e zgjedhur ── */}
      {route && (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: `0.5px solid ${route.color}30`,
          borderLeft: `2px solid ${route.color}`,
          borderRadius: '0 14px 14px 0',
          padding: '16px 18px',
          marginBottom: '14px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: `${route.color}15`,
                border: `0.5px solid ${route.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bus size={18} style={{ color: route.color }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{
                    background: `${route.color}20`,
                    border: `0.5px solid ${route.color}50`,
                    color: route.color,
                    padding: '2px 9px', borderRadius: '99px',
                    fontWeight: '700', fontSize: '12px',
                  }}>{route.name}</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{route.label}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                  {t.stations_count.replace('{count}', route.stops.length.toString())} · {t.trip_duration.replace('{count}', (route.stops.length * 3).toString())}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{
                fontSize: '11px', fontWeight: '600',
                color: 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                padding: '4px 10px', borderRadius: '8px',
              }}>
                {t.ticket_price}
              </span>
              <div style={{
                padding: '4px 9px', borderRadius: '99px',
                background: 'rgba(16,185,129,0.08)',
                border: '0.5px solid rgba(16,185,129,0.2)',
                fontSize: '11px', color: '#10b981', fontWeight: '600',
              }}>
                {routeBuses.length} {t.live.toLowerCase()}
              </div>
              <button
                onClick={toggleFavorite}
                style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: isSaved ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `0.5px solid ${isSaved ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <Star size={14} style={{
                  color: isSaved ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                  fill: isSaved ? '#f59e0b' : 'none',
                }} />
              </button>
            </div>
          </div>

          {/* Stop timeline */}
          <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', minWidth: 'max-content', gap: 0 }}>
              {stopsToShow.map((sid: string, i: number) => {
                const stop = BUS_STOPS.find(s => s.id === sid);
                const isFirst = i === 0;
                const isLast = i === stopsToShow.length - 1 && !showAllStops && route.stops.length > 8;
                const isTerminal = isFirst || isLast;
                return (
                  <div key={`${sid}-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                      {i > 0 && <div style={{ flex: 1, height: '1.5px', background: route.color, opacity: 0.25 }} />}
                      <div style={{
                        width: isTerminal ? '12px' : '7px',
                        height: isTerminal ? '12px' : '7px',
                        borderRadius: '50%',
                        background: isTerminal ? route.color : `${route.color}50`,
                        flexShrink: 0,
                      }} />
                      {i < stopsToShow.length - 1 && <div style={{ flex: 1, height: '1.5px', background: route.color, opacity: 0.25 }} />}
                    </div>
                    <p style={{
                      fontSize: '10px',
                      color: isTerminal ? '#fff' : 'rgba(255,255,255,0.3)',
                      marginTop: '6px', textAlign: 'center', maxWidth: '72px',
                      fontWeight: isTerminal ? '600' : '400',
                      lineHeight: 1.3,
                    }}>
                      {stop?.name}
                    </p>
                  </div>
                );
              })}
              {!showAllStops && route.stops.length > 8 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px' }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: '1.5px', background: route.color, opacity: 0.15 }} />
                    <span style={{
                      fontSize: '10px', color: route.color, fontWeight: '600',
                      background: `${route.color}15`,
                      border: `0.5px solid ${route.color}40`,
                      padding: '2px 6px', borderRadius: '99px',
                    }}>
                      +{route.stops.length - 8}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {route.stops.length > 8 && (
            <button
              onClick={() => setShowAllStops(v => !v)}
              style={{
                marginTop: '10px', background: 'none', border: 'none',
                cursor: 'pointer', color: route.color,
                fontSize: '12px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}>
              {showAllStops
                ? <><ChevronUp size={13} /> {t.show_less}</>
                : <><ChevronDown size={13} /> {t.show_all_stations.replace('{count}', route.stops.length.toString())}</>
              }
            </button>
          )}
        </div>
      )}

      {/* ── Autobuzët aktivë ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        marginBottom: '12px',
      }}>
        <Radio size={13} style={{ color: '#10b981' }} />
        <span style={{
          fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
        }}>
          {t.active_buses_count} · {language === 'al' ? 'Linja' : language === 'en' ? 'Route' : 'Linea'} {route?.name}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {routeBuses.map((bus: any, idx: number) => {
          const loadInfo = getLoadInfo(bus.passengerLoad);
          const isSelected = selectedBus?.id === bus.id;
          const busLabel = bus.plate || bus.id || (language === 'al' ? 'Pa Targë' : 'No Plate');

          return (
            <div
              key={bus.id || `bus-${idx}`}
              onClick={() => setSelectedBus(isSelected ? null : bus)}
              style={{
                background: isSelected ? `${route?.color}08` : 'rgba(255,255,255,0.02)',
                border: `0.5px solid ${isSelected ? (route?.color + '40') : 'rgba(255,255,255,0.08)'}`,
                borderLeft: isSelected ? `2px solid ${route?.color}` : '2px solid transparent',
                borderRadius: '0 12px 12px 0',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `${route?.color}15`,
                    border: `0.5px solid ${route?.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', flexShrink: 0,
                  }}>
                    <Bus size={17} style={{ color: route?.color }} />
                    {bus.delay > 0 && (
                      <div style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        background: '#f59e0b', color: '#000',
                        fontSize: '8px', fontWeight: '800',
                        width: '15px', height: '15px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {bus.delay}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '3px' }}>
                      {busLabel}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                      <ArrowRight size={10} />
                      <span>{t.nextStop}: <span style={{ color: 'rgba(255,255,255,0.6)' }}>{bus.nextStop}</span></span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '600',
                    color: loadInfo.color,
                    background: loadInfo.bg,
                    border: `0.5px solid ${loadInfo.border}`,
                    padding: '3px 9px', borderRadius: '99px',
                    display: 'inline-block',
                  }}>
                    {loadInfo.label}
                  </span>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '5px' }}>
                    {t.arrival_time.replace('{count}', Math.round(2 + Math.random() * 5).toString())}
                  </p>
                  {bus.delay > 0 && (
                    <p style={{ fontSize: '10px', color: '#f59e0b', marginTop: '2px', fontWeight: '600' }}>
                      {t.delay_label.replace('{count}', bus.delay.toString())}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {[
                  { icon: <Users size={11} />, val: `${bus.passengerLoad} / 50 ${t.passengers.toLowerCase()}` },
                  { icon: <Navigation size={11} />, val: `${Math.round(bus.speed)} km/h` },
                  { icon: <Clock size={11} />, val: t.live_tracking },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '11px', color: 'rgba(255,255,255,0.25)',
                  }}>
                    {s.icon} {s.val}
                  </div>
                ))}
              </div>

              {/* Load bar */}
              <div style={{ marginTop: '10px', height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${(bus.passengerLoad / 50) * 100}%`,
                  background: loadInfo.color,
                  transition: 'width 1s ease',
                  opacity: 0.7,
                }} />
              </div>
            </div>
          );
        })}

        {routeBuses.length === 0 && (
          <div style={{
            padding: '40px 24px', textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: '0.5px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.04)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <Bus size={20} style={{ color: 'rgba(255,255,255,0.15)' }} />
            </div>
            <p style={{ fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginBottom: '5px', fontSize: '13px' }}>
              {t.no_active_buses}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>
              {t.check_later}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}