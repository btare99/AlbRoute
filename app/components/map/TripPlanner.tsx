'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { IonIcon } from '@ionic/react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../../store/useStore';
import {
  busOutline,
  navigateOutline,
  locationOutline,
  chevronForwardOutline,
  swapVerticalOutline,
  searchOutline,
  closeOutline,
  arrowForwardOutline,
  locateOutline,
  timeOutline
} from 'ionicons/icons';
import { translations } from '../../store/translations';

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
      <IonIcon icon={busOutline} style={{ fontSize: 10 }} />
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
          <IonIcon icon={Icon} style={{ fontSize: 20, color: value ? accentColor : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} />
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
            <IonIcon icon={closeOutline} style={{ fontSize: 16 }} />
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
                  <IonIcon icon={locationOutline} style={{ fontSize: 14, color: accentColor }} />
                </div>
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </div>
                <IonIcon icon={chevronForwardOutline} style={{ fontSize: 14, opacity: 0.2 }} />
              </button>
            ))
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <IonIcon icon={searchOutline} style={{ fontSize: 24, color: 'rgba(255,255,255,0.05)', marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.2)' }}>
                Nuk u gjet asnjë stacion
              </p>
            </div>
          )}
        </div>
      )}
      <style jsx>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateX(-10px); }
          to { opacity: 1; transform: scale(1) translateX(0); }
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
  const tripOptions = useStore((state: any) => state.tripOptions);
  const selectedTripOptionIndex = useStore((state: any) => state.selectedTripOptionIndex);
  const tripDepartureMode = useStore((state: any) => state.tripDepartureMode);
  const tripDepartureTime = useStore((state: any) => state.tripDepartureTime);
  const setTripDepartureMode = useStore((state: any) => state.setTripDepartureMode);
  const setTripDepartureTime = useStore((state: any) => state.setTripDepartureTime);
  const planTrip = useStore((state: any) => state.planTrip);
  const setTripResult = useStore((state: any) => state.setTripResult);
  const setSelectedTripOptionIndex = useStore((state: any) => state.setSelectedTripOptionIndex);
  const setActiveTrip = useStore((state: any) => state.setActiveTrip);
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
      addNotification(t.trip_different_stations, 'warning');
      return;
    }
    setLoading(true);

    try {
      await planTrip(tripFrom, tripTo);
    } catch (err) {
      addNotification(t.trip_planning_error, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (index: number) => {
    const option = tripOptions[index];
    if (!option) return;
    setSelectedTripOptionIndex(index);
    setTripResult(option);
    setActiveTrip(option);
  };

  const getCurrentPosition = async (options: any = {}) => {
    const fallbackToBrowser = async () => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        return new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
      }
      throw new Error('Geolocation not supported');
    };

    if (Capacitor.isNativePlatform()) {
      try {
        try {
          await Geolocation.requestPermissions();
        } catch (permissionError) {
          console.warn('Geolocation permission request failed:', permissionError);
        }
        return await Geolocation.getCurrentPosition(options);
      } catch (nativeError) {
        console.warn('Native geolocation failed, falling back to browser', nativeError);
        return await fallbackToBrowser();
      }
    }

    return await fallbackToBrowser();
  };

  const useMyLocation = async () => {
    try {
      const position = await getCurrentPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
      const { latitude, longitude } = position.coords;
      useStore.getState().setTripOriginCoords({ lat: latitude, lng: longitude });
      setTripFrom(t.my_location);
      addNotification(t.location_acquired, 'info');
    } catch (error) {
      console.error('TripPlanner location error:', error);
      addNotification(t.location_failed, 'danger');
    }
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
          <IonIcon icon={navigateOutline} style={{ fontSize: 18, color: '#fff' }} />
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
                icon={navigateOutline}
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
                icon={locationOutline}
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
              <IonIcon icon={swapVerticalOutline} style={{ fontSize: 14 }} />
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
              <IonIcon icon={locateOutline} style={{ fontSize: 13 }} /> {t.my_location}
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
                <IonIcon icon={searchOutline} style={{ fontSize: 14 }} /> {t.find_route} <IonIcon icon={arrowForwardOutline} style={{ fontSize: 14 }} />
              </>
            )}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { value: 'now', label: t.departure_mode_now || 'Now' },
                { value: 'depart_at', label: t.departure_mode_depart_at || 'Depart at' },
                { value: 'arrive_by', label: t.departure_mode_arrive_by || 'Arrive by' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTripDepartureMode(option.value as any)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: tripDepartureMode === option.value ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)',
                    border: tripDepartureMode === option.value ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
                    color: '#fff',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="datetime-local"
                value={tripDepartureTime}
                onChange={(e) => setTripDepartureTime(e.target.value)}
                disabled={tripDepartureMode === 'now'}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)',
                  background: tripDepartureMode === 'now' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
                  color: '#fff', fontSize: '12px'
                }}
              />
            </div>
          </div>
        </form>
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