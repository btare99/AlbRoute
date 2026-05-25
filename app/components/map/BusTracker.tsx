'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../../store/useStore';
import { IonIcon } from '@ionic/react';
import { searchOutline, closeOutline, starOutline, chevronUpOutline, chevronDownOutline, busOutline, peopleOutline, flashOutline } from 'ionicons/icons';
import { translations } from '../../store/translations';

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
      addNotification(language === 'al' ? `Linja ${route?.name} u hoq nga të preferuarat.` : `Route ${route?.name} removed from favorites.`, 'info');
    } else {
      saveRoute(route!);
      addNotification(language === 'al' ? `Linja ${route?.name} u shtua tek të preferuarat!` : `Route ${route?.name} added to favorites!`, 'success');
    }
  };

  const stopsToShow = showAllStops
    ? route?.stops || []
    : (route?.stops || []).slice(0, 7);

  const getLoad = (load: number) => {
    if (load > 40) return { label: t.full, color: '#FF3B30', pct: Math.min((load / 50) * 100, 100) };
    if (load > 25) return { label: t.medium, color: '#FF9F0A', pct: Math.min((load / 50) * 100, 100) };
    return { label: t.empty, color: '#30D158', pct: Math.min((load / 50) * 100, 100) };
  };

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

      {/* ━━━━ HEADER ━━━━ */}
      <div style={{
        padding: '24px 20px 16px',
        background: 'radial-gradient(ellipse at 50% -20%, rgba(48, 209, 88, 0.12), transparent 70%), linear-gradient(180deg, rgba(10,15,26,0.9) 60%, transparent 100%)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>

            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.1, background: 'linear-gradient(to right, #ffffff, rgba(255,255,255,0.6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {t.bus_tracker_title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.2px',
                  color: '#30D158',
                  background: 'rgba(48,209,88,0.12)',
                  padding: '4px 10px', borderRadius: 99,
                  border: '1px solid rgba(48,209,88,0.2)'
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#30D158', display: 'inline-block', boxShadow: '0 0 8px #30D158' }} />
                  {buses.length} {t.active_buses_count.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 16, padding: '12px 16px',
        }}>
          <IonIcon icon={searchOutline} style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.search_route_placeholder}
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: '#fff', fontSize: 15, width: '100%',
              caretColor: '#fff',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              background: 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', padding: 0,
            }}>
              <IonIcon icon={closeOutline} style={{ fontSize: 12 }} />
            </button>
          )}
        </div>
      </div>

      {/* ━━━━ ROUTE CHIPS ━━━━ */}
      <div style={{
        display: 'flex', gap: 8,
        overflowX: 'auto', padding: '0 20px 4px',
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
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => { setSelectedRouteId(r.id); setShowAllStops(false); }}
              style={{
                flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 15px',
                borderRadius: 14, border: 'none', cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13, fontWeight: 700,
                background: isActive ? r.color : 'rgba(255,255,255,0.07)',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isActive ? `0 4px 20px ${r.color}50` : 'none',
              }}
            >
              {r.name}
              {live > 0 && (
                <span style={{
                  background: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                  borderRadius: 99, padding: '1px 6px',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>{live}</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ━━━━ ROUTE HERO CARD ━━━━ */}
      <AnimatePresence mode="wait">
        {route && (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            style={{ padding: '16px 20px 0' }}
          >
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            background: `linear-gradient(145deg, ${route.color}22 0%, rgba(255,255,255,0.03) 100%)`,
            border: `1px solid ${route.color}28`,
          }}>
            {/* Route header */}
            <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: route.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 6px 20px ${route.color}50`,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
                    {route.name}
                  </span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>
                    {route.label}
                  </p>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {route.stops.length} stacione · ~{route.stops.length * 3} min
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {/* Live pill */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 11px', borderRadius: 12,
                  background: routeBuses.length > 0 ? 'rgba(48,209,88,0.12)' : 'rgba(255,255,255,0.06)',
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: routeBuses.length > 0 ? '#30D158' : 'rgba(255,255,255,0.2)',
                    boxShadow: routeBuses.length > 0 ? '0 0 6px #30D158' : 'none',
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: routeBuses.length > 0 ? '#30D158' : 'rgba(255,255,255,0.3)' }}>
                    {routeBuses.length}
                  </span>
                </div>
                {/* Star */}
                <button
                  onClick={toggleFavorite}
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: isSaved ? 'rgba(255,159,10,0.15)' : 'rgba(255,255,255,0.07)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <IonIcon icon={starOutline} style={{ fontSize: 15, color: isSaved ? '#FF9F0A' : 'rgba(255,255,255,0.4)' }} />
                </button>
              </div>
            </div>

            {/* Stops scroll */}
            <div style={{ padding: '16px 18px 8px', overflowX: 'auto', scrollbarWidth: 'none' } as any}>
              <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 'max-content' }}>
                {stopsToShow.map((sid: string, i: number) => {
                  const stop = BUS_STOPS.find(s => s.id === sid);
                  const isFirst = i === 0;
                  const isLast = i === stopsToShow.length - 1 && (showAllStops || route.stops.length <= 7);
                  const isTerminal = isFirst || isLast;
                  return (
                    <div key={`${sid}-${i}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 66 }}>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                        {i > 0 && (
                          <div style={{ flex: 1, height: 2, background: `${route.color}35`, borderRadius: 1 }} />
                        )}
                        <div style={{
                          width: isTerminal ? 12 : 7,
                          height: isTerminal ? 12 : 7,
                          borderRadius: '50%', flexShrink: 0,
                          background: isTerminal ? route.color : `${route.color}45`,
                          boxShadow: isTerminal ? `0 0 10px ${route.color}70` : 'none',
                          border: isTerminal ? `2px solid rgba(255,255,255,0.3)` : 'none',
                        }} />
                        {i < stopsToShow.length - 1 && (
                          <div style={{ flex: 1, height: 2, background: `${route.color}35`, borderRadius: 1 }} />
                        )}
                      </div>
                      <p style={{
                        fontSize: 10, lineHeight: 1.3,
                        color: isTerminal ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                        fontWeight: isTerminal ? 600 : 400,
                        textAlign: 'center', maxWidth: 60,
                        margin: '6px 0 0',
                      }}>
                        {stop?.name}
                      </p>
                    </div>
                  );
                })}
                {!showAllStops && route.stops.length > 7 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44, paddingTop: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{ flex: 1, height: 2, background: `${route.color}15`, borderRadius: 1 }} />
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: route.color,
                        background: `${route.color}18`, padding: '2px 7px', borderRadius: 99,
                      }}>+{route.stops.length - 7}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {route.stops.length > 7 && (
              <button
                onClick={() => setShowAllStops(v => !v)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: route.color, fontSize: 12, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 18px 16px', fontFamily: 'inherit',
                }}>
                {showAllStops
                  ? <><IonIcon icon={chevronUpOutline} style={{ fontSize: 13 }} /> {t.show_less}</>
                  : <><IonIcon icon={chevronDownOutline} style={{ fontSize: 13 }} /> {t.show_all_stations.replace('{count}', route.stops.length.toString())}</>}
              </button>
            )}
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ━━━━ BUS CARDS ━━━━ */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
          margin: '0 0 12px',
        }}>
          {t.active_buses_count} — {route?.name}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>
            {routeBuses.map((bus: any, idx: number) => {
              const load = getLoad(bus.passengerLoad);
              const isSelected = selectedBus?.id === bus.id;
              const busLabel = bus.plate || bus.id || (language === 'al' ? 'Pa Targë' : 'No Plate');
              const arrMin = Math.round(2 + Math.random() * 6);

              return (
                <motion.div
                  key={bus.id || `bus-${idx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => setSelectedBus(isSelected ? null : bus)}
                  style={{
                    borderRadius: 20,
                    background: isSelected
                      ? `linear-gradient(145deg, ${route?.color}18, ${route?.color}08)`
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isSelected ? route?.color + '45' : 'rgba(255,255,255,0.07)'}`,
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(.34,1.56,.64,1)',
                    transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                  }}
                >
                {/* Row 1: icon + name + arrival */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Bus dot icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: `${route?.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, position: 'relative',
                  }}>
                    <IonIcon icon={busOutline} style={{ fontSize: 22, color: route?.color }} />
                    {bus.delay > 0 && (
                      <div style={{
                        position: 'absolute', top: -5, right: -5,
                        background: '#FF9F0A', color: '#000',
                        fontSize: 9, fontWeight: 900,
                        width: 18, height: 18, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{bus.delay}</div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <p style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: '-0.4px' }}>
                        {busLabel}
                      </p>
                      {bus.status === 'stopped' ? (
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255, 59, 48, 0.15)', color: '#FF3B30', padding: '4px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5, border: '1px solid rgba(255, 59, 48, 0.3)' }}>Ndalur</span>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(48, 209, 88, 0.15)', color: '#30D158', padding: '4px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: 0.5, border: '1px solid rgba(48, 209, 88, 0.3)' }}>Në lëvizje</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: bus.status === 'stopped' ? '#FF3B30' : 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: 4 }}>
                            {bus.status === 'stopped' ? 'Në stacion:' : 'Nga:'}
                          </span>
                          <span style={{ color: bus.status === 'stopped' ? '#fff' : 'rgba(255,255,255,0.8)', fontWeight: bus.status === 'stopped' ? 700 : 500 }}>
                            {bus.currentStop || 'Pikënisja'}
                          </span>
                        </span>
                      </div>
                      <div style={{ borderLeft: '2px dashed rgba(255,255,255,0.1)', height: 12, marginLeft: 3 }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #30D158', background: 'transparent', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: 4 }}>
                            Drejt:
                          </span>
                          <span style={{ color: '#30D158', fontWeight: 700 }}>
                            {bus.nextStop || 'Destinacioni'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrival time — big */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, color: '#fff' }}>
                      {arrMin}
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.35)', letterSpacing: 0 }}> min</span>
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: load.color, boxShadow: `0 0 6px ${load.color}` }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: load.color }}>{load.label}</span>
                    </div>
                  </div>
                </div>

                {/* Passenger load bar */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <IonIcon icon={peopleOutline} style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                        {bus.passengerLoad} / 50
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <IonIcon icon={flashOutline} style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                        {Math.round(bus.speed)} km/h
                      </span>
                    </div>
                    {bus.delay > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#FF9F0A' }}>
                        +{bus.delay}m vonesë
                      </span>
                    )}
                  </div>

                  {/* Segmented bar */}
                  <div style={{
                    height: 4, borderRadius: 99,
                    background: 'rgba(255,255,255,0.07)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      width: `${load.pct}%`,
                      background: `linear-gradient(90deg, ${load.color}90, ${load.color})`,
                      borderRadius: 99,
                      transition: 'width 1.2s cubic-bezier(.34,1.56,.64,1)',
                    }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>

          {/* Empty state */}
          {routeBuses.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                padding: '52px 24px', textAlign: 'center',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 18,
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <IonIcon icon={busOutline} style={{ fontSize: 24, color: 'rgba(255,255,255,0.15)' }} />
              </div>
              <p style={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 5, fontSize: 15 }}>
                {t.no_active_buses}
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
                {t.check_later}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}