'use client';
import { useState } from 'react';
import useStore from '../store/useStore';
import { User, Mail, MapPin, Home, Briefcase, Save, LogOut, Shield, History } from 'lucide-react';

export default function ProfileView() {
  const user = useStore((state: any) => state.user);
  const updateProfile = useStore((state: any) => state.updateProfile);
  const logout = useStore((state: any) => state.logout);
  const addNotification = useStore((state: any) => state.addNotification);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', home: user?.savedLocations?.home || '', work: user?.savedLocations?.work || '' });

  const handleSave = () => {
    updateProfile({ name: form.name, savedLocations: { home: form.home, work: form.work } });
    setEditing(false);
    addNotification('Profili u përditësua me sukses! ✓', 'success');
  };

  return (
    <div className="page-content" style={{ maxWidth:'700px' }}>
      <div style={{ marginBottom:'28px' }}>
        <h1 style={{ fontSize:'24px', fontWeight:'800', marginBottom:'4px' }}>Profili Im</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'14px' }}>Menaxho llogarinë dhe preferencat tua</p>
      </div>

      {/* Avatar + Name Card */}
      <div className="card" style={{ marginBottom:'16px', padding:'28px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
          <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg, var(--primary), #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:'800', color:'#fff', flexShrink:0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            {editing ? (
              <input className="input-field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                style={{ fontSize:'20px', fontWeight:'700', marginBottom:'6px' }} />
            ) : (
              <h2 style={{ fontSize:'22px', fontWeight:'800', marginBottom:'4px' }}>{user?.name}</h2>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'var(--text-muted)', fontSize:'13px' }}>
              <Mail size={13}/> {user?.email}
            </div>
          </div>
          <div>
            <span className="badge badge-primary">Shfrytëzues</span>
          </div>
        </div>
      </div>

      {/* Saved Locations */}
      <div className="card" style={{ marginBottom:'16px', padding:'24px' }}>
        <h3 style={{ fontSize:'16px', fontWeight:'700', marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
          <MapPin size={16} style={{ color:'var(--primary)' }}/> Vendet e Ruajtura
        </h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {[{ label:'Shtëpia', icon: Home, key:'home' }, { label:'Puna', icon: Briefcase, key:'work' }].map(({ label, icon: Icon, key }) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'rgba(59,130,246,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon size={18} style={{ color:'var(--primary)' }} />
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'11px', color:'var(--text-muted)', fontWeight:'600', marginBottom:'4px', textTransform:'uppercase' }}>{label}</p>
                {editing ? (
                  <input className="input-field" value={(form as any)[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={`Shto ${label.toLowerCase()}...`} />
                ) : (
                  <p style={{ fontSize:'14px', fontWeight:'500' }}>{(user?.savedLocations as any)?.[key] || <span style={{ color:'var(--text-muted)' }}>Jo i vendosur</span>}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
        {editing ? (
          <>
            <button className="btn btn-primary" onClick={handleSave}><Save size={16}/> Ruaj Ndryshimet</button>
            <button className="btn btn-ghost" onClick={()=>setEditing(false)}>Anulo</button>
          </>
        ) : (
          <button className="btn btn-ghost" onClick={()=>setEditing(true)}><User size={16}/> Ndrysho Profilin</button>
        )}
        <button className="btn btn-danger" onClick={()=>{logout(); addNotification('U çkyçët nga sistemi.','info');}}>
          <LogOut size={16}/> Dil
        </button>
      </div>

      {/* Security info */}
      <div className="card" style={{ marginTop:'16px', padding:'20px', background:'rgba(255,255,255,0.02)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <Shield size={16} style={{ color:'var(--success)' }}/>
          <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>Autentifikimi JWT aktiv · Sesioni i sigurt · Shqipëri &nbsp; 🇦🇱</p>
        </div>
      </div>
    </div>
  );
}
