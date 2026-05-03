'use client';
import { useState } from 'react';
import useStore, { BUS_STOPS } from '../store/useStore';
import { BUS_ROUTES } from '@/next.config';
import {
  Star, Trash2, Bus, ArrowRight, MapPin, Route,
  Bell, BellOff, Clock, Navigation, Zap, Plus
} from 'lucide-react';

type Tab = 'routes' | 'stops';

function EmptyTab({ icon, text, action, actionLabel }: {
  icon: React.ReactNode; text: string; action: () => void; actionLabel: string;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 24px', gap: '14px', textAlign: 'center'
    }}>
      <div style={{
        width: '60px', height: '60px', borderRadius: '16px',
        background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{text}</p>
      <button className="btn btn-ghost" style={{ fontSize: '13px' }} onClick={action}>
        <Plus size={14} /> {actionLabel}
      </button>
    </div>
  );
}

export default function UserFavorites() {
  const savedRoutes = useStore((state: any) => state.savedRoutes);
  const removeSavedRoute = useStore((state: any) => state.removeSavedRoute);
  const savedStops = useStore((state: any) => state.savedStops);
  const removeSavedStop = useStore((state: any) => state.removeSavedStop);
  const setView = useStore((state: any) => state.setView);
  const setSelectedRoute = useStore((state: any) => state.setSelectedRoute);
  const setTripFrom = useStore((state: any) => state.setTripFrom);
  const addNotification = useStore((state: any) => state.addNotification);

  const [tab, setTab] = useState<Tab>('routes');
  const [notified, setNotified] = useState<{ [id: string]: boolean }>({});

  const totalFavorites = (savedRoutes?.length || 0) + (savedStops?.length || 0);

  const toggleNotify = (id: string) => {
    setNotified(prev => {
      const next = { ...prev, [id]: !prev[id] };
      addNotification(
        next[id] ? `Njoftimet u aktivizuan për ${id}.` : `Njoftimet u çaktivizuan për ${id}.`,
        'info'
      );
      return next;
    });
  };

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (totalFavorites === 0) {
    return (
      <div className="page-content" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: '20px', textAlign: 'center'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '24px',
          background: 'rgba(245,158,11,0.1)', border: '1.5px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Star size={36} style={{ color: 'var(--warning, #f59e0b)' }} />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
            Asnjë e preferuar akoma
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.6' }}>
            Shto linjat dhe stacionet e preferuara për t'i aksesuar shpejt çdo herë.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => setView('tracker')}>
            <Bus size={15} /> Shiko Linjat
          </button>
          <button className="btn btn-ghost" onClick={() => setView('map')}>
            <MapPin size={15} /> Harta
          </button>
        </div>

        {/* Quick suggestions */}
        <div style={{
          marginTop: '8px', padding: '20px', borderRadius: '16px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          maxWidth: '380px', width: '100%'
        }}>
          <p style={{
            fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '12px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Zap size={12} /> Linjat më të shfrytëzuara
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {BUS_ROUTES.slice(0, 4).map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: `${r.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '12px', color: r.color, flexShrink: 0
                }}>
                  {r.id}
                </div>
                <span style={{ fontSize: '13px', flex: 1, textAlign: 'left' }}>{r.name}</span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: '5px 10px', fontSize: '11px' }}
                  onClick={() => {
                    setView('tracker');
                    addNotification(`Linja ${r.id} — shtyp ⭐ për ta ruajtur.`, 'info');
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────────────
  return (
    <div className="page-content" style={{ maxWidth: '720px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(245,158,11,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Star size={20} style={{ color: 'var(--warning, #f59e0b)' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Të Preferuarat</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginLeft: '52px' }}>
          {totalFavorites} {totalFavorites === 1 ? 'e preferuar' : 'të preferuara'} të ruajtura
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', padding: '4px',
        background: 'var(--bg-secondary, rgba(255,255,255,0.04))',
        borderRadius: '12px', marginBottom: '20px',
        border: '1px solid var(--border)'
      }}>
        {([
          { key: 'routes' as Tab, label: 'Linjat', icon: Bus, count: savedRoutes?.length || 0 },
          { key: 'stops' as Tab, label: 'Stacionet', icon: MapPin, count: savedStops?.length || 0 },
        ]).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, padding: '10px 16px', borderRadius: '9px',
              border: 'none', cursor: 'pointer',
              background: tab === key ? 'var(--bg-card, #1e1e2e)' : 'none',
              color: tab === key ? 'var(--text)' : 'var(--text-muted)',
              fontWeight: tab === key ? '700' : '500',
              fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s',
              boxShadow: tab === key ? '0 1px 6px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            <Icon size={15} />
            {label}
            {count > 0 && (
              <span style={{
                padding: '1px 7px', borderRadius: '20px', fontSize: '11px',
                background: tab === key ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)',
                color: tab === key ? 'var(--warning, #f59e0b)' : 'var(--text-muted)',
                fontWeight: '700'
              }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Routes Tab ── */}
      {tab === 'routes' && (
        <div>
          {!savedRoutes || savedRoutes.length === 0 ? (
            <EmptyTab
              icon={<Bus size={28} style={{ color: 'var(--text-muted)' }} />}
              text="Nuk ke ruajtur asnjë linjë akoma."
              action={() => setView('tracker')}
              actionLabel="Shiko Linjat"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedRoutes.map((route: any) => {
                const r = BUS_ROUTES.find(x => x.id === route.id) || route;
                return (
                  <div key={r.id} className="card" style={{
                    padding: '18px 20px',
                    borderLeft: `4px solid ${r.color}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Badge */}
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '12px',
                        background: `${r.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '900', fontSize: '15px', color: r.color, flexShrink: 0,
                        border: `1.5px solid ${r.color}30`
                      }}>
                        {r.id}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0, marginBottom: '3px' }}>
                          {r.name}
                        </h3>
                        <p style={{
                          fontSize: '12px', color: 'var(--text-muted)', margin: 0,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>
                          {r.label || r.name}
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          title={notified[r.id] ? 'Çaktivizo njoftimet' : 'Aktivizo njoftimet'}
                          onClick={() => toggleNotify(r.id)}
                          style={{
                            width: '34px', height: '34px', borderRadius: '8px',
                            background: notified[r.id] ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${notified[r.id] ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: notified[r.id] ? 'var(--warning, #f59e0b)' : 'var(--text-muted)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {notified[r.id] ? <Bell size={14} /> : <BellOff size={14} />}
                        </button>

                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: '12px', height: '34px' }}
                          onClick={() => {
                            if (setSelectedRoute) setSelectedRoute(r.id);
                            setView('tracker');
                            addNotification(`Duke shikuar linjën ${r.id}...`, 'info');
                          }}
                        >
                          <ArrowRight size={13} /> Ndjek
                        </button>

                        <button
                          title="Fshi nga të preferuarat"
                          onClick={() => {
                            removeSavedRoute(r.id);
                            addNotification(`Linja ${r.id} u hoq nga të preferuarat.`, 'info');
                          }}
                          style={{
                            width: '34px', height: '34px', borderRadius: '8px',
                            background: 'rgba(239,68,68,0.06)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--danger, #ef4444)', transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div style={{
                      marginTop: '14px', paddingTop: '12px',
                      borderTop: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Aktiv</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                        <Clock size={11} />
                        <span style={{ fontSize: '11px' }}>Çdo 10-15 min</span>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                        40 Lekë / biletë
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Stops Tab ── */}
      {tab === 'stops' && (
        <div>
          {!savedStops || savedStops.length === 0 ? (
            <EmptyTab
              icon={<MapPin size={28} style={{ color: 'var(--text-muted)' }} />}
              text="Nuk ke ruajtur asnjë stacion akoma."
              action={() => setView('map')}
              actionLabel="Shiko Hartën"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {savedStops.map((stop: any) => {
                const s = BUS_STOPS.find(x => x.id === stop.id || x.name === stop.name) || stop;
                const stopRoutes = BUS_ROUTES.filter(r =>
                  r.stops?.includes(s.name) || r.stops?.includes(s.id)
                );
                return (
                  <div key={s.id || s.name} className="card" style={{ padding: '18px 20px', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '46px', height: '46px', borderRadius: '12px',
                        background: 'rgba(59,130,246,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, border: '1.5px solid rgba(59,130,246,0.2)'
                      }}>
                        <MapPin size={20} style={{ color: 'var(--primary, #3b82f6)' }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', margin: 0, marginBottom: '3px' }}>
                          {s.name}
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                          {stopRoutes.length > 0 ? `${stopRoutes.length} linjë kalojnë këtu` : 'Stacion Urban'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        <button
                          title="Plano udhëtim nga ky stacion"
                          onClick={() => {
                            if (setTripFrom) setTripFrom(s.name);
                            setView('planner');
                            addNotification(`"${s.name}" u vendos si pikënisje.`, 'info');
                          }}
                          style={{
                            width: '34px', height: '34px', borderRadius: '8px',
                            background: 'rgba(59,130,246,0.08)',
                            border: '1px solid rgba(59,130,246,0.2)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary, #3b82f6)', transition: 'all 0.2s'
                          }}
                        >
                          <Route size={13} />
                        </button>

                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: '12px', height: '34px' }}
                          onClick={() => {
                            setView('map');
                            addNotification(`Po hap "${s.name}" në hartë.`, 'info');
                          }}
                        >
                          <Navigation size={13} /> Harta
                        </button>

                        <button
                          title="Fshi"
                          onClick={() => {
                            removeSavedStop?.(s.id || s.name);
                            addNotification(`"${s.name}" u hoq nga të preferuarat.`, 'info');
                          }}
                          style={{
                            width: '34px', height: '34px', borderRadius: '8px',
                            background: 'rgba(239,68,68,0.06)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--danger, #ef4444)', transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Lines at this stop */}
                    {stopRoutes.length > 0 && (
                      <div style={{
                        marginTop: '12px', paddingTop: '12px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Linjat:</span>
                        {stopRoutes.slice(0, 8).map(r => (
                          <span key={r.id} style={{
                            padding: '3px 9px', borderRadius: '20px',
                            background: `${r.color}18`,
                            color: r.color, fontSize: '11px', fontWeight: '700',
                            border: `1px solid ${r.color}30`
                          }}>
                            {r.id}
                          </span>
                        ))}
                        {stopRoutes.length > 8 && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+{stopRoutes.length - 8}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tip */}
      <div style={{
        marginTop: '20px', padding: '14px 16px', borderRadius: '12px',
        background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)',
        display: 'flex', gap: '10px', alignItems: 'center'
      }}>
        <Star size={14} style={{ color: 'var(--warning, #f59e0b)', flexShrink: 0 }} />
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          Shtyp <strong>⭐</strong> pranë çdo linje ose stacioni për ta shtuar këtu shpejt.
        </p>
      </div>
    </div>
  );
}