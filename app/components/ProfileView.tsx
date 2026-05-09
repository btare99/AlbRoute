'use client';
import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { 
  User, Mail, MapPin, Home, Briefcase, Save, LogOut, 
  Shield, History, RefreshCw, Clock, Settings, Bell, 
  Moon, Sun, ChevronRight, Award, Zap, Heart
} from 'lucide-react';

export default function ProfileView() {
  const user = useStore((state: any) => state.user);
  const staffUser = useStore((state: any) => state.staffUser);
  const updateProfile = useStore((state: any) => state.updateProfile);
  const logout = useStore((state: any) => state.logout);
  const addNotification = useStore((state: any) => state.addNotification);
  const loginAsStaff = useStore((state: any) => state.loginAsStaff);
  const setView = useStore((state: any) => state.setView);

  const activeUser = staffUser || user;
  const isStaff = !!staffUser;

  const [isMobile, setIsMobile] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    shareStats: true
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-refresh staff data
  useEffect(() => {
    if (!isStaff || !staffUser) return;
    const refreshStaffData = async () => {
      try {
        const res = await fetch(`/api/admin/staff?role=${staffUser.role === 'driver' ? 'driver' : 'inspector'}&routeId=${staffUser.routeId}`);
        if (res.ok) {
          const allStaff = await res.json();
          const currentStaff = allStaff.find((s: any) => s.id === staffUser.id);
          if (currentStaff) {
            loginAsStaff({ ...staffUser, name: currentStaff.name, weeklyProgram: currentStaff.weeklyProgram });
          }
        }
      } catch (err) { console.error(err); }
    };
    refreshStaffData();
    const interval = setInterval(refreshStaffData, 10000);
    return () => clearInterval(interval);
  }, [isStaff, staffUser?.id, staffUser?.routeId, loginAsStaff]);

  // Auto-refresh staff data

  const renderStatCard = (icon: any, label: string, val: string, color: string, id: string) => {
    const isHovered = hoveredId === id;
    return (
      <div
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          background: isHovered ? `${color}10` : 'rgba(255,255,255,0.02)',
          border: `0.5px solid ${isHovered ? color + '40' : 'rgba(255,255,255,0.07)'}`,
          padding: '16px 12px', borderRadius: '16px', textAlign: 'center',
          transition: 'all 0.15s', cursor: 'pointer',
          transform: isHovered ? 'translateY(-2px)' : 'none'
        }}>
        <div style={{ color, marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>{val}</div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      </div>
    );
  };

  return (
    <div className="page-content">
      
      {/* ── Header ── */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px',
          background: 'rgba(59,130,246,0.1)', border: '0.5px solid rgba(59,130,246,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User size={18} style={{ color: '#3b82f6' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>
            {isStaff ? 'Hapësira e punonjësit' : 'Profili im'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0, marginTop: '2px' }}>
            {isStaff ? 'AlbRoute Staff Access' : 'Menaxho llogarinë dhe statistikat'}
          </p>
        </div>
        <button onClick={() => setView('edit_profile')} style={{
          background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
          padding: '7px 12px', borderRadius: '8px', color: 'rgba(255,255,255,0.6)',
          fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <Settings size={13} /> Ndrysho
        </button>
      </div>

      {/* ── Profile Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: '28px', padding: '32px', marginBottom: '24px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '20px', textAlign: 'center'
      }}>
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', fontWeight: '800', color: '#fff',
          boxShadow: '0 8px 32px rgba(59,130,246,0.4)', flexShrink: 0,
          border: '4px solid rgba(255,255,255,0.05)'
        }}>
          {activeUser?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#fff', margin: '0 0 6px 0' }}>{activeUser?.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
            <Mail size={13} /> {activeUser?.email || activeUser?.username}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <span style={{
              padding: '4px 14px', borderRadius: '99px', background: isStaff ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.06)',
              color: isStaff ? '#3b82f6' : 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
            }}>
              {isStaff ? (staffUser.role === 'driver' ? 'Shofer' : 'Faturino') : 'Përdorues'}
            </span>
            <span style={{
              padding: '4px 14px', borderRadius: '99px', background: 'rgba(16,185,129,0.1)',
              color: '#10b981', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
            }}>
              Verifikuar
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      {!isStaff && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {renderStatCard(<Zap size={18} />, 'Pika', '1,240', '#f59e0b', 'stat-points')}
          {renderStatCard(<Award size={18} />, 'Niveli', 'Elite', '#3b82f6', 'stat-level')}
          {renderStatCard(<Heart size={18} />, 'Saved', '12', '#ef4444', 'stat-saved')}
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Preferences & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Saved Locations */}
          {!isStaff && (
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '24px', padding: '24px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: '#3b82f6' }} /> Vendet e ruajtura
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[{ label: 'Shtëpia', icon: Home, id: 'home' }, { label: 'Puna', icon: Briefcase, id: 'work' }].map(({ label, icon: Icon, id }) => {
                  const isHovered = hoveredId === id;
                  return (
                    <div
                      key={id}
                      onMouseEnter={() => setHoveredId(id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '8px', borderRadius: '12px',
                        background: isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                        transition: 'all 0.15s', cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: isHovered ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s'
                      }}>
                        <Icon size={16} style={{ color: isHovered ? '#3b82f6' : 'rgba(255,255,255,0.3)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '2px' }}>{label}</div>
                        <div style={{ fontSize: '14px', color: '#fff', fontWeight: '500' }}>{(user?.savedLocations as any)?.[id] || 'Jo i vendosur'}</div>
                      </div>
                      <ChevronRight size={14} style={{ color: isHovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)', transition: 'all 0.15s' }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* App Settings */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
            borderRadius: '24px', padding: '24px'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={16} style={{ color: '#8b5cf6' }} /> Preferencat
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Njoftimet Live', icon: <Bell size={14} />, key: 'notifications' },
                { label: 'Dark Mode', icon: <Moon size={14} />, key: 'darkMode' },
                { label: 'Shpërndaj statistikat', icon: <Zap size={14} />, key: 'shareStats' },
              ].map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    {s.icon} {s.label}
                  </div>
                  <div 
                    onClick={() => setSettings(prev => ({ ...prev, [s.key]: !(prev as any)[s.key] }))}
                    style={{
                      width: '36px', height: '18px', borderRadius: '10px',
                      background: (settings as any)[s.key] ? '#10b981' : 'rgba(255,255,255,0.1)',
                      position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                    }}
                  >
                    <div style={{
                      width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: '2px', left: (settings as any)[s.key] ? '20px' : '2px',
                      transition: 'all 0.3s'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Schedule & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Weekly Schedule for Staff */}
          {isStaff && (
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '24px', padding: '24px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: '#3b82f6' }} /> Programi javor
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                {['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'].map(day => (
                  <div key={day} style={{ textAlign: 'center', padding: '10px 4px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', marginBottom: '4px' }}>{day.slice(2)}</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: staffUser.weeklyProgram?.[day] === 'Pushim' ? '#ef4444' : '#10b981' }}>
                      {staffUser.weeklyProgram?.[day]?.includes(':') ? staffUser.weeklyProgram[day].split(' ')[0] : (staffUser.weeklyProgram?.[day] || '-')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security & Support */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)',
            borderRadius: '24px', padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={20} style={{ color: '#10b981' }} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Siguria e Sesionit</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>Enkriptim 256-bit aktiv</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', margin: 0, lineHeight: 1.6 }}>
              Llogaria juaj është e lidhur me pajisjen aktuale. Për çdo problem me kredencialet, kontaktoni mbështetjen teknike të AlbRoute.
            </p>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button onClick={() => setView('edit_profile')} style={{
          flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.7)', border: '0.5px solid rgba(255,255,255,0.1)',
          fontWeight: '700', fontSize: '13px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          <User size={14} /> Ndrysho të dhënat
        </button>
        <button onClick={() => { logout(); addNotification('U çkyçët nga sistemi.', 'info'); }} style={{
          flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)',
          color: '#ef4444', border: '0.5px solid rgba(239,68,68,0.2)', fontWeight: '700', fontSize: '13px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}>
          <LogOut size={14} /> Dil nga llogaria
        </button>
      </div>

      {/* ── Security ── */}
      <div style={{
        marginTop: '24px', padding: '16px', borderRadius: '16px',
        background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <Shield size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
          Sesion i siguruar me enkriptim fund-në-fund · AlbRoute 2026
        </p>
      </div>
    </div>
  );
}
