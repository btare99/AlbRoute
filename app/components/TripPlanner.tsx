'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../store/useStore';
import {
  MapPin, Clock, Banknote, Route, ChevronRight, Navigation, AlertCircle, ChevronDown, Zap, Bus,
  ArrowUpDown, Search, X, CheckCircle2, Info, Locate, RefreshCcw, ArrowRight
} from 'lucide-react';
import { translations } from '../store/translations';

const STOP_NAMES = Array.from(new Set(BUS_STOPS.map(s => s.name))).sort();

function RouteBadge({ routeId }: { routeId: string }) {
  const route = BUS_ROUTES.find(r => r.id === routeId);
  if (!route) return null;
  return (
    <div style={{
      background: route.color,
      color: '#fff',
      padding: '3px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '800',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <Bus size={10} />
      {route.name}
    </div>
  );
}

function StopInput({ label, value, onChange, placeholder, icon: Icon, accentColor }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!value) return STOP_NAMES.slice(0, 5);
    const search = value.toLowerCase();
    return STOP_NAMES.filter(s => s.toLowerCase().includes(search)).slice(0, 8);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        background: 'transparent',
        border: 'none',
        height: '44px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', flexShrink: 0 }}>
          <Icon size={20} style={{ color: value ? accentColor : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} />
        </div>

        <div style={{ flex: 1 }}>
          <input
            className="trip-planner-input"
            value={value}
            onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            style={{
              background: 'transparent', border: 'none', outline: 'none', boxShadow: 'none',
              color: '#fff', fontSize: '17px', width: '100%',
              fontWeight: value ? '600' : '400', padding: 0,
              letterSpacing: '-0.3px', WebkitAppearance: 'none'
            }}
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setIsOpen(false); }}
            style={{
              background: 'rgba(255,255,255,0.05)', border: 'none',
              color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && value.length > 0 && BUS_STOPS.some(s => s.name.toLowerCase().includes(value.toLowerCase())) && (

        <div className="glass-panel animate-scale-in" style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          zIndex: 1000, borderRadius: '16px', padding: '8px',
          maxHeight: '260px', overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
          background: 'rgba(15, 20, 30, 0.95)', backdropFilter: 'blur(20px)',
          animation: 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {filtered.length > 0 ? (
            filtered.map(name => (
              <button
                key={name}
                type="button"
                onClick={() => { onChange(name); setIsOpen(false); }}
                style={{
                  width: '100%', padding: '12px 14px', textAlign: 'left',
                  background: 'none', border: 'none', borderRadius: '10px',
                  color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
                  fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: accentColor, flexShrink: 0
                }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
</svg>


                </div>
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </div>
                <ChevronRight size={14} style={{ opacity: 0.2 }} />
              </button>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Search size={24} style={{ color: 'rgba(255,255,255,0.05)', marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>
                Nuk u gjet asnjë stacion
              </p>
            </div>
          )}
        </div>
      )}
      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function TripPlanner() {
  const tripFrom = useStore((state: any) => state.tripFrom);
  const setTripFrom = useStore((state: any) => state.setTripFrom);
  const tripTo = useStore((state: any) => state.tripTo);
  const setTripTo = useStore((state: any) => state.setTripTo);
  const tripResult = useStore((state: any) => state.tripResult);
  const planTrip = useStore((state: any) => state.planTrip);
  const addNotification = useStore((state: any) => state.addNotification);
  const setView = useStore((state: any) => state.setView);
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;

  const [loading, setLoading] = useState(false);
  const [showAllStops, setShowAllStops] = useState<{ [key: number]: boolean }>({});
  const resultsRef = useRef<any>(null);

  useEffect(() => {
    if (tripResult && !tripResult.error && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [tripResult]);

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripFrom.trim() || !tripTo.trim()) {
      addNotification(t.select_departure, 'warning');
      return;
    }
    if (tripFrom.trim() === tripTo.trim()) {
      addNotification(language === 'al' ? 'Stacionet e nisjes dhe destinacionit duhet të jenë të ndryshme.' : language === 'en' ? 'Departure and destination stations must be different.' : 'Le stazioni di partenza e destinazione devono essere diverse.', 'warning');
      return;
    }
    setLoading(true);

    try {
      await planTrip(tripFrom, tripTo);
    } catch (err) {
      addNotification(language === 'al' ? 'Gabim gjatë planifikimit.' : 'Error during planning.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      addNotification('Geolocation not supported.', 'warning');
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      useStore.getState().setTripOriginCoords({ lat: latitude, lng: longitude });
      setTripFrom(language === 'al' ? '📍 Vendndodhja Ime' : language === 'en' ? '📍 My Location' : '📍 La Mia Posizione');
      addNotification(language === 'al' ? 'U mor vendndodhja juaj!' : language === 'en' ? 'Location acquired!' : 'Posizione acquisita!', 'info');
    }, () => {
      addNotification(language === 'al' ? 'Dështoi marrja e vendndodhjes.' : language === 'en' ? 'Failed to get location.' : 'Impossibile ottenere la posizione.', 'danger');
    });
  };

  const toggleStops = (legIndex: number) => {
    setShowAllStops(prev => ({ ...prev, [legIndex]: !prev[legIndex] }));
  };

  return (
    <div className="trip-planner-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        padding: '24px 20px 10px 20px',
        display: 'flex', alignItems: 'center', gap: '15px',
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #475569, #1e293b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          <Route size={18} style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>{t.plan_trip_title}</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0, marginTop: '2px' }}>
            {t.plan_trip_subtitle}
          </p>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '15px 20px',
        display: 'flex', flexDirection: 'column', gap: '20px'
      }} className="route-scrollbar">

        {/* Form */}
        <form onSubmit={handlePlan} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Connecting Timeline Line */}
            <div style={{
              position: 'absolute',
              left: '27.5px', // Centers on the 20px icon exactly
              top: '36px',
              bottom: '36px',
              width: '2px',
              background: 'linear-gradient(to bottom, #94a3b8 0%, #475569 100%)',
              opacity: 0.3,
              zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 5, padding: '12px 16px' }}>
              <StopInput
                label={t.departure}
                value={tripFrom}
                onChange={setTripFrom}
                placeholder={t.select_departure}
                icon={Navigation}
                accentColor="#94a3b8"
              />
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginLeft: '48px' }} />

            <div style={{ position: 'relative', zIndex: 1, padding: '12px 16px' }}>
              <StopInput
                label={t.destination}
                value={tripTo}
                onChange={setTripTo}
                placeholder={t.select_destination}
                icon={MapPin}
                accentColor="#cbd5e1"
              />
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={() => { const tmp = tripFrom; setTripFrom(tripTo); setTripTo(tmp); }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '34px', height: '34px', borderRadius: '50%',
                background: '#151a22', border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff', cursor: 'pointer', zIndex: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#151a22'; }}
              title={t.swap_stations}
            >
              <ArrowUpDown size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
            <button
              type="button"
              onClick={useMyLocation}
              style={{
                background: 'none', border: 'none', padding: '4px 8px', fontSize: '12px',
                color: '#94a3b8', cursor: 'pointer', fontWeight: '600',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              <Locate size={13} /> {t.my_location}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: '48px', borderRadius: '12px', marginTop: '10px',
              background: '#fff', color: '#000',
              fontWeight: '700', fontSize: '14px',
              border: 'none', cursor: loading ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.4)',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
                }} />
                {t.calculating}
              </>
            ) : (
              <>
                <Search size={14} /> {t.find_route} <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Recent / Suggested */}
        {!tripResult && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Zap size={12} style={{ color: 'rgba(255,255,255,0.25)' }} />
              <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
                {t.frequent_routes}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { f: 'Selitë', t: 'Qëndër' },
                { f: 'Blloku', t: 'TEG' },
                { f: 'Porcelan', t: 'Zogu i Zi' }
              ].map((r, i) => (
                <button
                  key={i}
                  onClick={() => { setTripFrom(r.f); setTripTo(r.t); }}
                  style={{
                    background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px', padding: '7px 12px', fontSize: '12px',
                    color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                >
                  {r.f} ➔ {r.t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {tripResult && (
          tripResult.error ? (
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', display: 'flex', gap: '15px', alignItems: 'flex-start', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
              <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
              <div>
                <p style={{ color: '#ef4444', fontWeight: '600', fontSize: '13px', marginBottom: '3px' }}>{t.route_not_found}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{tripResult.error}</p>
                <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '6px' }}>
                  {t.try_full_name}
                </p>
              </div>
            </div>
          ) : (
            <div ref={resultsRef} className="animate-fade-in" style={{ paddingBottom: '20px' }}>

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
                      {t.best_route}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>Urbani Im AI</span>
                </div>

                {/* From → To */}
                <div style={{ padding: '16px 18px', borderBottom: '0.5px dashed rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginBottom: '3px', letterSpacing: '0.06em' }}>{t.departure.toUpperCase()}</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tripResult.from}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, gap: '3px' }}>
                      <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600' }}>{tripResult.travelTime} min</span>
                      <ArrowRight size={14} style={{ color: 'rgba(255,255,255,0.15)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginBottom: '3px', letterSpacing: '0.06em' }}>{t.destination.toUpperCase()}</div>
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
                      {t.nearest_station}: <span style={{ color: 'rgba(255,255,255,0.7)' }}>{tripResult.actualFrom}</span>
                      <span style={{ display: 'block', marginTop: '2px', color: '#3b82f6' }}>
                        {t.walking_notice.replace('{dist}', tripResult.walkingDist.toString()).replace('{time}', tripResult.walkingTime.toString())}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
                  {[
                    { icon: <Clock size={14} />, value: `${tripResult.travelTime}m`, label: t.time_label, color: '#3b82f6' },
                    { icon: <MapPin size={14} />, value: tripResult.totalStops, label: t.stations, color: '#8b5cf6' },
                    { icon: <Banknote size={14} />, value: `${tripResult.totalPrice}L`, label: t.cost_label, color: '#10b981' },
                    { icon: <Route size={14} />, value: tripResult.transfers, label: t.transfers_label, color: '#f59e0b' },
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
                {t.step_by_step}
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
                          {t.walk_transfer}
                        </div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                          {leg.boardAt} → {leg.alightAt}
                        </div>
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '3px', fontWeight: '600' }}>
                          {t.walking_notice.replace('{dist}', leg.walkingDist.toString()).replace('{time}', leg.walkingTime.toString())}
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
                        {t.transfer_at}: <strong>{leg.transferAt}</strong>
                      </div>
                    )}

                    {/* Route header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <RouteBadge routeId={leg.route?.id} />
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{r?.name}</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Banknote size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: '600' }}>{t.ticket_40}</span>
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
                            {allShown ? (language === 'al' ? 'Fshih stacionet' : language === 'en' ? 'Hide stations' : 'Nascondi fermate') : `+ ${hiddenCount - 1} ${t.stations.toLowerCase()} ${language === 'al' ? 'të tjera' : language === 'en' ? 'others' : 'altre'}`}
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
                  {t.ticket_info}
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
                    addNotification(language === 'al' ? 'Rruga u shfaq në hartë.' : language === 'en' ? 'Route shown on map.' : 'Percorso mostrato sulla mappa.', 'success');
                  }}
                >
                  <MapPin size={13} /> {t.view_on_map}
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
                  <RefreshCcw size={13} /> {t.return_btn}
                </button>
              </div>

            </div>
          )
        )}

      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .route-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .route-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .route-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .trip-planner-input:focus {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
          -webkit-tap-highlight-color: transparent !important;
          --tw-ring-shadow: 0 0 transparent !important;
        }
      `}</style>
    </div>
  );
}