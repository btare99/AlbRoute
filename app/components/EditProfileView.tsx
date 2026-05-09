'use client';
import { useState } from 'react';
import useStore from '../store/useStore';
import { 
  ArrowLeft, Save, User, MapPin, Home, Briefcase, 
  Shield, CheckCircle2, Lock, Mail, Trash2, AlertTriangle, X
} from 'lucide-react';
import { translations } from '../store/translations';

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
    addNotification(language === 'al' ? 'Llogaria juaj u fshi me sukses.' : 'Account deleted successfully.', 'success');
  };

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
    addNotification(language === 'al' ? 'Ndryshimet u ruajtën me sukses! ✓' : language === 'en' ? 'Changes saved successfully! ✓' : 'Modifiche salvate con successo! ✓', 'success');
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
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>{language === 'al' ? 'Ndrysho kredencialet' : language === 'en' ? 'Edit Credentials' : 'Modifica Credenziali'}</h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: '2px 0 0 0' }}>{language === 'al' ? 'Përditëso të dhënat e llogarisë tuaj' : language === 'en' ? 'Update your account details' : 'Aggiorna i dettagli del tuo account'}</p>
        </div>
      </div>

      {/* ── Profile Summary (Centered) ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        marginBottom: '32px', textAlign: 'center'
      }}>
        <div style={{
          width: '84px', height: '84px', borderRadius: '28px',
          background: '#111318',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', fontWeight: '600', color: '#fff',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.03)',
          marginBottom: '16px'
        }}>
          {activeUser?.name?.charAt(0) || 'U'}
        </div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#fff' }}>{activeUser?.name || 'Përdorues'}</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{activeUser?.email || 'Nuk ka email të regjistruar'}</p>
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
            <User size={16} style={{ color: '#475569' }} /> {language === 'al' ? 'Informacioni Personal' : language === 'en' ? 'Personal Information' : 'Informazioni Personali'}
          </h3>
          
          <div>
            <label style={labelStyle}>{language === 'al' ? 'Emri i plotë' : language === 'en' ? 'Full Name' : 'Nome Completo'}</label>
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
                    placeholder={language === 'al' ? 'Shto adresën...' : language === 'en' ? 'Add address...' : 'Aggiungi indirizzo...'}
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
                    placeholder={language === 'al' ? 'Shto adresën...' : language === 'en' ? 'Add address...' : 'Aggiungi indirizzo...'}
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
                <><Save size={16} /> {language === 'al' ? 'Ruaj Ndryshimet' : language === 'en' ? 'Save Changes' : 'Salva Modifiche'}</>
              )}
            </button>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '12px', padding: '0 10px' }}>
              {language === 'al' ? 'Ndryshimet do të aplikohen menjëherë në të gjithë sistemin Urbani Im.' : language === 'en' ? 'Changes will be applied immediately across Urbani Im.' : 'Le modifiche verranno applicate immediatamente in tutto il sistema Urbani Im.'}
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
            <Trash2 size={16} /> {language === 'al' ? 'Fshi Llogarinë' : language === 'en' ? 'Delete Account' : 'Elimina Account'}
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
              {language === 'al' ? 'Fshi Llogarinë' : language === 'en' ? 'Delete Account' : 'Elimina Account'}
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
              {language === 'al' ? 'A jeni të sigurt që dëshironi të fshini llogarinë tuaj? Ky veprim nuk mund të kthehet.' : 'Are you sure you want to delete your account? This action cannot be undone.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setActiveModal(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                {language === 'al' ? 'Anulo' : 'Cancel'}
              </button>
              <button onClick={handleDeleteAccount} style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                {language === 'al' ? 'Fshi' : 'Delete'}
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
  );
}
