'use client';
import { useState, useEffect } from 'react';
import {
  Bus, Clock, Activity, LogOut,
  Calendar, User, Navigation,
  Users, Zap, Droplets, AlertTriangle
} from 'lucide-react';
import useStore from '../store/useStore';

export default function StaffDashboard() {
  const currentAccount = useStore((state: any) => state.currentAccount);
  const logout = useStore((state: any) => state.logout);
  const [liveProfile, setLiveProfile] = useState<any>(null);
  const [assignedBus, setAssignedBus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'mjeti' | 'programi' | 'oraret'>('mjeti');
  const [isLoading, setIsLoading] = useState(true);

  // --- Confirmation Modal State ---
  const [confModal, setConfModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmColor?: string;
    icon?: any;
  } | null>(null);

  const closeConf = () => setConfModal(null);
  const triggerConf = (data: { title: string, message: string, onConfirm: () => void, confirmText?: string, confirmColor?: string, icon?: any }) => {
    setConfModal({ ...data, isOpen: true });
  };

  useEffect(() => {
    if (!currentAccount?.id) return;
    const fetchLive = async () => {
      try {
        // Fetch fresh staff profile (weekly program updated by operator)
        const staffRes = await fetch(`/api/admin/staff?role=${currentAccount.role}&routeId=${currentAccount.routeId}`);
        if (staffRes.ok) {
          const list = await staffRes.json();
          const fresh = Array.isArray(list) ? list.find((s: any) => s.id === currentAccount.id) : null;
          if (fresh) setLiveProfile(fresh);
        }
        // Fetch assigned bus with schedules
        const busRes = await fetch('/api/admin/buses');
        if (busRes.ok) {
          const buses = await busRes.json();
          const myId = currentAccount.id || currentAccount._id?.toString();
          const myBus = buses.find((b: any) => {
            const bDriverId = typeof b.driverId === 'object' ? (b.driverId.id || b.driverId._id?.toString()) : b.driverId;
            const bInspectorId = typeof b.inspectorId === 'object' ? (b.inspectorId.id || b.inspectorId._id?.toString()) : b.inspectorId;
            return currentAccount.role === 'driver' ? bDriverId === myId : bInspectorId === myId;
          });
          setAssignedBus(myBus || null);
        }
      } catch (err) {
        console.error('StaffDashboard live fetch failed', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLive();
    const iv = setInterval(fetchLive, 30000);
    return () => clearInterval(iv);
  }, [currentAccount?.id, currentAccount?.role, currentAccount?.routeId]);

  if (!currentAccount) return null;

  const profile = liveProfile || currentAccount;

  const getShiftColor = (shift: string) => {
    if (shift?.includes('Mëngjes')) return '#3b82f6';
    if (shift?.includes('Pasdite')) return '#f59e0b';
    if (shift?.includes('Pushim')) return '#64748b';
    return '#10b981';
  };

  const days = ['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'];
  const weeklyProg = profile?.weeklyProgram || {
    'E Hënë': 'Mëngjes', 'E Martë': 'Mëngjes', 'E Mërkurë': 'Mëngjes',
    'E Enjte': 'Mëngjes', 'E Premte': 'Mëngjes', 'E Shtunë': 'Pushim', 'E Diel': 'Pushim'
  };
  const busPlate = assignedBus?.plate || assignedBus?.id || null;
  const busRoute = assignedBus?.routeId || null;
  const t1 = Array.isArray(assignedBus?.schedules?.terminal1) ? [...assignedBus.schedules.terminal1] : [];
  const t2 = Array.isArray(assignedBus?.schedules?.terminal2) ? [...assignedBus.schedules.terminal2] : [];
  const firstDeparture = (t1[0]?.d || t2[0]?.d || null);

  return (
    <div className="sds-shell">

      {/* ── TOPBAR ── */}
      <header className="sds-topbar">
        <div className="sds-topbar-left">
          <div className="sds-avatar">
            <Bus size={18} color="#a78bfa" />
          </div>
          <div>
            <div className="sds-name">{profile.name || currentAccount.name}</div>
            <div className="sds-meta">
              <span className="sds-role-badge">
                {currentAccount.role === 'driver' ? 'Drejtues' : 'Faturino'}
              </span>
              <span className="sds-id">#{profile.username || currentAccount.username}</span>
            </div>
          </div>
        </div>

        <div className="sds-topbar-right">
          <div className="sds-date-block">
            <span className="sds-date-day">
              {new Date().toLocaleDateString('al-AL', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className="sds-date-time">
              {new Date().toLocaleTimeString('al-AL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button onClick={() => {
            triggerConf({
              title: 'Dalja nga Sistemi',
              message: 'A je i sigurt që dëshiron të dalësh? Do të duhet të identifikohesh përsëri për të hyrë në profilin tënd.',
              confirmText: 'Dil',
              confirmColor: '#ef4444',
              icon: LogOut,
              onConfirm: logout
            });
          }} className="sds-logout-btn">
            <LogOut size={14} />
            <span>Dilni</span>
          </button>
        </div>
      </header>

      {/* --- CONFIRMATION MODAL --- */}
      {confModal?.isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '380px', background: '#111118', border: '1px solid #1e1e35',
            borderRadius: '24px', padding: '32px', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            animation: 'modalFadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '18px',
              background: `${confModal.confirmColor || '#ef4444'}15`,
              color: confModal.confirmColor || '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              {confModal.icon ? <confModal.icon size={24} /> : <AlertTriangle size={24} />}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 10px 0', color: '#fff' }}>
              {confModal.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 28px 0', lineHeight: '1.6' }}>
              {confModal.message}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={closeConf}
                style={{
                  padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                  color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '700'
                }}
              >
                Anulo
              </button>
              <button
                onClick={confModal.onConfirm}
                style={{
                  padding: '12px', borderRadius: '12px', background: confModal.confirmColor || '#ef4444',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: '700', boxShadow: `0 8px 20px ${confModal.confirmColor || '#ef4444'}30`
                }}
              >
                {confModal.confirmText || 'Konfirmo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
    @keyframes sds-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .sds-sk {
      background: linear-gradient(90deg, #1e1e2e 25%, #2a2a40 50%, #1e1e2e 75%);
      background-size: 200% 100%;
      animation: sds-shimmer 1.5s infinite;
      border-radius: 6px;
    }
    @keyframes modalFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 960px) {
          .sds-body { grid-template-columns: 1fr !important; }
          .sds-topbar-right .sds-logout-btn { display: none !important; }
          .sds-dynamic-island { display: flex !important; }
          
          /* Mobile content visibility */
          .sds-mobile-hidden { display: none !important; }
          .sds-mobile-visible { display: flex !important; }
        }
      `}</style>

      {/* ── DYNAMIC ISLAND (MOBILE NAV) ── */}
      <div className="sds-dynamic-island" style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'none', alignItems: 'center', gap: '8px',
        padding: '8px', borderRadius: '32px', background: 'rgba(13, 13, 26, 0.8)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {[
          { id: 'mjeti', label: 'Mjeti', icon: Bus },
          { id: 'programi', label: 'Programi', icon: Calendar },
          { id: 'oraret', label: 'Oraret', icon: Clock }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: activeTab === tab.id ? '10px 20px' : '10px',
              borderRadius: '24px', border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? '#a78bfa' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#94a3b8',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              fontWeight: '700', fontSize: '13px'
            }}
          >
            <tab.icon size={18} />
            {activeTab === tab.id && <span>{tab.label}</span>}
          </button>
        ))}
        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
        <button
          onClick={() => {
            triggerConf({
              title: 'Dalja nga Sistemi',
              message: 'A je i sigurt që dëshiron të dalësh?',
              confirmText: 'Dil',
              confirmColor: '#ef4444',
              icon: LogOut,
              onConfirm: logout
            });
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px', borderRadius: '50%', border: 'none',
            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer'
          }}
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* ── BODY ── */}
      <div className="sds-body">

        {/* ══ LEFT ══ */}
        <div className={`sds-left ${activeTab === 'oraret' ? 'sds-mobile-hidden' : ''}`}>

          {/* BUS CARD (Active on 'mjeti' or Desktop) */}
          <div className={`sds-bus-card ${activeTab !== 'mjeti' ? 'sds-mobile-hidden' : ''}`}>
            <div className="sds-bus-card-bg-circle" />
            <div className="sds-bus-card-bg-circle2" />
            <div className="sds-bus-card-inner">
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="sds-sk" style={{ width: '80px', height: '12px' }} />
                  <div className="sds-sk" style={{ width: '160px', height: '32px', borderRadius: 8 }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="sds-sk" style={{ width: '120px', height: '28px', borderRadius: 20 }} />
                    <div className="sds-sk" style={{ width: '100px', height: '28px', borderRadius: 20 }} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="sds-bus-label-row">
                    <div className="sds-live-dot" />
                    <span className="sds-live-text">LIVE</span>
                    <span className="sds-divider-dot">·</span>
                    <Navigation size={11} style={{ color: '#94a3b8' }} />
                    <span className="sds-bus-sublabel">Linja {busRoute || '—'}</span>
                  </div>
                  <div className="sds-bus-id" style={{ color: busPlate ? '#eab308' : '#475569', fontFamily: 'monospace', letterSpacing: '2px' }}>
                    {busPlate || 'Pa Caktuar'}
                  </div>
                  <div className="sds-bus-bottom">
                    <div className="sds-shift-pill">
                      <Clock size={12} color="#c084fc" />
                      <span>Turni: {weeklyProg[days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]] || '—'}</span>
                    </div>
                    <div className="sds-shift-pill">
                      <span style={{ color: '#94a3b8' }}>Fillimi</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{firstDeparture || '—'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* METRICS ROW (Active on 'mjeti' or Desktop) */}
          <div className={`sds-metrics-row ${activeTab !== 'mjeti' ? 'sds-mobile-hidden' : ''}`}>
            {isLoading ? (
              [0, 1, 2].map(i => (
                <div key={i} className="sds-metric-card">
                  <div className="sds-sk" style={{ width: '32px', height: '32px', borderRadius: '10px', margin: '0 auto 8px' }} />
                  <div className="sds-sk" style={{ width: '60px', height: '18px', borderRadius: 5, margin: '0 auto 6px' }} />
                  <div className="sds-sk" style={{ width: '80px', height: '10px', borderRadius: 4, margin: '0 auto 10px' }} />
                  <div className="sds-sk" style={{ width: '100%', height: '4px', borderRadius: 4 }} />
                </div>
              ))
            ) : [
              { label: 'Pasagjerë', value: '68%', bar: 68, icon: <Users size={14} />, color: '#a78bfa' },
              { label: 'Shpejtësi', value: '24 km/h', bar: 48, icon: <Zap size={14} />, color: '#38bdf8' },
              { label: 'Karburant', value: '22L/100km', bar: 72, icon: <Droplets size={14} />, color: '#fb923c' },
            ].map(({ label, value, bar, icon, color }) => (
              <div key={label} className="sds-metric-card">
                <div className="sds-metric-icon" style={{ color, background: `${color}1a` }}>{icon}</div>
                <div className="sds-metric-val" style={{ color }}>{value}</div>
                <div className="sds-metric-label">{label}</div>
                <div className="sds-metric-bar-bg">
                  <div className="sds-metric-bar-fill" style={{ width: `${bar}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          {/* WEEKLY (Active on 'programi' or Desktop) */}
          <div className={`sds-week-card ${activeTab !== 'programi' ? 'sds-mobile-hidden' : ''}`}>
            <div className="sds-week-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="sds-week-icon"><Calendar size={14} color="#fbbf24" /></div>
                <span className="sds-section-title">Programi Javor</span>
              </div>
              <span className="sds-week-range">12 – 18 Maj 2025</span>
            </div>
            <div className="sds-week-grid">
              {isLoading ? (
                days.map((d) => (
                  <div key={d} className="sds-day-cell">
                    <div className="sds-sk" style={{ width: '28px', height: '9px', borderRadius: 4, margin: '0 auto 8px' }} />
                    <div className="sds-sk" style={{ width: '48px', height: '24px', borderRadius: 7 }} />
                  </div>
                ))
              ) : days.map((day, idx) => {
                const shift = weeklyProg[day] || 'Pushim';
                const isToday = (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) === idx;
                const isOff = shift === 'Pushim';
                return (
                  <div key={day} className={`sds-day-cell ${isToday ? 'today' : ''} ${isOff ? 'off' : ''}`}>
                    <span className="sds-day-name">{day}</span>
                    <span className="sds-day-shift">{shift}</span>
                    {isToday && <span className="sds-today-badge">SOT</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className={`sds-right ${activeTab !== 'oraret' ? 'sds-mobile-hidden' : ''}`}>
          <div className="sds-schedule-panel-card">
            <div className="sds-schedule-card-header">
              <div>
                <div className="sds-section-title">Tabela e Orarit</div>
                <div className="sds-schedule-subtitle">Qendër / Thesari</div>
              </div>
            </div>

            <div className="sds-station-table">
              <div className="sds-station-header-row">
                <div className="sds-station-header">Terminali 1</div>
                <div className="sds-station-header">Terminali 2</div>
              </div>
              <div className="sds-station-subheader-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                <div className="sds-station-subheader">Nisja</div>
                <div className="sds-station-subheader">Mbërritja</div>
                <div className="sds-station-subheader">Nisja</div>
                <div className="sds-station-subheader">Mbërritja</div>
              </div>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="sds-station-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                    {[0, 1, 2, 3].map(ci => (
                      <div key={ci} className="sds-station-cell">
                        <div className="sds-sk" style={{ width: '52px', height: '14px', borderRadius: 4, margin: '0 auto' }} />
                      </div>
                    ))}
                  </div>
                ))
              ) : t1.length === 0 && t2.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--sd-muted)', fontSize: '13px' }}>
                  Nuk ka orar të caktuar për këtë mjet.
                </div>
              ) : (
                Array.from({ length: Math.max(t1.length, t2.length) }).map((_, i) => (
                  <div key={i} className="sds-station-row" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                    <div className="sds-station-cell" style={{ color: '#a5f3fc' }}>{t1[i]?.d || '—'}</div>
                    <div className="sds-station-cell" style={{ color: '#64748b' }}>{t1[i]?.a || '—'}</div>
                    <div className="sds-station-cell" style={{ color: '#a5f3fc' }}>{t2[i]?.d || '—'}</div>
                    <div className="sds-station-cell" style={{ color: '#64748b' }}>{t2[i]?.a || '—'}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
    .sds-shell {
      width: 100%; min-height: 100vh;
      background: #0a0a0f;
      color: #e2e8f0;
      padding: clamp(12px, 3vw, 28px);
      display: flex; flex-direction: column; gap: clamp(12px, 2vw, 20px);
      font-family: 'Inter', sans-serif;
      box-sizing: border-box;
    }

    /* TOPBAR */
    .sds-topbar {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px;
      background: #111118;
      border: 1px solid #1e1e2e;
      border-radius: 14px;
      padding: 14px 20px;
    }
    .sds-topbar-left { display: flex; align-items: center; gap: 12px; }
    .sds-topbar-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .sds-avatar {
      width: 40px; height: 40px; border-radius: 10px;
      background: #1a1030;
      border: 1px solid #2d1f5e;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sds-name { font-size: 14px; font-weight: 700; color: #f1f5f9; }
    .sds-meta { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
    .sds-role-badge {
      font-size: 10px; font-weight: 700; color: #c4b5fd;
      background: #1a1030; border: 1px solid #2d1f5e;
      padding: 2px 8px; border-radius: 20px;
    }
    .sds-id { font-size: 11px; color: #64748b; }
    .sds-date-block { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
    .sds-date-day { font-size: 12px; font-weight: 600; color: #cbd5e1; }
    .sds-date-time { font-size: 11px; color: #64748b; }
    .sds-logout-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 9px;
      background: #1a0f0f; color: #f87171;
      border: 1px solid #3d1515; cursor: pointer;
      font-size: 12px; font-weight: 600; transition: all 0.15s;
    }
    .sds-logout-btn:hover { background: #2a1515; }

    /* BODY */
    .sds-body {
      display: grid;
      grid-template-columns: 7fr 3fr;
      gap: clamp(12px, 2vw, 20px);
      flex: 1;
    }
    .sds-left { display: flex; flex-direction: column; gap: clamp(12px,2vw,16px); }
    .sds-right { display: flex; flex-direction: column; gap: clamp(12px,2vw,14px); }

    /* BUS CARD */
    .sds-bus-card {
      background: #0d0d1a;
      border: 1px solid #1e1e35;
      border-radius: 18px;
      padding: clamp(20px,4vw,32px);
      position: relative; overflow: hidden;
    }
    .sds-bus-card-bg-circle {
      position: absolute; right: -80px; top: -80px;
      width: 260px; height: 260px; border-radius: 50%;
      background: radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%);
      pointer-events: none;
    }
    .sds-bus-card-bg-circle2 {
      position: absolute; left: -40px; bottom: -40px;
      width: 160px; height: 160px; border-radius: 50%;
      background: radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%);
      pointer-events: none;
    }
    .sds-bus-card-inner { position: relative; z-index: 2; }
    .sds-bus-label-row {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 16px;
    }
    .sds-live-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 6px #4ade80;
      animation: pulse-dot 2s ease infinite;
    }
    @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .sds-live-text { font-size: 11px; font-weight: 800; color: #4ade80; letter-spacing: 0.08em; }
    .sds-divider-dot { color: #334155; }
    .sds-bus-sublabel { font-size: 11px; color: #94a3b8; }
    .sds-bus-id {
      font-size: clamp(40px, 8vw, 64px); font-weight: 800;
      color: #f8fafc; letter-spacing: 3px;
      font-family: 'Courier New', monospace; line-height: 1;
    }
    .sds-bus-bottom {
      display: flex; align-items: center; gap: 10px;
      margin-top: 20px; flex-wrap: wrap;
    }
    .sds-shift-pill {
      display: flex; align-items: center; gap: 6px;
      background: #111118; border: 1px solid #1e1e35;
      border-radius: 8px; padding: 7px 12px;
      font-size: 12px; color: #cbd5e1;
    }

    /* METRICS ROW */
    .sds-metrics-row {
      display: grid; grid-template-columns: repeat(3,1fr); gap: 12px;
    }
    .sds-metric-card {
      background: #111118; border: 1px solid #1e1e35;
      border-radius: 14px; padding: 16px 14px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .sds-metric-icon {
      width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 4px;
    }
    .sds-metric-val { font-size: 18px; font-weight: 800; line-height: 1; }
    .sds-metric-label { font-size: 11px; color: #64748b; }
    .sds-metric-bar-bg {
      height: 3px; background: #1e1e35; border-radius: 3px; overflow: hidden; margin-top: 4px;
    }
    .sds-metric-bar-fill { height: 100%; border-radius: 3px; }

    /* WEEKLY */
    .sds-week-card {
      background: #111118; border: 1px solid #1e1e35;
      border-radius: 18px; padding: clamp(16px,3vw,24px);
    }
    .sds-week-header {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 8px; margin-bottom: 18px;
    }
    .sds-week-icon {
      width: 28px; height: 28px; border-radius: 7px;
      background: #1c1500; display: flex; align-items: center; justify-content: center;
    }
    .sds-week-range { font-size: 11px; color: #64748b; }
    .sds-section-title { font-size: 13px; font-weight: 700; color: #e2e8f0; }
    .sds-week-grid {
      display: grid; grid-template-columns: repeat(7,1fr); gap: 8px;
    }
    .sds-day-cell {
      border-radius: 10px; padding: 12px 4px; text-align: center;
      background: #0a0a0f; border: 1px solid #1e1e2e;
      display: flex; flex-direction: column; gap: 6px; align-items: center;
      transition: all 0.15s;
    }
    .sds-day-cell.today {
      background: #1a1030; border-color: #4c1d95;
    }
    .sds-day-cell.off .sds-day-shift { color: #334155 !important; }
    .sds-day-name {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #475569;
    }
    .sds-day-cell.today .sds-day-name { color: #a78bfa; }
    .sds-day-shift { font-size: 11px; font-weight: 700; color: #86efac; }
    .sds-today-badge {
      font-size: 8px; font-weight: 800; color: #c4b5fd;
      background: rgba(167,139,250,0.15); border-radius: 4px; padding: 1px 5px;
    }

    .sds-schedule-panel-card {
      background: #111118; border: 1px solid #1e1e35;
      border-radius: 18px; padding: clamp(18px,3vw,24px);
      display: flex; flex-direction: column; gap: 18px;
    }
    .sds-schedule-card-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px;
    }
    .sds-schedule-subtitle { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .sds-schedule-export {
      background: #2563eb; color: #fff; border: none;
      padding: 10px 16px; border-radius: 10px;
      cursor: pointer; font-size: 12px; font-weight: 700;
      transition: background 0.18s ease;
    }
    .sds-schedule-export:hover { background: #1d4ed8; }
    .sds-station-table {
      display: grid;
      gap: 0;
      background: #0a0a0f;
      border: 1px solid #1e1e35;
      border-radius: 14px;
      overflow: hidden;
    }
    .sds-station-header-row,
    .sds-station-subheader-row,
    .sds-station-row {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .sds-station-header {
      background: #111118; color: #f8fafc; font-weight: 800;
      padding: 14px 12px; text-align: center; border-bottom: 1px solid #1e1e35;
      grid-column: span 2;
    }
    .sds-station-subheader {
      background: #0d0d1a; color: #94a3b8; font-weight: 700;
      padding: 10px 12px; text-align: center; border-bottom: 1px solid #1e1e35;
    }
    .sds-station-row { border-bottom: 1px solid #1e1e35; }
    .sds-station-cell {
      min-height: 44px; padding: 12px;
      border-right: 1px solid #1e1e35;
      background: #0a0a0f; color: #cbd5e1;
      text-align: center;
    }
    .sds-station-cell:last-child { border-right: none; }
    .sds-blank-fields {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .sds-blank-field {
      min-height: 44px;
      border: 1px dashed #2d2d40;
      border-radius: 12px;
      background: rgba(255,255,255,0.02);
    }

    /* SIDE CARDS */
    .sds-side-card {
      background: #111118; border: 1px solid #1e1e35;
      border-radius: 16px; padding: clamp(14px,2.5vw,20px);
      display: flex; flex-direction: column; gap: 12px;
    }
    .sds-side-card.alert-card { border-color: #2d1f00; }
    .sds-side-card-header { display: flex; align-items: center; gap: 10px; }
    .sds-side-icon {
      width: 28px; height: 28px; border-radius: 7px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sds-signal-bars {
      margin-left: auto; display: flex; gap: 3px; align-items: flex-end;
    }
    .sds-gps-status {
      display: flex; align-items: center; gap: 7px;
      font-size: 11px; color: #64748b;
    }
    .sds-gps-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
      box-shadow: 0 0 5px #4ade80; flex-shrink: 0;
    }
    .sds-gps-row {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 12px; padding: 6px 0;
      border-bottom: 1px solid #1a1a25;
    }
    .sds-gps-row:last-of-type { border-bottom: none; }
    .sds-gps-key { color: #64748b; }
    .sds-gps-val { font-weight: 600; color: #cbd5e1; }
    .sds-gps-val.green { color: #4ade80; }
    .sds-alert-text { font-size: 12px; color: #94a3b8; line-height: 1.6; margin: 0; }
    .sds-checklist { display: flex; flex-direction: column; gap: 6px; }
    .sds-check-row {
      display: flex; align-items: center; gap: 8px;
      font-size: 12px; color: #94a3b8;
    }
    .sds-check-box { flex-shrink: 0; }
    .sds-confirm-btn {
      width: 100%; padding: 10px; border-radius: 9px;
      background: #1c1500; color: #fbbf24;
      border: 1px solid #2d2000; cursor: pointer;
      font-size: 12px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      transition: all 0.15s;
    }
    .sds-confirm-btn:hover { background: #261c00; }
    .sds-stat-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    }
    .sds-stat-item {
      background: #0a0a0f; border: 1px solid #1e1e2e;
      border-radius: 10px; padding: 12px; text-align: center;
    }
    .sds-stat-val { font-size: 20px; font-weight: 800; color: #f1f5f9; line-height: 1; }
    .sds-stat-unit { font-size: 10px; color: #64748b; font-weight: 600; margin-left: 2px; }
    .sds-stat-label { font-size: 10px; color: #475569; margin-top: 4px; }

    /* RESPONSIVE */
    @media (max-width: 900px) {
      .sds-body { grid-template-columns: 1fr; }
      .sds-right { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px,1fr)); }
    }
    @media (max-width: 720px) {
      .sds-week-grid { grid-template-columns: repeat(3,1fr); }
      .sds-metrics-row { grid-template-columns: 1fr 1fr; }
      .sds-right { grid-template-columns: 1fr; }
    }
    @media (max-width: 520px) {
      .sds-week-grid { grid-template-columns: 1fr; }
      .sds-metrics-row { grid-template-columns: 1fr 1fr; }
      .sds-date-block { display: flex !important; align-items: flex-end; }
      .sds-date-day { font-size: 10px; }
      .sds-date-time { font-size: 9px; }
      .sds-topbar { flex-direction: row !important; align-items: center !important; }
    }
  `}</style>
    </div>
  );
}
