'use client';

import { useState } from 'react';
import useStore from '../store/useStore';
import { User, Shield, LogOut, ChevronRight, Star, Clock, Bell, MapPin, Share2, Award, Zap, Edit2, CheckCircle2 } from 'lucide-react';
import { translations } from '../store/translations';

export default function ProfileView() {
  const user = useStore((state: any) => state.user);
  const staffUser = useStore((state: any) => state.staffUser);
  const updateProfile = useStore((state: any) => state.updateProfile);
  const logout = useStore((state: any) => state.logout);
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;
  const addNotification = useStore((state: any) => state.addNotification);
  const loginAsStaff = useStore((state: any) => state.loginAsStaff);
  const setView = useStore((state: any) => state.setView);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);

  const handleSave = () => {
    updateProfile({ name: editedName });
    setIsEditing(false);
    addNotification(t.save_changes, 'success');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{
        padding: '24px 20px 10px 20px',
        display: 'flex', alignItems: 'center', gap: '15px',
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(109, 40, 217, 0.3)'
        }}>
          <User size={18} style={{ color: '#fff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>{user.role === 'staff' ? t.staff_space : t.my_profile}</h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0, marginTop: '2px' }}>
            {t.manage_account}
          </p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }} className="route-scrollbar">
        
        {/* User Card */}
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '20px',
          display: 'flex', alignItems: 'center', gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '700', color: '#fff',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            {user.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 8px', borderRadius: '6px', width: '120px' }}
                />
                <button onClick={handleSave} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>Ruaj</button>
              </div>
            ) : (
              <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>{user.name}</h2>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
              <div style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>
                {user.role === 'staff' ? t.staff : t.user}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '10px', fontWeight: '700' }}>
                <CheckCircle2 size={10} /> {t.verified}
              </div>
            </div>
          </div>
          <button style={{ 
            width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
          }} title={t.edit}>
            <Edit2 size={14} />
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
          {[
            { icon: <Award size={14} />, label: t.points, val: '1,250' },
            { icon: <Zap size={14} />, label: t.level, val: '8' },
            { icon: <Star size={14} />, label: t.saved_count, val: '12' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '12px 8px', textAlign: 'center'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '5px', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>{stat.val}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Saved Places */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', 
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: '10px'
          }}>
            {t.saved_places}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: <MapPin size={14} />, label: t.home, val: 'Rruga e Durrësit, 102', color: '#ef4444' },
              { icon: <MapPin size={14} />, label: t.work, val: t.not_set, color: '#3b82f6' },
            ].map((place, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                cursor: 'pointer'
              }}>
                <div style={{ color: place.color }}>{place.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{place.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>{place.val}</div>
                </div>
                <ChevronRight size={14} style={{ color: 'rgba(255,255,255,0.1)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Settings / Preferences */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', 
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
            marginBottom: '10px'
          }}>
            {t.preferences}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: <Bell size={14} />, label: t.live_notifications, enabled: true },
              { icon: <Share2 size={14} />, label: t.share_stats, enabled: false },
            ].map((pref, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)',
                borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{ color: 'rgba(255,255,255,0.3)' }}>{pref.icon}</div>
                <div style={{ flex: 1, fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{pref.label}</div>
                <div style={{
                  width: '30px', height: '16px', borderRadius: '10px',
                  background: pref.enabled ? '#10b981' : 'rgba(255,255,255,0.1)',
                  position: 'relative', cursor: 'pointer'
                }}>
                  <div style={{
                    width: '12px', height: '12px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px', left: pref.enabled ? '16px' : '2px',
                    transition: 'all 0.2s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Section */}
        {user.role === 'staff' && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              fontSize: '10px', fontWeight: '600', letterSpacing: '0.08em', 
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
              marginBottom: '10px'
            }}>
              {t.weekly_program}
            </div>
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px'
            }}>
              {[
                { d: t.days.monday.substring(0, 1), active: true },
                { d: t.days.tuesday.substring(0, 1), active: true },
                { d: t.days.wednesday.substring(0, 1), active: true },
                { d: t.days.thursday.substring(0, 1), active: true },
                { d: t.days.friday.substring(0, 1), active: true },
                { d: t.days.saturday.substring(0, 1), active: false },
                { d: t.days.sunday.substring(0, 1), active: false },
              ].map((day, i) => (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: '8px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: '700',
                  background: day.active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.02)',
                  color: day.active ? '#3b82f6' : 'rgba(255,255,255,0.15)',
                  border: day.active ? '0.5px solid rgba(59,130,246,0.3)' : '0.5px solid transparent'
                }}>
                  {day.d}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)',
            border: '0.5px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Shield size={16} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{t.session_security}</span>
              <div style={{ marginLeft: 'auto', fontSize: '10px', color: '#10b981', fontWeight: '700' }}>
                {t.encryption_active.toUpperCase()}
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: '1.6', margin: 0 }}>
              {t.security_notice}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={logout}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            background: 'rgba(239, 68, 68, 0.08)', border: '0.5px solid rgba(239, 68, 68, 0.15)',
            color: '#ef4444', fontSize: '13px', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = '#ef4444'; }}
        >
          <LogOut size={16} /> {t.logout}
        </button>

        <div style={{ textAlign: 'center', marginTop: '10px', paddingBottom: '20px' }}>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', margin: 0 }}>
            {t.secure_session}
          </p>
        </div>

      </div>
    </div>
  );
}
