'use client';
import { useState, useRef, useEffect } from 'react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../store/useStore';
import {
  Route, MapPin, ArrowRight, Clock, Banknote, RefreshCcw,
  Navigation, AlertCircle, ChevronDown, Star, Zap, Bus,
  ArrowUpDown, Search, X, CheckCircle2, Info, Locate
} from 'lucide-react';

const STOP_NAMES = BUS_STOPS.map(s => s.name).sort();

// Popular routes based on Tirana map
const POPULAR_ROUTES = [
  { from: 'Sheshi Skënderbej', to: 'Kombinat', label: 'Qendër → Kombinat' },
  { from: 'Sheshi Skënderbej', to: 'Kinostudio', label: 'Qendër → Kinostudio' },
  { from: 'Terminali C.EJ.', to: 'Sheshi Skënderbej', label: 'Terminali → Qendër' },
  { from: 'Zogu i Zi', to: 'Selitë', label: 'Zogu i Zi → Selitë' },
  { from: 'Kombinat', to: 'Qytet Studenti', label: 'Kombinat → Q. Studenti' },
  { from: 'Stacioni i Trenit', to: 'Laprake', label: 'Stacioni → Laprake' },
  { from: 'Sheshi Skënderbej', to: 'Fusha e Aviacionit', label: 'Qendër → F. Aviacionit' },
  { from: 'Ura Tabakëve', to: 'Selitë', label: 'Ura Tabakëve → Selitë' },
];

// Autocomplete dropdown component
function StopInput({
  label, value, onChange, placeholder, icon: Icon, iconColor
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: any; iconColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length >= 1
    ? STOP_NAMES.filter(n => n.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (name: string) => {
    setQuery(name);
    onChange(name);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: '700',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'var(--text-muted)', marginBottom: '8px'
      }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon size={16} style={{
          position: 'absolute', left: '14px', top: '50%',
          transform: 'translateY(-50%)', color: iconColor, zIndex: 1
        }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '13px 40px 13px 42px',
            background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
            border: '1.5px solid var(--border)',
            borderRadius: '12px', color: 'var(--text)',
            fontSize: '14px', outline: 'none',
            transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = iconColor)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        {query && (
          <button onClick={() => { setQuery(''); onChange(''); }} style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', padding: '4px'
          }}>
            <X size={14} />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'var(--bg-card, #1e1e2e)', border: '1.5px solid var(--border)',
          borderRadius: '12px', zIndex: 50, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          maxHeight: '240px', overflowY: 'auto'
        }}>
          {filtered.map((name, i) => (
            <button key={name} onClick={() => select(name)} style={{
              width: '100%', padding: '11px 16px', textAlign: 'left',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text)', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '10px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <MapPin size={13} style={{ color: iconColor, flexShrink: 0 }} />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Route line badge
function RouteBadge({ routeId }: { routeId: string }) {
  const r = BUS_ROUTES.find(x => x.id === routeId);
  if (!r) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '5px 12px', borderRadius: '20px',
      background: `${r.color}20`, border: `1.5px solid ${r.color}50`,
      fontWeight: '800', fontSize: '13px', color: r.color,
    }}>
      <Bus size={12} /> {r.id}
    </div>
  );
}

// Step indicator dot
function StepDot({ color, isFirst, isLast, isMiddle }: {
  color: string; isFirst?: boolean; isLast?: boolean; isMiddle?: boolean
}) {
  return (
    <div style={{
      width: isFirst || isLast ? '12px' : '8px',
      height: isFirst || isLast ? '12px' : '8px',
      borderRadius: '50%',
      background: isMiddle ? 'var(--border)' : color,
      border: isFirst || isLast ? `2px solid ${color}` : 'none',
      flexShrink: 0,
      transition: 'all 0.2s',
    }} />
  );
}

export default function TripPlanner() {
  const planTrip = useStore((state: any) => state.planTrip);
  const tripResult = useStore((state: any) => state.tripResult);
  const tripFrom = useStore((state: any) => state.tripFrom);
  const tripTo = useStore((state: any) => state.tripTo);
  const setTripFrom = useStore((state: any) => state.setTripFrom);
  const setTripTo = useStore((state: any) => state.setTripTo);
  const addNotification = useStore((state: any) => state.addNotification);
  const setView = useStore((state: any) => state.setView);
  const userLocation = useStore((state: any) => state.userLocation);
  const fetchUserLocation = useStore((state: any) => state.fetchUserLocation);
  const findNearestStop = useStore((state: any) => state.findNearestStop);

  const [loading, setLoading] = useState(false);
  const [showAllStops, setShowAllStops] = useState<{ [key: number]: boolean }>({});

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripFrom.trim() || !tripTo.trim()) {
      addNotification('Plotëso të dyja fushat.', 'warning');
      return;
    }
    if (tripFrom.trim() === tripTo.trim()) {
      addNotification('Stacionet e nisjes dhe destinacionit duhet të jenë të ndryshme.', 'warning');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    planTrip(tripFrom, tripTo);
    setLoading(false);
    setShowAllStops({});
  };

  const swapStops = () => {
    const t = tripFrom;
    setTripFrom(tripTo);
    setTripTo(t);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      addNotification('Geolocation nuk mbështetet.', 'warning');
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const nearest = findNearestStop(latitude, longitude);
      setTripFrom(nearest.name);
      addNotification(`U zgjodh stacioni më i afërt: ${nearest.name}`, 'info');
    }, (err) => {
      addNotification('Dështoi marrja e vendndodhjes.', 'danger');
    });
  };

  const quickFill = (from: string, to: string) => {
    setTripFrom(from);
    setTripTo(to);
  };

  const toggleStops = (i: number) => {
    setShowAllStops(prev => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div className="page-content" style={{ maxWidth: '740px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Route size={20} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Plano Udhëtimin</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginLeft: '52px' }}>
          Gjej rrugën optimale midis dy stacioneve të Urbanit Tiranë
        </p>
      </div>

      {/* Form Card */}
      <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
        <form onSubmit={handlePlan} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{ position: 'relative' }}>
            <StopInput
              label="📍 Nga — Stacioni i nisjes"
              value={tripFrom}
              onChange={setTripFrom}
              placeholder="p.sh. Sheshi Skënderbej"
              icon={Navigation}
              iconColor="var(--primary, #3b82f6)"
            />
            <button
              type="button"
              onClick={useMyLocation}
              style={{
                position: 'absolute', right: '48px', top: '38px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--primary)', display: 'flex', alignItems: 'center',
                gap: '4px', fontSize: '11px', fontWeight: '700'
              }}
            >
              <Locate size={12} /> IME
            </button>
          </div>

          {/* Swap button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <button type="button" onClick={swapStops} style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'var(--bg-secondary, rgba(255,255,255,0.06))',
              border: '1.5px solid var(--border)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--text-muted)',
              transition: 'all 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--primary, #3b82f6)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'var(--primary, #3b82f6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-secondary, rgba(255,255,255,0.06))';
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              title="Ndrro stacionet"
            >
              <ArrowUpDown size={15} />
            </button>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <StopInput
            label="🏁 Deri — Destinacioni"
            value={tripTo}
            onChange={setTripTo}
            placeholder="p.sh. Kombinat"
            icon={MapPin}
            iconColor="#10b981"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px',
              padding: '14px', borderRadius: '12px',
              background: loading ? 'var(--border)' : 'linear-gradient(135deg, var(--primary, #3b82f6), #6366f1)',
              color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '700', fontSize: '15px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'all 0.2s', boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.3)',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '18px', height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', display: 'inline-block'
                }} />
                Duke kërkuar rrugën...
              </>
            ) : (
              <>
                <Search size={16} />
                Gjej Rrugën
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Popular routes */}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Zap size={14} style={{ color: 'var(--warning, #f59e0b)' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              Rrugë të shpeshta
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {POPULAR_ROUTES.map(({ from, to, label }) => (
              <button
                key={label}
                onClick={() => quickFill(from, to)}
                style={{
                  padding: '7px 13px', borderRadius: '20px',
                  background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontSize: '12px',
                  cursor: 'pointer', fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary, #3b82f6)';
                  e.currentTarget.style.color = 'var(--primary, #3b82f6)';
                  e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'var(--bg-secondary, rgba(255,255,255,0.04))';
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {tripResult && (
        tripResult.error ? (
          <div className="card" style={{
            padding: '20px',
            background: 'rgba(239,68,68,0.06)',
            borderColor: 'rgba(239,68,68,0.25)'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertCircle size={20} style={{ color: 'var(--danger, #ef4444)', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ color: 'var(--danger, #ef4444)', fontWeight: '700', marginBottom: '4px', fontSize: '14px' }}>
                  Rruga nuk u gjet
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {tripResult.error}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>
                  💡 Provo të shkruash emrin e plotë të stacionit ose zgjidh nga lista.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>

            {/* Summary card */}
            <div className="card" style={{
              marginBottom: '16px', padding: '24px',
              background: 'rgba(59,130,246,0.05)',
              borderColor: 'rgba(59,130,246,0.2)',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Decorative circle */}
              <div style={{
                position: 'absolute', top: '-30px', right: '-30px',
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'rgba(99,102,241,0.08)', pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Rruga u gjet!</h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--primary)' }}>{tripResult.from}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#10b981' }}>{tripResult.to}</span>
                  </div>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px',
                  background: 'rgba(16,185,129,0.15)', color: '#10b981',
                  fontSize: '11px', fontWeight: '700', flexShrink: 0,
                  border: '1px solid rgba(16,185,129,0.3)'
                }}>
                  ✓ Optimal
                </span>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  {
                    icon: <Clock size={18} style={{ color: 'var(--primary)' }} />,
                    value: `${tripResult.travelTime} min`,
                    label: 'Kohëzgjatja',
                    bg: 'rgba(59,130,246,0.08)'
                  },
                  {
                    icon: <Banknote size={18} style={{ color: '#10b981' }} />,
                    value: `${tripResult.totalPrice} L`,
                    label: 'Çmimi total',
                    bg: 'rgba(16,185,129,0.08)'
                  },
                  {
                    icon: <Route size={18} style={{ color: 'var(--warning, #f59e0b)' }} />,
                    value: tripResult.transfers === 0 ? 'Direkt' : `${tripResult.transfers}×`,
                    label: tripResult.transfers === 0 ? 'Pa ndërrim' : 'Ndërrime',
                    bg: 'rgba(245,158,11,0.08)'
                  },
                ].map(({ icon, value, label, bg }) => (
                  <div key={label} style={{
                    padding: '14px 12px', borderRadius: '12px',
                    background: bg, textAlign: 'center'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>{icon}</div>
                    <p style={{ fontSize: '18px', fontWeight: '800', margin: 0, marginBottom: '2px' }}>{value}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step by step */}
            <h3 style={{ fontWeight: '700', marginBottom: '12px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
              🗺 Udhëzime hap pas hapi
            </h3>

            {tripResult.legs.map((leg: any, i: number) => {
              const r = BUS_ROUTES.find(x => x.id === leg.route?.id);
              const color = r?.color || '#888';
              const allShown = showAllStops[i];
              const stopsToShow = allShown ? leg.stops : [
                leg.stops[0],
                ...(leg.stops.length > 3 ? [] : leg.stops.slice(1, -1)),
                leg.stops[leg.stops.length - 1]
              ].filter(Boolean);
              const hiddenCount = leg.stops.length - 2;

              return (
                <div key={i} className="card" style={{
                  marginBottom: '10px', padding: '18px',
                  borderLeft: `4px solid ${color}`,
                  transition: 'box-shadow 0.2s'
                }}>
                  {/* Transfer notice */}
                  {leg.transferAt && (
                    <div style={{
                      marginBottom: '14px', padding: '10px 14px',
                      background: 'rgba(245,158,11,0.1)', borderRadius: '10px',
                      fontSize: '12px', color: 'var(--warning, #f59e0b)',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      border: '1px solid rgba(245,158,11,0.2)'
                    }}>
                      <RefreshCcw size={13} />
                      <span>Ndrro autobuzin te stacioni: <strong>{leg.transferAt}</strong></span>
                    </div>
                  )}

                  {/* Route header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <RouteBadge routeId={leg.route?.id} />
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{r?.name}</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <Banknote size={13} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>40 Lekë</span>
                    </div>
                  </div>

                  {/* Stop timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {stopsToShow.map((stop: string, j: number) => {
                      const isFirst = j === 0;
                      const isLast = j === stopsToShow.length - 1;
                      const isOnlyMiddle = !isFirst && !isLast;

                      return (
                        <div key={j} style={{ display: 'flex', gap: '14px' }}>
                          {/* Left line + dot */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '16px', flexShrink: 0 }}>
                            {!isFirst && (
                              <div style={{ width: '2px', height: '16px', background: `${color}40` }} />
                            )}
                            <div style={{
                              width: isFirst || isLast ? '13px' : '8px',
                              height: isFirst || isLast ? '13px' : '8px',
                              borderRadius: '50%',
                              background: isOnlyMiddle ? 'var(--border)' : color,
                              border: isFirst || isLast ? `2px solid ${color}` : 'none',
                              flexShrink: 0,
                            }} />
                            {!isLast && (
                              <div style={{ width: '2px', height: '16px', background: `${color}40` }} />
                            )}
                          </div>

                          {/* Stop name */}
                          <div style={{ paddingBottom: isLast ? 0 : '4px', display: 'flex', alignItems: 'center', minHeight: '32px' }}>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: isFirst || isLast ? '700' : '400',
                              color: isFirst || isLast ? 'var(--text)' : 'var(--text-muted)',
                            }}>
                              {stop}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Show more / less */}
                    {leg.stops.length > 3 && (
                      <div style={{ display: 'flex', gap: '14px' }}>
                        <div style={{ width: '16px', display: 'flex', justifyContent: 'center' }}>
                          <div style={{ width: '2px', flex: 1, background: `${color}40` }} />
                        </div>
                        <button
                          onClick={() => toggleStops(i)}
                          style={{
                            padding: '6px 0', background: 'none', border: 'none',
                            cursor: 'pointer', color: color, fontSize: '12px',
                            fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px'
                          }}
                        >
                          <ChevronDown size={14} style={{ transform: allShown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                          {allShown ? 'Fshih stacionet' : `+ ${hiddenCount - 1} stacione të tjera`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Info note */}
            <div style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)', marginBottom: '12px'
            }}>
              <Info size={14} style={{ color: 'var(--text-muted)', marginTop: '1px', flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                Çmimi i biletës është <strong>40 Lekë</strong> për çdo linjë. Për ndërrimet llogariten bileta të veçanta.
                Oraret mund të ndryshojnë sipas orarit të pikut.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
                onClick={() => {
                  useStore.getState().setActiveTrip(tripResult);
                  setView('map');
                  addNotification('Rruga u shfaq në hartë.', 'success');
                }}
              >
                <MapPin size={15} /> Shiko në Hartë
              </button>
              <button
                className="btn btn-ghost"
                style={{ flex: 1, padding: '12px' }}
                onClick={() => { const t = tripFrom; setTripFrom(tripTo); setTripTo(t); handlePlan({ preventDefault: () => { } } as any); }}
              >
                <RefreshCcw size={15} /> Kthim
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}