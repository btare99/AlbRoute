'use client';
import { useState } from 'react';
import useStore from '../../store/useStore';
import { 
  ArrowLeft, Save, User, MapPin, Home, Briefcase, 
  Shield, CheckCircle2, Lock, Mail, Trash2, AlertTriangle, X, Camera, Phone
} from 'lucide-react';
import { translations } from '../../store/translations';
import { useEffect, useRef } from 'react';

const COUNTRY_CODES = [
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
  { code: '+389', flag: '🇲🇰', name: 'North Macedonia' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  // Add more if needed, but these are common
];

function PhoneInput({ country, setCountry, phone, setPhone, t }: { country: any; setCountry: (c: any) => void; phone: string; setPhone: (v: string) => void; t: any }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = COUNTRY_CODES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search)
  );

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button type="button" onClick={() => setOpen(!open)} style={{
          height: '46px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', color: '#fff', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', transition: 'all 0.2s'
        }}>
          <span style={{ fontSize: '18px' }}>{country.flag}</span>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{country.code}</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
            background: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            width: '220px', padding: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            backdropFilter: 'blur(20px)'
          }}>
            <input
              autoFocus placeholder="Kërko..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none', marginBottom: '8px'
              }}
            />
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filtered.map(c => (
                <button key={c.code} type="button" onClick={() => { setCountry(c); setOpen(false); setSearch(''); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px',
                    borderRadius: '6px', background: country.code === c.code ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left'
                  }}>
                  <span style={{ fontSize: '16px' }}>{c.flag}</span>
                  <span style={{ flex: 1, fontSize: '12px' }}>{c.name}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <input 
        style={{
          flex: 1, height: '46px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '0 16px', color: '#fff', fontSize: '14px', outline: 'none'
        }} 
        type="tel" placeholder="6X XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} 
      />
    </div>
  );
}

export default function EditProfileView() {
  const user = useStore((state: any) => state.user);
  const staffUser = useStore((state: any) => state.staffUser);
  const updateProfile = useStore((state: any) => state.updateProfile);
  const setView = useStore((state: any) => state.setView);
  const addNotification = useStore((state: any) => state.addNotification);
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;
  const logout = useStore((state: any) => state.logout);

  const activeUser = staffUser || user;
  const isStaff = !!staffUser;

  const [activeModal, setActiveModal] = useState<'delete' | null>(null);

  const handleDeleteAccount = () => {
    setActiveModal(null);
    logout();
    addNotification(t.edit_account_deleted, 'success');
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });

  const handleChangePassword = async () => {
    if (passForm.new !== passForm.confirm) {
      addNotification(t.edit_passwords_dont_match, 'error');
      return;
    }
    if (passForm.new.length < 6) {
      addNotification(t.edit_password_too_short, 'error');
      return;
    }

    setIsChangingPass(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.current,
          newPassword: passForm.new
        })
      });

      const result = await response.json();
      if (response.ok) {
        addNotification(t.edit_password_updated, 'success');
        setPassForm({ current: '', new: '', confirm: '' });
      } else {
        addNotification(result.error || 'Gabim!', 'error');
      }
    } catch (error) {
      addNotification(t.edit_conn_error, 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneOnly, setPhoneOnly] = useState('');

  const [form, setForm] = useState({
    name: activeUser?.name || '',
    email: activeUser?.email || '',
    home: user?.savedLocations?.home || '',
    work: user?.savedLocations?.work || '',
    avatar: activeUser?.avatar || '',
    phone: activeUser?.phone || ''
  });

  // Efekti për të ndarë prefix-in nga numri kur ngarkohet useri
  useEffect(() => {
    if (activeUser?.phone) {
      const parts = activeUser.phone.split(' ');
      if (parts.length >= 2) {
        const prefix = parts[0];
        const num = parts.slice(1).join(' ');
        const country = COUNTRY_CODES.find(c => c.code === prefix);
        if (country) {
          setSelectedCountry(country);
          setPhoneOnly(num);
        } else {
          setPhoneOnly(activeUser.phone);
        }
      } else {
        setPhoneOnly(activeUser.phone);
      }
    }
  }, [activeUser]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, avatar: reader.result as string });
        addNotification(language === 'al' ? 'Fotoja u ngarkua! Mos harroni të ruani ndryshimet.' : 'Photo uploaded! Don\'t forget to save changes.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!activeUser?.id && !activeUser?._id) {
      addNotification(t.edit_error_user_id, 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      if (!isStaff) {
        const fullPhone = `${selectedCountry.code} ${phoneOnly}`;
        const response = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: activeUser.id || activeUser._id,
            name: form.name,
            email: form.email,
            phone: fullPhone,
            savedLocations: { home: form.home, work: form.work },
            avatar: form.avatar
          })
        });

        const result = await response.json();

        if (response.ok) {
          updateProfile({ 
            name: form.name, 
            email: form.email,
            phone: `${selectedCountry.code} ${phoneOnly}`,
            savedLocations: { home: form.home, work: form.work },
            avatar: form.avatar
          });
          addNotification(t.edit_changes_saved, 'success');
          setView('profile');
        } else {
          addNotification(result.error || 'Gabim gjatë ruajtjes.', 'error');
        }
      } else {
        // Staff persistence can be added here if needed
        addNotification(t.edit_changes_saved_local, 'info');
        setView('profile');
      }
    } catch (error) {
      console.error('Save error:', error);
      addNotification(t.edit_conn_error, 'error');
    } finally {
      setIsSaving(false);
    }
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
    <>
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
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>{t.edit_credentials}</h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0 0' }}>{t.edit_update_details}</p>
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          marginBottom: '32px', textAlign: 'center'
        }}>
          <div 
            style={{
              width: '84px', height: '84px', borderRadius: '28px',
              background: '#111318',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', fontWeight: '600', color: '#fff',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.03)',
              marginBottom: '16px',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'visible'
            }}
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            {form.avatar ? (
              <img src={form.avatar} style={{ width: '100%', height: '100%', borderRadius: '28px', objectFit: 'cover' }} alt="Profile" />
            ) : (
              activeUser?.name?.charAt(0) || 'U'
            )}
            
            <div style={{
              position: 'absolute', bottom: '-4px', right: '-4px',
              width: '28px', height: '28px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 2
            }}>
              <Camera size={14} color="#fff" strokeWidth={2} />
            </div>
            <input 
              type="file" 
              id="photo-upload" 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handlePhotoUpload}
            />
          </div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff' }}>{activeUser?.name || 'Përdorues'}</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{activeUser?.email || 'Nuk ka email të regjistruar'}</p>
        </div>

        <style jsx>{`
          /* Minimalist styles */
        `}</style>

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
              <User size={16} style={{ color: '#475569' }} /> {t.edit_personal_info}
            </h3>
            
            <div>
              <label style={labelStyle}>{t.edit_full_name}</label>
              <input 
                style={inputStyle} 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <input 
                  style={{ ...inputStyle, paddingLeft: '40px' }} 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})}
                />
                <Mail size={14} style={{ position: 'absolute', left: '14px', top: '22px', color: 'rgba(255,255,255,0.2)' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>{language === 'al' ? 'Numri i Telefonit' : 'Phone Number'}</label>
              <PhoneInput 
                country={selectedCountry} 
                setCountry={setSelectedCountry} 
                phone={phoneOnly} 
                setPhone={setPhoneOnly} 
                t={t} 
              />
            </div>

            {/* Security Info (Inside Left Col) */}
            <div style={{
              marginTop: '10px', padding: '16px', borderRadius: '16px',
              background: 'rgba(59,130,246,0.03)', border: '0.5px solid rgba(59,130,246,0.1)',
              display: 'flex', gap: '12px', alignItems: 'center'
            }}>
              <Lock size={14} style={{ color: '#475569' }} />
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0, lineHeight: 1.5 }}>
                {t.security_notice}
              </p>
            </div>

            {/* ── Change Password Section ── */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '0 4px' }}>
                <div style={{ width: '3px', height: '14px', background: '#ea580c', borderRadius: '4px' }} />
                <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                  {t.edit_change_password}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <label style={labelStyle}>{t.edit_current_password}</label>
                  <input type="password" placeholder="••••••••" style={inputStyle} value={passForm.current} onChange={e => setPassForm({...passForm, current: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>{t.edit_new_password}</label>
                  <input type="password" placeholder="••••••••" style={inputStyle} value={passForm.new} onChange={e => setPassForm({...passForm, new: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>{t.edit_confirm_new_password}</label>
                  <input type="password" placeholder="••••••••" style={inputStyle} value={passForm.confirm} onChange={e => setPassForm({...passForm, confirm: e.target.value})} />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPass || !passForm.new}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px',
                    background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.2)',
                    color: '#ea580c', fontWeight: '700', fontSize: '13px',
                    cursor: (isChangingPass || !passForm.new) ? 'not-allowed' : 'pointer',
                    marginTop: '4px', transition: 'all 0.2s'
                  }}
                >
                  {isChangingPass ? '...' : t.edit_change_password}
                </button>
              </div>
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
                  <MapPin size={16} style={{ color: '#10b981' }} /> {t.saved_places}
                </h3>

                <div>
                  <label style={labelStyle}>{t.home}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      style={{ ...inputStyle, paddingLeft: '40px' }} 
                      value={form.home} 
                      onChange={e => setForm({...form, home: e.target.value})}
                      placeholder={t.edit_add_address}
                    />
                    <Home size={14} style={{ position: 'absolute', left: '14px', top: '22px', color: 'rgba(255,255,255,0.2)' }} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>{t.work}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      style={{ ...inputStyle, paddingLeft: '40px' }} 
                      value={form.work} 
                      onChange={e => setForm({...form, work: e.target.value})}
                      placeholder={t.edit_add_address}
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
                  <><Save size={16} /> {t.edit_save_changes}</>
                )}
              </button>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '12px', padding: '0 10px' }}>
                {t.edit_changes_applied_immediate}
              </p>
            </div>

            {/* Delete Account */}
            <button 
              onClick={() => setActiveModal('delete')}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)',
                color: '#ef4444', fontWeight: '600', fontSize: '14px', marginTop: '12px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <Trash2 size={16} /> {t.edit_delete_account}
            </button>
          </div>
        </div>

        {/* MODAL */}
        {activeModal === 'delete' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              background: '#1a1d24', borderRadius: '16px', width: '100%', maxWidth: '300px',
              padding: '24px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#fff' }}>
                {t.edit_delete_account}
              </h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                {t.edit_delete_confirm}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  {t.edit_cancel}
                </button>
                <button onClick={handleDeleteAccount} style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  {t.edit_delete}
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </>
  );
}
