'use client';
import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import useStore, { BUS_STOPS, BUS_ROUTES } from '../../store/useStore';
import {
  trashOutline,
  busOutline,
  arrowForwardOutline,
  locationOutline,
  navigateOutline,
  notificationsOutline,
  notificationsOffOutline,
  timeOutline,
  starOutline,
  shieldOutline,
  checkmarkCircleOutline,
  trendingUpOutline,
  leafOutline,
  addOutline,
  alertCircleOutline,
  closeOutline,
} from 'ionicons/icons';
import { translations } from '../../store/translations';

// ── Types ────────────────────────────────────────────────────────────────────
interface SavedRoute {
  id: string;
  name: string;
  color: string;
  stops?: string[];
}

interface SavedStop {
  id: string | number;
  name: string;
}

type Tab = 'routes' | 'stops' | 'activity';

// ── Activity log type ─────────────────────────────────────────────────────────
interface ActivityItem {
  type: 'trip' | 'save' | 'check';
  labelKey: string;
  timeKey: string;
  score: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function EmptyTab({ icon, text, action, actionLabel }: {
  icon: React.ReactNode;
  text: string;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 24px', gap: '16px', textAlign: 'center',
      background: 'rgba(255,255,255,0.01)', borderRadius: '20px',
      border: '0.5px dashed rgba(255,255,255,0.1)',
      animation: 'fadeUp 0.3s ease',
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{text}</p>
      <button
        onClick={action}
        style={{
          background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
          padding: '8px 16px', borderRadius: '99px', color: '#fff', fontSize: '12px',
          fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
      >
        <IonIcon icon={addOutline} style={{ fontSize: 14 }} /> {actionLabel}
      </button>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      height: '66px', borderRadius: '14px',
      background: 'rgba(255,255,255,0.03)',
      border: '0.5px solid rgba(255,255,255,0.06)',
      animation: 'pulse 1.6s ease-in-out infinite',
    }} />
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function ConfirmModal({ label, onConfirm, onCancel, t }: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
  t: Record<string, string>;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      animation: 'fadeUp 0.2s ease',
    }}>
      <div style={{
        background: '#111', border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: '20px', padding: '24px', maxWidth: '320px', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IonIcon icon={alertCircleOutline} style={{ fontSize: 18, color: '#ef4444' }} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff', margin: 0 }}>
              {t.fav_confirm_title || 'Fshi nga të preferuarat?'}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0' }}>
              {label}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
          >
            <IonIcon icon={closeOutline} style={{ fontSize: 14, marginRight: 6 }} />
            {t.fav_cancel || 'Anulo'}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              background: 'rgba(239,68,68,0.12)', border: '0.5px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
          >
            <IonIcon icon={trashOutline} style={{ fontSize: 14, marginRight: 6 }} />
            {t.fav_delete || 'Fshi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function UserFavorites() {
  const savedRoutes: SavedRoute[] = useStore((state: any) => state.savedRoutes) || [];
  const removeSavedRoute = useStore((state: any) => state.removeSavedRoute);
  const savedStops: SavedStop[] = useStore((state: any) => state.savedStops) || [];
  const removeSavedStop = useStore((state: any) => state.removeSavedStop);
  const setView = useStore((state: any) => state.setView);
  const setSelectedRoute = useStore((state: any) => state.setSelectedRoute);
  const setTripFrom = useStore((state: any) => state.setTripFrom);
  const addNotification = useStore((state: any) => state.addNotification);
  const buses = useStore((state: any) => state.buses) || [];
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;

  const [tab, setTab] = useState<Tab>('routes');
  const [notified, setNotified] = useState<Record<string, boolean>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string; type: 'route' | 'stop' } | null>(null);
  const isLoading = false; // replace with real loading state from store if available

  // ── Computed stats from real data ─────────────────────────────────────────
  const totalFavorites = savedRoutes.length + savedStops.length;
  const activeRoutesCount = savedRoutes.filter(r =>
    buses.some((b: any) => b.routeId === r.id)
  ).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleNotify = (id: string, name: string) => {
    setNotified(prev => {
      const next = { ...prev, [id]: !prev[id] };
      addNotification(
        next[id]
          ? (t.fav_notify_on || 'Njoftimet u aktivizuan për {id}').replace('{id}', name)
          : (t.fav_notify_off || 'Njoftimet u çaktivizuan për {id}').replace('{id}', name),
        'info'
      );
      return next;
    });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'route') removeSavedRoute(pendingDelete.id);
    else removeSavedStop(pendingDelete.id);
    setPendingDelete(null);
  };

  // ── Activity items with translation keys ─────────────────────────────────
  const activityItems: ActivityItem[] = [
    { type: 'trip', labelKey: 'fav_act_trip', timeKey: 'fav_act_time_1', score: '+15' },
    { type: 'save', labelKey: 'fav_act_save', timeKey: 'fav_act_time_2', score: '+5' },
    { type: 'check', labelKey: 'fav_act_check', timeKey: 'fav_act_time_3', score: '+2' },
  ];

  return (
    <>
      {/* ── CSS animations ─────────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }
        .fav-card { animation: fadeUp 0.25s ease both; }
        .fav-card:nth-child(1) { animation-delay: 0ms; }
        .fav-card:nth-child(2) { animation-delay: 40ms; }
        .fav-card:nth-child(3) { animation-delay: 80ms; }
        .fav-card:nth-child(4) { animation-delay: 120ms; }
        .fav-card:nth-child(5) { animation-delay: 160ms; }
      `}</style>

      {/* ── Delete confirm modal ─────────────────────────────────────────── */}
      {pendingDelete && (
        <ConfirmModal
          label={pendingDelete.label}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
          t={t}
        />
      )}

      <div className="page-content">

        {/* ── Header (no back button) ────────────────────────────────────── */}
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>
              {t.saved}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '2px 0 0' }}>
              {totalFavorites} {totalFavorites === 1 ? t.fav_favorite : t.fav_favorites} {t.fav_saved_adj}
            </p>
          </div>
          {activeRoutesCount > 0 && (
            <div style={{
              padding: '5px 10px', borderRadius: '99px',
              background: 'rgba(16,185,129,0.08)',
              border: '0.5px solid rgba(16,185,129,0.2)',
              fontSize: '11px', color: '#10b981', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              {activeRoutesCount} Live
            </div>
          )}
        </div>

        {/* ── Stats Row (computed from real data) ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            {
              label: t.fav_trips,
              val: String(savedRoutes.length),
              icon: <IonIcon icon={busOutline} style={{ fontSize: 13, color: '#3b82f6' }} />,
              color: '#3b82f6',
            },
            {
              label: t.fav_saved,
              val: String(savedStops.length),
              icon: <IonIcon icon={leafOutline} style={{ fontSize: 13, color: '#10b981' }} />,
              color: '#10b981',
            },
            {
              label: t.fav_usage,
              val: activeRoutesCount > 0 ? `${activeRoutesCount} ✓` : '—',
              icon: <IonIcon icon={trendingUpOutline} style={{ fontSize: 13, color: '#8b5cf6' }} />,
              color: '#8b5cf6',
            },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
              padding: '12px 8px', borderRadius: '12px', textAlign: 'center',
            }}>
              <div style={{ color: s.color, marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '8px', padding: '6px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px', marginBottom: '28px',
          border: '0.5px solid rgba(255,255,255,0.08)',
        }}>
          {([
            { key: 'routes' as Tab, label: t.routes, icon: busOutline, count: savedRoutes.length },
            { key: 'stops' as Tab, label: t.stations, icon: locationOutline, count: savedStops.length },
            { key: 'activity' as Tab, label: t.fav_activity, icon: timeOutline, count: 0 },
          ]).map(({ key, label, icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: '12px',
                border: 'none', cursor: 'pointer',
                background: tab === key ? '#fff' : 'transparent',
                color: tab === key ? '#000' : 'rgba(255,255,255,0.4)',
                fontWeight: '700', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.2s',
                boxShadow: tab === key ? '0 4px 12px rgba(255,255,255,0.1)' : 'none',
              }}
            >
              <IonIcon icon={icon} style={{ fontSize: 16 }} />
              {label}
              {count > 0 && (
                <span style={{
                  padding: '1px 6px', borderRadius: '8px', fontSize: '10px',
                  background: tab === key ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                  color: tab === key ? '#000' : 'rgba(255,255,255,0.4)',
                  fontWeight: '700',
                }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div style={{ minHeight: '300px' }}>

          {/* Routes tab */}
          {tab === 'routes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '12px' }}>
              {isLoading ? (
                [1, 2, 3].map(i => <SkeletonCard key={i} />)
              ) : savedRoutes.length === 0 ? (
                <EmptyTab
                  icon={<IonIcon icon={busOutline} style={{ fontSize: 24, color: 'rgba(255,255,255,0.2)' }} />}
                  text={t.fav_no_routes}
                  action={() => setView('tracker')}
                  actionLabel={t.routes}
                />
              ) : (
                savedRoutes.map((route: SavedRoute) => {
                  const r = BUS_ROUTES.find((x: any) => x.id === route.id) || route;
                  const activeBusesCount = buses.filter((b: any) => b.routeId === r.id).length;
                  const isHovered = hoveredId === r.id;
                  return (
                    <div
                      key={r.id}
                      className="fav-card"
                      onMouseEnter={() => setHoveredId(r.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        background: isHovered ? `${r.color}08` : 'rgba(255,255,255,0.02)',
                        border: `0.5px solid ${isHovered ? (r.color + '60') : (r.color + '30')}`,
                        borderLeft: `2.5px solid ${r.color}`,
                        borderRadius: '0 14px 14px 0',
                        padding: '14px 16px',
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px',
                          background: `${r.color}15`, border: `0.5px solid ${r.color}40`,
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
                              <div style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: '#10b981', boxShadow: '0 0 8px #10b98160',
                              }} />
                            )}
                          </div>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                            {activeBusesCount > 0
                              ? `${activeBusesCount} ${t.fav_active_buses}`
                              : t.fav_no_active}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            aria-label={notified[r.id] ? t.fav_notif_disable || 'Çaktivizo njoftime' : t.fav_notif_enable || 'Aktivizo njoftime'}
                            onClick={() => toggleNotify(r.id, r.name)}
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: notified[r.id] ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                              border: `0.5px solid ${notified[r.id] ? '#f59e0b40' : 'rgba(255,255,255,0.08)'}`,
                              color: notified[r.id] ? '#f59e0b' : 'rgba(255,255,255,0.25)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            <IonIcon
                              icon={notified[r.id] ? notificationsOutline : notificationsOffOutline}
                              style={{ fontSize: 13 }}
                            />
                          </button>
                          <button
                            aria-label={t.fav_track || 'Gjurmo'}
                            onClick={() => { setSelectedRoute(r.id); setView('tracker'); }}
                            style={{
                              height: '32px', padding: '0 12px', borderRadius: '8px',
                              background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '600',
                              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                          >
                            <IonIcon icon={arrowForwardOutline} style={{ fontSize: 12 }} />
                            {t.fav_track}
                          </button>
                          <button
                            aria-label={t.fav_remove_route || 'Hiq nga të preferuarat'}
                            onClick={() => setPendingDelete({ id: r.id, label: r.name, type: 'route' })}
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.2)',
                              color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.14)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                          >
                            <IonIcon icon={trashOutline} style={{ fontSize: 13 }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Stops tab */}
          {tab === 'stops' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '12px' }}>
              {isLoading ? (
                [1, 2, 3].map(i => <SkeletonCard key={i} />)
              ) : savedStops.length === 0 ? (
                <EmptyTab
                  icon={<IonIcon icon={locationOutline} style={{ fontSize: 24, color: 'rgba(255,255,255,0.2)' }} />}
                  text={t.fav_no_stops}
                  action={() => setView('map')}
                  actionLabel={t.map}
                />
              ) : (
                savedStops.map((stop: SavedStop) => {
                  const s = BUS_STOPS.find((x: any) => x.id === stop.id || x.name === stop.name) || stop;
                  const stopId = String(s.id || s.name);
                  const stopRoutes = BUS_ROUTES.filter((r: any) =>
                    r.stops?.includes(s.id) || r.stops?.includes(s.name)
                  );
                  const isHovered = hoveredId === stopId;
                  return (
                    <div
                      key={stopId}
                      className="fav-card"
                      onMouseEnter={() => setHoveredId(stopId)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        background: isHovered ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `0.5px solid ${isHovered ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: '14px',
                        padding: '14px 16px',
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px',
                          background: 'rgba(59,130,246,0.1)', border: '0.5px solid rgba(59,130,246,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <IonIcon icon={locationOutline} style={{ fontSize: 18, color: '#3b82f6' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0 }}>
                            {s.name}
                          </h3>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                            {stopRoutes.length} {t.fav_routes_pass_here}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            aria-label={t.fav_plan_from || 'Plano nga ky stacion'}
                            onClick={() => { setTripFrom(s.name); setView('planner'); }}
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: 'rgba(16,185,129,0.08)', border: '0.5px solid rgba(16,185,129,0.2)',
                              color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.16)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.08)')}
                          >
                            <IonIcon icon={navigateOutline} style={{ fontSize: 13 }} />
                          </button>
                          <button
                            aria-label={t.fav_remove_stop || 'Hiq stacionin'}
                            onClick={() => setPendingDelete({ id: stopId, label: s.name, type: 'stop' })}
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.2)',
                              color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'background 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.14)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
                          >
                            <IonIcon icon={trashOutline} style={{ fontSize: 13 }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Activity tab */}
          {tab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activityItems.length === 0 ? (
                <EmptyTab
                  icon={<IonIcon icon={timeOutline} style={{ fontSize: 24, color: 'rgba(255,255,255,0.2)' }} />}
                  text={t.fav_no_activity || 'Asnjë aktivitet ende'}
                  action={() => setView('tracker')}
                  actionLabel={t.routes}
                />
              ) : (
                activityItems.map((act) => (
                  <div
                    key={act.labelKey}
                    className="fav-card"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                      background: 'rgba(255,255,255,0.02)', borderRadius: '12px',
                      border: '0.5px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {act.type === 'trip'
                        ? <IonIcon icon={navigateOutline} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }} />
                        : act.type === 'save'
                          ? <IonIcon icon={starOutline} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }} />
                          : <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }} />
                      }
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>
                        {t[act.labelKey] || act.labelKey}
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
                        {t[act.timeKey] || act.timeKey}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981' }}>
                      {act.score} pts
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ── Security footer ───────────────────────────────────────────── */}
        <div style={{
          marginTop: '32px', padding: '16px', borderRadius: '16px',
          background: 'rgba(16,185,129,0.03)', border: '0.5px solid rgba(16,185,129,0.1)',
          display: 'flex', gap: '12px', alignItems: 'center',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'rgba(16,185,129,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IonIcon icon={shieldOutline} style={{ fontSize: 16, color: '#10b981' }} />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#fff', margin: 0 }}>
              {t.fav_data_protection}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(16,185,129,0.6)', margin: 0 }}>
              {t.fav_encryption}
            </p>
          </div>
        </div>

      </div>
    </>
  );
}