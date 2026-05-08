'use client';
import { useState } from 'react';
import useStore from '../store/useStore';
import { User, Mail, MapPin, Home, Briefcase, Save, LogOut, Shield, History, RefreshCw, Clock } from 'lucide-react';
import { useEffect } from 'react';

export default function ProfileView() {
  const user = useStore((state: any) => state.user);
  const staffUser = useStore((state: any) => state.staffUser);
  const updateProfile = useStore((state: any) => state.updateProfile);
  const logout = useStore((state: any) => state.logout);
  const addNotification = useStore((state: any) => state.addNotification);

  // Use either user or staffUser
  const activeUser = staffUser || user;
  const isStaff = !!staffUser;

  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: activeUser?.name || '',
    home: user?.savedLocations?.home || '',
    work: user?.savedLocations?.work || ''
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loginAsStaff = useStore((state: any) => state.loginAsStaff);

  // Auto-refresh staff data for real-time schedule updates
  useEffect(() => {
    if (!isStaff || !staffUser) return;

    const refreshStaffData = async () => {
      try {
        const res = await fetch(`/api/admin/staff?role=${staffUser.role === 'driver' ? 'driver' : 'inspector'}&routeId=${staffUser.routeId}`);
        if (res.ok) {
          const allStaff = await res.json();
          const currentStaff = allStaff.find((s: any) => s.id === staffUser.id);
          if (currentStaff) {
            loginAsStaff({
              ...staffUser,
              name: currentStaff.name,
              weeklyProgram: currentStaff.weeklyProgram
            });
          }
        }
      } catch (err) {
        console.error('Failed to refresh staff data', err);
      }
    };

    refreshStaffData();
    const interval = setInterval(refreshStaffData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [isStaff, staffUser?.id, staffUser?.routeId, loginAsStaff]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800)); // Simulated delay
    if (!isStaff) {
      updateProfile({ name: form.name, savedLocations: { home: form.home, work: form.work } });
    }
    setEditing(false);
    setIsSaving(false);
    addNotification('Profili u përditësua me sukses! ✓', 'success');
  };

  const renderWeeklySchedule = () => {
    if (!staffUser?.weeklyProgram) return null;
    const days = ['E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë', 'E Diel'];

    return (
      <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
            <Briefcase size={20} style={{ color: 'var(--primary)' }} /> Programi Javor i Punës
          </h3>
          <button
            onClick={() => window.location.reload()}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' }}
          >
            <RefreshCw size={14} /> Rifresko
          </button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(80px, 1fr))',
          gap: '12px'
        }}>
          {days.map(day => (
            <div key={day} style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '12px 8px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>{day}</div>
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: staffUser.weeklyProgram[day] === 'Pushim' ? '#ef4444' : '#10b981'
              }}>
                {staffUser.weeklyProgram[day] || '-'}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', fontStyle: 'italic' }}>
          * Ky program është caktuar nga operatori i linjës tuaj ({staffUser.routeId}).
        </p>
      </div>
    );
  };

  return (
    <div className="page-content" style={{ maxWidth: '700px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{isStaff ? 'Hapësira e Punonjësit' : 'Profili Im'}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{isStaff ? 'Mirë se erdhe në AlbRoute Staff' : 'Menaxho llogarinë dhe preferencat tua'}</p>
      </div>

      {/* Avatar + Name Card */}
      <div className="card" style={{ marginBottom: '16px', padding: isMobile ? '20px' : '28px' }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'center',
          textAlign: isMobile ? 'center' : 'left',
          gap: isMobile ? '16px' : '20px'
        }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
            {activeUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            {editing && !isStaff ? (
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px', textAlign: isMobile ? 'center' : 'left' }} />
            ) : (
              <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>{activeUser?.name}</h2>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Mail size={13} /> {activeUser?.email || activeUser?.username}
            </div>
          </div>
          <div style={{ marginTop: isMobile ? '4px' : '0' }}>
            <span className={`badge ${isStaff ? 'badge-primary' : 'badge-ghost'}`} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
              {isStaff ? (staffUser.role === 'driver' ? 'Shofer' : (staffUser.role === 'inspector' ? 'Faturino' : staffUser.role)) : 'Shfrytëzues'}
            </span>
          </div>
        </div>
      </div>

      {isStaff && (
        <div className="card" style={{ marginBottom: '16px', padding: '20px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Linja e Atribuar</p>
              <p style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>LINJA {staffUser.routeId}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '800' }}>Statusi</p>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#10b981' }}>● Aktiv</p>
            </div>
          </div>
        </div>
      )}

      {isStaff && renderWeeklySchedule()}

      {/* Saved Locations - Only for normal users */}
      {!isStaff && (
        <div className="card" style={{ marginBottom: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} style={{ color: 'var(--primary)' }} /> Vendet e Ruajtura
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[{ label: 'Shtëpia', icon: Home, id: 'home' }, { label: 'Puna', icon: Briefcase, id: 'work' }].map(({ label, icon: Icon, id }) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>{label}</p>
                  {editing ? (
                    <input className="input-field" value={(form as any)[id]} onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))} placeholder={`Shto ${label.toLowerCase()}...`} />
                  ) : (
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{(user?.savedLocations as any)?.[id] || <span style={{ color: 'var(--text-muted)' }}>Jo i vendosur</span>}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginTop: '24px' }}>
        {!isStaff && (
          editing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave} disabled={isSaving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
                {isSaving ? <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} /> : <Save size={16} />}
                {isSaving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
              </button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)} style={{ width: isMobile ? '100%' : 'auto' }}>Anulo</button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={() => setEditing(true)} style={{ width: isMobile ? '100%' : 'auto' }}><User size={16} /> Ndrysho Profilin</button>
          )
        )}
        <button className="btn btn-danger" onClick={() => { logout(); addNotification('U çkyçët nga sistemi.', 'info'); }} style={{ width: isMobile ? '100%' : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <LogOut size={16} /> Dil nga Llogaria
        </button>
      </div>

      {/* Security info */}
      <div className="card" style={{ marginTop: '24px', padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={16} style={{ color: 'var(--success)' }} />
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sesioni i sigurt · {isStaff ? 'AlbRoute Staff Access' : 'Personal User Access'} · Shqipëri 🇦🇱</p>
        </div>
      </div>
    </div>
  );
}
