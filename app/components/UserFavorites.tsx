'use client';
import { useState } from 'react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../store/useStore';
import {
  Star, Trash2, Bus, ArrowRight, MapPin, Route,
  Bell, BellOff, Clock, Navigation, Zap, Plus,
  Shield, CheckCircle2, History, TrendingUp, Leaf, ArrowLeft
} from 'lucide-react';
import { translations } from '../store/translations';

type Tab = 'routes' | 'stops' | 'activity';

function EmptyTab({ icon, text, action, actionLabel }: {
  icon: React.ReactNode; text: string; action: () => void; actionLabel: string;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 24px', gap: '16px', textAlign: 'center',
      background: 'rgba(255,255,255,0.01)', borderRadius: '20px',
      border: '0.5px dashed rgba(255,255,255,0.1)'
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{text}</p>
      <button 
        onClick={action}
        style={{
          background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
          padding: '8px 16px', borderRadius: '99px', color: '#fff', fontSize: '12px',
          fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
        }}
      >
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
  const buses = useStore((state: any) => state.buses) || [];
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;

  const [tab, setTab] = useState<Tab>('routes');
  const [notified, setNotified] = useState<{ [id: string]: boolean }>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const totalFavorites = (savedRoutes?.length || 0) + (savedStops?.length || 0);

  const toggleNotify = (id: string) => {
    setNotified(prev => {
      const next = { ...prev, [id]: !prev[id] };
      addNotification(
        next[id] 
          ? (language === 'al' ? `Njoftimet u aktivizuan për ${id}.` : language === 'en' ? `Notifications activated for ${id}.` : `Notifiche attivate per ${id}.`)
          : (language === 'al' ? `Njoftimet u çaktivizuan për ${id}.` : language === 'en' ? `Notifications deactivated for ${id}.` : `Notifiche disattivate per ${id}.`),
        'info'
      );
      return next;
    });
  };

  return (
    <div className="page-content">

      {/* ── Header ── */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setView('profile')}
          style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'rgba(245,158,11,0.1)',
          border: '0.5px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Star size={18} style={{ color: '#f59e0b' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>{t.saved}</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0, marginTop: '2px' }}>
            {totalFavorites} {language === 'al' ? (totalFavorites === 1 ? 'e preferuar' : 'të preferuara') : language === 'en' ? (totalFavorites === 1 ? 'favorite' : 'favorites') : (totalFavorites === 1 ? 'preferito' : 'preferiti')} {language === 'al' ? 'të ruajtura' : language === 'en' ? 'saved' : 'salvati'}
          </p>
        </div>
        <div style={{
          padding: '5px 10px', borderRadius: '99px',
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600',
        }}>
          Live Sync
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: language === 'al' ? 'Udhëtime' : language === 'en' ? 'Trips' : 'Viaggi', val: '24', icon: <History size={13} />, color: '#3b82f6' },
          { label: language === 'al' ? 'E kursyer' : language === 'en' ? 'Saved' : 'Risparmiato', val: '12kg', icon: <Leaf size={13} />, color: '#10b981' },
          { label: language === 'al' ? 'Përdorim' : language === 'en' ? 'Usage' : 'Utilizzo', val: '92%', icon: <TrendingUp size={13} />, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
            padding: '12px 8px', borderRadius: '12px', textAlign: 'center'
          }}>
            <div style={{ color: s.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{s.val}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: '8px', padding: '6px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px', marginBottom: '28px',
        border: '0.5px solid rgba(255,255,255,0.08)'
      }}>
        {([
          { key: 'routes' as Tab, label: t.routes, icon: Bus, count: savedRoutes?.length || 0 },
          { key: 'stops' as Tab, label: t.stations, icon: MapPin, count: savedStops?.length || 0 },
          { key: 'activity' as Tab, label: language === 'al' ? 'Aktiviteti' : language === 'en' ? 'Activity' : 'Attività', icon: History, count: 0 },
        ]).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: '12px',
              border: 'none', cursor: 'pointer',
              background: tab === key ? '#fff' : 'transparent',
              color: tab === key ? '#000' : 'rgba(255,255,255,0.4)',
              fontWeight: '700',
              fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s',
              boxShadow: tab === key ? '0 4px 12px rgba(255,255,255,0.1)' : 'none'
            }}
          >
            <Icon size={16} />
            {label}
            {count > 0 && (
              <span style={{
                padding: '1px 6px', borderRadius: '8px', fontSize: '10px',
                background: tab === key ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                color: tab === key ? '#000' : 'rgba(255,255,255,0.4)',
                fontWeight: '700'
              }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ minHeight: '300px' }}>
        {tab === 'routes' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
            gap: '12px' 
          }}>
            {!savedRoutes || savedRoutes.length === 0 ? (
              <EmptyTab
                icon={<Bus size={24} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                text={language === 'al' ? 'Nuk keni asnjë linjë të ruajtur.' : language === 'en' ? 'No routes saved yet.' : 'Nessuna linea salvata.'}
                action={() => setView('tracker')}
                actionLabel={t.routes}
              />
            ) : (
              savedRoutes.map((route: any) => {
                const r = BUS_ROUTES.find(x => x.id === route.id) || route;
                const activeBusesCount = buses.filter((b: any) => b.routeId === r.id).length;
                const isHovered = hoveredId === r.id;
                return (
                  <div
                    key={r.id}
                    onMouseEnter={() => setHoveredId(r.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      background: isHovered ? `${r.color}08` : 'rgba(255,255,255,0.02)',
                      border: `0.5px solid ${isHovered ? (r.color + '60') : (r.color + '30')}`,
                      borderLeft: `2.5px solid ${r.color}`,
                      borderRadius: '0 14px 14px 0',
                      padding: '14px 16px',
                      transition: 'all 0.15s',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: `${r.color}15`,
                        border: `0.5px solid ${r.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '800', fontSize: '13px', color: r.color, flexShrink: 0,
                      }}>
                        {r.id}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0 }}>
                            {r.name}
                          </h3>
                          {activeBusesCount > 0 && (
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b98160' }} />
                          )}
                        </div>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                          {activeBusesCount > 0 
                            ? (language === 'al' ? `${activeBusesCount} autobuzë aktivë tani` : language === 'en' ? `${activeBusesCount} active buses now` : `${activeBusesCount} autobus attivi ora`) 
                            : (language === 'al' ? 'Asnjë aktiv aktualisht' : language === 'en' ? 'None active currently' : 'Nessuno attivo')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => toggleNotify(r.id)}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: notified[r.id] ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                            border: `0.5px solid ${notified[r.id] ? '#f59e0b40' : 'rgba(255,255,255,0.08)'}`,
                            color: notified[r.id] ? '#f59e0b' : 'rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          {notified[r.id] ? <Bell size={13} /> : <BellOff size={13} />}
                        </button>
                        <button
                          onClick={() => { setSelectedRoute?.(r.id); setView('tracker'); }}
                          style={{
                            height: '32px', padding: '0 12px', borderRadius: '8px',
                            background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '600',
                            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                          }}
                        >
                          <ArrowRight size={12} /> {language === 'al' ? 'Ndjek' : language === 'en' ? 'Track' : 'Segui'}
                        </button>
                        <button
                          onClick={() => removeSavedRoute(r.id)}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'stops' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
            gap: '12px' 
          }}>
            {!savedStops || savedStops.length === 0 ? (
              <EmptyTab
                icon={<MapPin size={24} style={{ color: 'rgba(255,255,255,0.2)' }} />}
                text={language === 'al' ? 'Nuk keni asnjë stacion të ruajtur.' : language === 'en' ? 'No stops saved yet.' : 'Nessuna fermata salvata.'}
                action={() => setView('map')}
                actionLabel={t.map}
              />
            ) : (
              savedStops.map((stop: any) => {
                const s = BUS_STOPS.find(x => x.id === stop.id || x.name === stop.name) || stop;
                const stopRoutes = BUS_ROUTES.filter(r => r.stops?.includes(s.id) || r.stops?.includes(s.name));
                const isHovered = hoveredId === (s.id || s.name);
                return (
                  <div
                    key={s.id || s.name}
                    onMouseEnter={() => setHoveredId(s.id || s.name)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      background: isHovered ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `0.5px solid ${isHovered ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '14px',
                      padding: '14px 16px',
                      transition: 'all 0.15s',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: 'rgba(59,130,246,0.1)', border: '0.5px solid rgba(59,130,246,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <MapPin size={18} style={{ color: '#3b82f6' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0 }}>{s.name}</h3>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                          {stopRoutes.length} {language === 'al' ? 'linja kalojnë këtu' : language === 'en' ? 'routes pass here' : 'linee passano qui'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => { setTripFrom?.(s.name); setView('planner'); }}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'rgba(16,185,129,0.08)', border: '0.5px solid rgba(16,185,129,0.2)',
                            color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <Route size={13} />
                        </button>
                        <button
                          onClick={() => removeSavedStop?.(s.id || s.name)}
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { type: 'trip', label: 'Qendër → Kombinat', time: language === 'al' ? 'Dje, 18:40' : 'Yesterday, 18:40', score: '+15' },
              { type: 'save', label: language === 'al' ? 'Ruajtur Linja 14' : 'Saved Route 14', time: language === 'al' ? '2 ditë më parë' : '2 days ago', score: '+5' },
              { type: 'check', label: language === 'al' ? 'Kontrolluar Stacioni "Qendër"' : 'Checked Station "Center"', time: language === 'al' ? 'Sot, 09:12' : 'Today, 09:12', score: '+2' },
            ].map((act, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {act.type === 'trip' ? <Route size={13} /> : (act.type === 'save' ? <Star size={13} /> : <CheckCircle2 size={13} />)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{act.label}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>{act.time}</div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981' }}>{act.score} pts</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Security ── */}
      <div style={{
        marginTop: '32px', padding: '16px', borderRadius: '16px',
        background: 'rgba(16,185,129,0.03)', border: '0.5px solid rgba(16,185,129,0.1)',
        display: 'flex', gap: '12px', alignItems: 'center'
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '10px',
          background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Shield size={16} style={{ color: '#10b981' }} />
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#fff', margin: 0 }}>{language === 'al' ? 'Mbrojtja e të dhënave' : language === 'en' ? 'Data Protection' : 'Protezione Dati'}</p>
          <p style={{ fontSize: '11px', color: 'rgba(16,185,129,0.6)', margin: 0 }}>{language === 'al' ? 'Preferencat tuaja ruhen në mënyrë të enkriptuar.' : language === 'en' ? 'Your preferences are stored encrypted.' : 'Le tue preferenze sono memorizzate in modo criptato.'}</p>
        </div>
      </div>
    </div>
  );
}