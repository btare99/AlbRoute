'use client';
import { useState, useMemo } from 'react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../store/useStore';
import { Bus, Clock, Users, Navigation, Star, Radio, Search, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

export default function BusTracker() {
  const buses = useStore((state: any) => state.buses);
  const selectedBus = useStore((state: any) => state.selectedBus);
  const setSelectedBus = useStore((state: any) => state.setSelectedBus);
  const savedRoutes = useStore((state: any) => state.savedRoutes);
  const saveRoute = useStore((state: any) => state.saveRoute);
  const removeSavedRoute = useStore((state: any) => state.removeSavedRoute);
  const addNotification = useStore((state: any) => state.addNotification);

  const [selectedRouteId, setSelectedRouteId] = useState(selectedBus?.routeId || 'L1');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllStops, setShowAllStops] = useState(false);

  // Filtro linjat sipas kërkimit
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
      addNotification(`Linja ${route?.name} u hoq nga të preferuarat.`, 'info');
    } else {
      saveRoute(route!);
      addNotification(`Linja ${route?.name} u shtua tek të preferuarat! ⭐`, 'success');
    }
  };

  // Shfaq vetëm disa stacione fillimisht
  const stopsToShow = showAllStops
    ? route?.stops || []
    : (route?.stops || []).slice(0, 8);

  const getLoadInfo = (load: number) => {
    if (load > 40) return { label: 'I mbushur', cls: 'badge-danger', color: 'var(--danger)' };
    if (load > 25) return { label: 'Mesatar', cls: 'badge-warning', color: 'var(--warning)' };
    return { label: 'I lirë', cls: 'badge-success', color: 'var(--success)' };
  };

  return (
    <div className="page-content" style={{ maxWidth: 960 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Ndjek Autobuzin</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Pozicioni dhe informacioni i autobuzëve në kohë reale
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
            color: 'var(--success)', background: 'rgba(16,185,129,0.1)',
            padding: '4px 10px', borderRadius: 20, marginLeft: 'auto',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
            Live · {buses.length} autobuzë aktiv
          </div>
        </div>
      </div>

      {/* ── Kërkim + Zgjedhje Linje ── */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        {/* Kërkim */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
          background: 'rgba(255,255,255,0.05)', borderRadius: 8,
          padding: '8px 12px', border: '1px solid var(--border)',
        }}>
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Kërko linjën... (p.sh. '14', 'Kombinat', 'Kashar')"
            style={{
              background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontSize: 13, width: '100%',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 12,
            }}>✕</button>
          )}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
          {filteredRoutes.length} LINJA {searchQuery ? `(filtër: "${searchQuery}")` : ''}
        </p>

        {/* Grid linjash */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
          {filteredRoutes.map(r => {
            const activeBuses = buses.filter((b: any) => b.routeId === r.id).length;
            return (
              <button key={r.id} onClick={() => setSelectedRouteId(r.id)} style={{
                padding: '7px 13px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'var(--transition)',
                border: '2px solid',
                borderColor: selectedRouteId === r.id ? r.color : 'transparent',
                background: selectedRouteId === r.id ? `${r.color}22` : 'rgba(255,255,255,0.04)',
                color: selectedRouteId === r.id ? r.color : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 6,
                position: 'relative',
              }}>
                <span>{r.name}</span>
                {activeBuses > 0 && (
                  <span style={{
                    background: r.color, color: '#fff',
                    borderRadius: '50%', width: 16, height: 16,
                    fontSize: 9, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{activeBuses}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Info linja e zgjedhur ── */}
      {route && (
        <div className="card" style={{ marginBottom: 20, padding: 20, border: `1px solid ${route.color}33` }}>
          {/* Header info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${route.color}22`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${route.color}44`,
              }}>
                <Bus size={22} style={{ color: route.color }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{
                    background: route.color, color: '#fff',
                    padding: '2px 10px', borderRadius: 6,
                    fontWeight: 800, fontSize: 14,
                  }}>{route.name}</span>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>{route.label}</h2>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {route.stops.length} stacione · ~{route.stops.length * 3} min udhëtim
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <span className="badge badge-success">{routeBuses.length} aktiv</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 8 }}>
                40 Lekë / biletë
              </span>
              <button className="btn btn-ghost" onClick={toggleFavorite} style={{ padding: 8 }}>
                <Star size={17} style={{ color: isSaved ? 'var(--warning)' : undefined, fill: isSaved ? 'var(--warning)' : 'none' }} />
              </button>
            </div>
          </div>

          {/* Timeline stacionesh */}
          <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
            <div style={{ display: 'flex', minWidth: 'max-content', gap: 0 }}>
              {stopsToShow.map((sid, i) => {
                const stop = BUS_STOPS.find(s => s.id === sid);
                const isFirst = i === 0;
                const isLast = i === stopsToShow.length - 1 && !showAllStops && route.stops.length > 8;
                return (
                  <div key={sid} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                      {i > 0 && <div style={{ flex: 1, height: 2, background: route.color, opacity: 0.4 }} />}
                      <div style={{
                        width: isFirst || isLast ? 14 : 10,
                        height: isFirst || isLast ? 14 : 10,
                        borderRadius: '50%',
                        background: isFirst || isLast ? route.color : `${route.color}99`,
                        border: `2px solid var(--bg-card)`,
                        flexShrink: 0,
                        boxShadow: isFirst || isLast ? `0 0 6px ${route.color}66` : 'none',
                      }} />
                      {i < stopsToShow.length - 1 && <div style={{ flex: 1, height: 2, background: route.color, opacity: 0.4 }} />}
                    </div>
                    <p style={{
                      fontSize: 9, color: isFirst || isLast ? 'var(--text)' : 'var(--text-muted)',
                      marginTop: 5, textAlign: 'center', maxWidth: 72,
                      fontWeight: isFirst || isLast ? 700 : 400,
                      lineHeight: 1.3,
                    }}>
                      {stop?.name}
                    </p>
                  </div>
                );
              })}
              {/* Trego më shumë */}
              {!showAllStops && route.stops.length > 8 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: 2, background: route.color, opacity: 0.2 }} />
                    <div style={{ padding: '2px 6px', background: `${route.color}22`, borderRadius: 10, fontSize: 9, color: route.color, fontWeight: 700 }}>
                      +{route.stops.length - 8}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Butoni show more */}
          {route.stops.length > 8 && (
            <button
              onClick={() => setShowAllStops(v => !v)}
              style={{
                marginTop: 8, background: 'none', border: 'none',
                cursor: 'pointer', color: route.color,
                fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              {showAllStops ? <><ChevronUp size={14} /> Trego më pak</> : <><ChevronDown size={14} /> Trego të gjitha {route.stops.length} stacionet</>}
            </button>
          )}
        </div>
      )}

      {/* ── Autobuzët aktivë ── */}
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Radio size={15} style={{ color: 'var(--success)' }} />
        Autobuzët Aktivë · Linja {route?.name}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {routeBuses.map((bus: any) => {
          const loadInfo = getLoadInfo(bus.passengerLoad);
          const isSelected = selectedBus?.id === bus.id;
          return (
            <div key={bus.id}
              className="card card-hover"
              onClick={() => setSelectedBus(isSelected ? null : bus)}
              style={{
                padding: 18, cursor: 'pointer',
                border: `1px solid ${isSelected ? route?.color || 'var(--primary)' : 'var(--border)'}`,
                background: isSelected ? `${route?.color}0a` : 'var(--bg-card)',
                transition: 'var(--transition)',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: `${route?.color}22`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${route?.color}44`,
                    position: 'relative',
                  }}>
                    <Bus size={20} style={{ color: route?.color }} />
                    {bus.delay > 0 && (
                      <div style={{
                        position: 'absolute', top: -4, right: -4,
                        background: 'var(--warning)', color: '#000',
                        fontSize: 8, fontWeight: 800,
                        width: 16, height: 16, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {bus.delay}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>
                      Autobuzi {bus.id.split('-')[1]}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                      <ArrowRight size={11} />
                      <span>Stacioni tjetër: <b style={{ color: 'var(--text)' }}>{bus.nextStop}</b></span>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${loadInfo.cls}`}>{loadInfo.label}</span>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    ~{Math.round(2 + Math.random() * 5)} min mbërritje
                  </p>
                  {bus.delay > 0 && (
                    <p style={{ fontSize: 10, color: 'var(--warning)', marginTop: 2 }}>
                      ⚠ {bus.delay} min vonesë
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { icon: <Users size={12} />, val: `${bus.passengerLoad} / 50 pasagjerë` },
                  { icon: <Navigation size={12} />, val: `${Math.round(bus.speed)} km/h` },
                  { icon: <Clock size={12} />, val: 'Live tracking' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                    {s.icon} {s.val}
                  </div>
                ))}
              </div>

              {/* Barra ngarkesës */}
              <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.07)' }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${(bus.passengerLoad / 50) * 100}%`,
                  background: loadInfo.color,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          );
        })}

        {routeBuses.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
            <Bus size={36} style={{ margin: '0 auto 14px', opacity: 0.2 }} />
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Asnjë autobus aktiv për këtë linjë</p>
            <p style={{ fontSize: 12 }}>Provo të zgjedhësh linjë tjetër ose kontrollo më vonë.</p>
          </div>
        )}
      </div>
    </div>
  );
}