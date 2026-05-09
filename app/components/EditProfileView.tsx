'use client';
import { useState } from 'react';
import useStore from '../store/useStore';
import { 
  ArrowLeft, Save, User, MapPin, Home, Briefcase, 
  Shield, CheckCircle2, Lock, Mail
} from 'lucide-react';

export default function EditProfileView() {
  const user = useStore((state: any) => state.user);
  const staffUser = useStore((state: any) => state.staffUser);
  const updateProfile = useStore((state: any) => state.updateProfile);
  const setView = useStore((state: any) => state.setView);
  const addNotification = useStore((state: any) => state.addNotification);

  const activeUser = staffUser || user;
  const isStaff = !!staffUser;

  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: activeUser?.name || '',
    email: activeUser?.email || '',
    home: user?.savedLocations?.home || '',
    work: user?.savedLocations?.work || ''
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    
    if (!isStaff) {
      updateProfile({ 
        name: form.name, 
        email: form.email,
        savedLocations: { home: form.home, work: form.work } 
      });
    }
    
    setIsSaving(false);
    addNotification('Ndryshimet u ruajtën me sukses! ✓', 'success');
    setView('profile');
  };

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    marginTop: '6px'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginLeft: '4px'
  };

  return (
    <div className="page-content">
      
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => setView('profile')}
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>Ndrysho kredencialet</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0 0' }}>Përditëso të dhënat e llogarisë tuaj</p>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Personal Info */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
          padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: '#3b82f6' }} /> Informacioni Personal
          </h3>
          
          <div>
            <label style={labelStyle}>Emri i plotë</label>
            <input 
              style={inputStyle} 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})}
            />
          </div>

          <div>
            <label style={labelStyle}>Email adresa</label>
            <div style={{ position: 'relative' }}>
              <input 
                style={{ ...inputStyle, paddingLeft: '40px' }} 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})}
              />
              <Mail size={14} style={{ position: 'absolute', left: '14px', top: '22px', color: 'rgba(255,255,255,0.2)' }} />
            </div>
          </div>

          {/* Security Info (Inside Left Col) */}
          <div style={{
            marginTop: '10px', padding: '16px', borderRadius: '16px',
            background: 'rgba(59,130,246,0.03)', border: '0.5px solid rgba(59,130,246,0.1)',
            display: 'flex', gap: '12px', alignItems: 'center'
          }}>
            <Lock size={14} style={{ color: '#3b82f6' }} />
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.5 }}>
              Të dhënat tuaja ruhen në mënyrë të enkriptuar.
            </p>
          </div>
        </div>

        {/* Right Column: Locations & Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!isStaff && (
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
              padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: '#10b981' }} /> Vendndodhjet e Ruajtura
              </h3>

              <div>
                <label style={labelStyle}>Shtëpia</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    style={{ ...inputStyle, paddingLeft: '40px' }} 
                    value={form.home} 
                    onChange={e => setForm({...form, home: e.target.value})}
                    placeholder="Shto adresën..."
                  />
                  <Home size={14} style={{ position: 'absolute', left: '14px', top: '22px', color: 'rgba(255,255,255,0.2)' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Puna</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    style={{ ...inputStyle, paddingLeft: '40px' }} 
                    value={form.work} 
                    onChange={e => setForm({...form, work: e.target.value})}
                    placeholder="Shto adresën..."
                  />
                  <Briefcase size={14} style={{ position: 'absolute', left: '14px', top: '22px', color: 'rgba(255,255,255,0.2)' }} />
                </div>
              </div>
            </div>
          )}

          {/* Save Button Container */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)',
            padding: '20px', borderRadius: '24px', marginTop: isStaff ? '0' : 'auto'
          }}>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: isSaving ? 'rgba(255,255,255,0.05)' : '#fff',
                color: isSaving ? 'rgba(255,255,255,0.2)' : '#000',
                border: 'none', fontWeight: '700', fontSize: '14px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s',
                boxShadow: isSaving ? 'none' : '0 8px 24px rgba(255,255,255,0.15)'
              }}
            >
              {isSaving ? (
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : (
                <><Save size={16} /> Ruaj Ndryshimet</>
              )}
            </button>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '12px', padding: '0 10px' }}>
              Ndryshimet do të aplikohen menjëherë në të gjithë sistemin AlbRoute.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
