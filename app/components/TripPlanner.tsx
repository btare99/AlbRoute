'use client';
import { useState, useRef, useEffect } from 'react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../store/useStore';
import {
  Route, MapPin, ArrowRight, Clock, Banknote, RefreshCcw,
  Navigation, AlertCircle, ChevronDown, Zap, Bus,
  ArrowUpDown, Search, X, CheckCircle2, Info, Locate
} from 'lucide-react';

const STOP_NAMES = Array.from(new Set(BUS_STOPS.map(s => s.name))).sort();

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

function StopInput({ label, value, onChange, placeholder, icon: Icon, accentColor }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: any; accentColor: string;
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

  const select = (name: string) => { setQuery(name); onChange(name); setOpen(false); };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <label style={{
        display: 'block', fontSize: '10px', fontWeight: '600',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)', marginBottom: '7px',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={15} style={{
          position: 'absolute', left: '12px', top: '50%',
          transform: 'translateY(-50%)', color: accentColor, zIndex: 1,
        }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={e => {
            setOpen(true);
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
          placeholder={placeholder}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          }}
          style={{
            width: '100%', padding: '11px 36px 11px 38px',
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', color: '#fff',
            fontSize: '13px', outline: 'none',
            transition: 'border-color 0.2s, background 0.2s',
            boxSizing: 'border-box',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); onChange(''); }} style={{
            position: 'absolute', right: '10px', top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', padding: '4px',
          }}>
            <X size={13} />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: '#141414',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', zIndex: 50,
          overflow: 'hidden',
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          maxHeight: '220px', overflowY: 'auto',
        }}>
          {filtered.map((name, i) => (
            <button key={name} onClick={() => select(name)} style={{
              width: '100%', padding: '10px 14px', textAlign: 'left',
              background: 'none', border: 'none',
              borderBottom: i < filtered.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
              cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '10px',
              transition: 'background 0.15s, color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              <Navigation size={12} style={{ color: accentColor, flexShrink: 0 }} />
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RouteBadge({ routeId }: { routeId: string }) {
  const r = BUS_ROUTES.find(x => x.id === routeId);
  if (!r) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '99px',
      background: `${r.color}18`,
      border: `0.5px solid ${r.color}50`,
      fontWeight: '600', fontSize: '12px', color: r.color,
    }}>
      <Bus size={11} /> {r.id}
    </div>
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
      useStore.getState().setTripOriginCoords({ lat: latitude, lng: longitude });
      setTripFrom('📍 Vendndodhja Ime');
      addNotification('U mor vendndodhja juaj!', 'info');
    }, () => {
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
    <div className="page-content">

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Route size={18} style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>Plano udhëtimin</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0, marginTop: '2px' }}>
            Gjej rrugën optimale · Urbani Tiranë
          </p>
        </div>
      </div>

      {/* ── Form card ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '18px',
        marginBottom: '16px',
      }}>
        <form onSubmit={handlePlan} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <StopInput
            label="Nisja"
            value={tripFrom}
            onChange={setTripFrom}
            placeholder="Zgjidh stacionin e nisjes..."
            icon={Navigation}
            accentColor="#3b82f6"
          />

          {/* Swap + location row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={swapStops}
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'rgba(255,255,255,0.3)',
                flexShrink: 0, transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
              title="Ndrro stacionet"
            >
              <ArrowUpDown size={13} />
            </button>
            <button
              type="button"
              onClick={useMyLocation}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 12px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
                fontSize: '11px', fontWeight: '600',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.color = '#3b82f6'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              <Locate size={12} /> Vendndodhja ime
            </button>
          </div>

          <StopInput
            label="Destinacioni"
            value={tripTo}
            onChange={setTripTo}
            placeholder="Zgjidh destinacionin..."
            icon={MapPin}
            accentColor="#10b981"
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '4px', padding: '12px',
              borderRadius: '10px',
              background: loading ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)',
              color: loading ? 'rgba(255,255,255,0.2)' : '#000',
              border: '0.5px solid rgba(255,255,255,0.1)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600', fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#fff'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.4)',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
                Po llogarit...
              </>
            ) : (
              <>
                <Search size={14} /> Gjej rrugën <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Popular routes */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Zap size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
            <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
              Rrugë të shpeshta
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {POPULAR_ROUTES.map(({ from, to, label }) => (
              <button
                key={label}
                onClick={() => quickFill(from, to)}
                style={{
                  padding: '5px 11px', borderRadius: '99px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '0.5px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.3)', fontSize: '11px',
                  cursor: 'pointer', fontWeight: '500',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      {tripResult && (
        tripResult.error ? (
          <div style={{
            padding: '16px',
            background: 'rgba(239,68,68,0.04)',
            border: '0.5px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            display: 'flex', gap: '12px', alignItems: 'flex-start',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <AlertCircle size={14} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p style={{ color: '#ef4444', fontWeight: '600', fontSize: '13px', marginBottom: '3px' }}>Rruga nuk u gjet</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{tripResult.error}</p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '6px' }}>
                Provo emrin e plotë ose zgjidh nga lista.
              </p>
            </div>
          </div>
        ) : (
          <div>

            {/* Summary card */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              {/* Header strip */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981', letterSpacing: '0.04em' }}>
                    Rruga më e mirë
                  </span>
                </div>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>Urbani Im AI</span>
              </div>

              {/* From → To */}
              <div style={{ padding: '16px 18px', borderBottom: '0.5px dashed rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginBottom: '3px', letterSpacing: '0.06em' }}>NISJA</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tripResult.from}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, gap: '3px' }}>
                    <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600' }}>{tripResult.travelTime} min</span>
                    <ArrowRight size={14} style={{ color: 'rgba(255,255,255,0.15)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginBottom: '3px', letterSpacing: '0.06em' }}>MBËRRITJA</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tripResult.to}
                    </div>
                  </div>
                </div>
              </div>

              {/* Walking notice */}
              {tripResult.walkingDist > 0 && (
                <div style={{
                  padding: '10px 18px',
                  borderBottom: '0.5px solid rgba(255,255,255,0.05)',
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '8px',
                    background: 'rgba(59,130,246,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Locate size={13} style={{ color: '#3b82f6' }} />
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    Stacioni më i afërt: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{tripResult.actualFrom}</span>
                    <span style={{ display: 'block', marginTop: '2px', color: '#3b82f6' }}>
                      🚶 {tripResult.walkingDist}m · {tripResult.walkingTime} min ecje
                    </span>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                {[
                  { icon: <Clock size={14} />, value: `${tripResult.travelTime}m`, label: 'Kohë', color: '#3b82f6' },
                  { icon: <MapPin size={14} />, value: tripResult.totalStops, label: 'Stacione', color: '#8b5cf6' },
                  { icon: <Banknote size={14} />, value: `${tripResult.totalPrice}L`, label: 'Kosto', color: '#10b981' },
                  { icon: <Route size={14} />, value: tripResult.transfers, label: 'Ndërrime', color: '#f59e0b' },
                ].map(({ icon, value, label, color }, idx) => (
                  <div key={label} style={{
                    padding: '12px 8px',
                    borderRight: idx < 3 ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px',
                  }}>
                    <span style={{ color }}>{icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{value}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-step label */}
            <div style={{
              fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)',
              marginBottom: '10px', paddingLeft: '2px',
            }}>
              Udhëzime hap pas hapi
            </div>

            {tripResult.legs.map((leg: any, i: number) => {
              if (leg.isWalking) {
                return (
                  <div key={i} style={{
                    background: 'rgba(16,185,129,0.04)',
                    border: '0.5px solid rgba(16,185,129,0.15)',
                    borderLeft: '2px solid #10b981',
                    borderRadius: '0 10px 10px 0',
                    padding: '12px 14px',
                    marginBottom: '8px',
                    display: 'flex', gap: '12px', alignItems: 'center',
                  }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: 'rgba(16,185,129,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Locate size={15} style={{ color: '#10b981' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(16,185,129,0.6)', letterSpacing: '0.08em', marginBottom: '2px' }}>
                        ECJE / NDËRRIM
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                        {leg.boardAt} → {leg.alightAt}
                      </div>
                      <div style={{ fontSize: '11px', color: '#10b981', marginTop: '3px', fontWeight: '600' }}>
                        🚶 {leg.walkingDist}m · {leg.walkingTime} min
                      </div>
                    </div>
                  </div>
                );
              }

              const r = BUS_ROUTES.find(x => x.id === leg.route?.id);
              const color = r?.color || '#888';
              const allShown = showAllStops[i];
              const stopsToShow = allShown
                ? leg.stops
                : [leg.stops[0], ...(leg.stops.length > 3 ? [] : leg.stops.slice(1, -1)), leg.stops[leg.stops.length - 1]].filter(Boolean);
              const hiddenCount = leg.stops.length - 2;

              return (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '0.5px solid rgba(255,255,255,0.06)',
                  borderLeft: `2px solid ${color}`,
                  borderRadius: '0 10px 10px 0',
                  padding: '14px',
                  marginBottom: '8px',
                }}>
                  {/* Transfer notice */}
                  {leg.transferAt && (
                    <div style={{
                      marginBottom: '10px', padding: '8px 12px',
                      background: 'rgba(245,158,11,0.06)',
                      border: '0.5px solid rgba(245,158,11,0.2)',
                      borderRadius: '8px',
                      fontSize: '12px', color: '#f59e0b',
                      display: 'flex', alignItems: 'center', gap: '7px',
                    }}>
                      <RefreshCcw size={12} />
                      Ndrro autobuzin te: <strong>{leg.transferAt}</strong>
                    </div>
                  )}

                  {/* Route header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                    <RouteBadge routeId={leg.route?.id} />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{r?.name}</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Banknote size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: '600' }}>40 Lekë</span>
                    </div>
                  </div>

                  {/* Stop timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {stopsToShow.map((stop: string, j: number) => {
                      const isFirst = j === 0;
                      const isLast = j === stopsToShow.length - 1;
                      const isTerminal = isFirst || isLast;
                      return (
                        <div key={j} style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '14px', flexShrink: 0 }}>
                            {!isFirst && <div style={{ width: '1.5px', height: '14px', background: `${color}30` }} />}
                            <div style={{
                              width: isTerminal ? '11px' : '6px',
                              height: isTerminal ? '11px' : '6px',
                              borderRadius: '50%',
                              background: isTerminal ? color : 'rgba(255,255,255,0.08)',
                              border: isTerminal ? `2px solid ${color}` : 'none',
                              flexShrink: 0,
                            }} />
                            {!isLast && <div style={{ width: '1.5px', height: '14px', background: `${color}30` }} />}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', minHeight: '30px' }}>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: isTerminal ? '600' : '400',
                              color: isTerminal ? '#fff' : 'rgba(255,255,255,0.3)',
                            }}>
                              {stop}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {leg.stops.length > 3 && (
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '14px', display: 'flex', justifyContent: 'center' }}>
                          <div style={{ width: '1.5px', flex: 1, background: `${color}30` }} />
                        </div>
                        <button
                          onClick={() => toggleStops(i)}
                          style={{
                            padding: '5px 0', background: 'none', border: 'none',
                            cursor: 'pointer', color: color,
                            fontSize: '12px', fontWeight: '600',
                            display: 'flex', alignItems: 'center', gap: '5px',
                          }}
                        >
                          <ChevronDown size={13} style={{
                            transform: allShown ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s',
                          }} />
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
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              marginBottom: '12px',
            }}>
              <Info size={13} style={{ color: 'rgba(255,255,255,0.2)', marginTop: '1px', flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: '1.6' }}>
                Bileta: <span style={{ color: 'rgba(255,255,255,0.4)' }}>40L/linjë</span> · Ndërrimet llogariten veçmas · Oraret mund të ndryshojnë sipas pikut.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                style={{
                  padding: '11px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.9)', color: '#000',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                onClick={() => {
                  useStore.getState().setActiveTrip(tripResult);
                  setView('map');
                  addNotification('Rruga u shfaq në hartë.', 'success');
                }}
              >
                <MapPin size={13} /> Shiko në hartë
              </button>
              <button
                style={{
                  padding: '11px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.4)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                onClick={() => {
                  const t = tripFrom; setTripFrom(tripTo); setTripTo(t);
                  handlePlan({ preventDefault: () => { } } as any);
                }}
              >
                <RefreshCcw size={13} /> Kthim
              </button>
            </div>

          </div>
        )
      )}

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}