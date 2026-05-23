'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from "next-auth/react";
import { IonIcon } from '@ionic/react';
import { busOutline, eyeOutline, eyeOffOutline, arrowForwardOutline, locationOutline } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import useStore from '../../store/useStore';
import { translations } from '../../store/translations';
import { AsYouType } from 'libphonenumber-js';
const COUNTRY_CODES = [
  { code: '+93', flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+376', flag: '🇦🇩', name: 'Andorra' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+501', flag: '🇧🇿', name: 'Belize' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia and Herzegovina' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+53', flag: '🇨🇺', name: 'Cuba' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+420', flag: '🇨🇿', name: 'Czechia' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+500', flag: '🇫🇰', name: 'Falkland Islands' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+350', flag: '🇬🇮', name: 'Gibraltar' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+509', flag: '🇭🇹', name: 'Haiti' },
  { code: '+504', flag: '🇭🇳', name: 'Honduras' },
  { code: '+36', flag: '🇭🇺', name: 'Hungary' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { code: '+98', flag: '🇮🇷', name: 'Iran' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+423', flag: '🇱🇮', name: 'Liechtenstein' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+960', flag: '🇲🇻', name: 'Maldives' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+373', flag: '🇲🇩', name: 'Moldova' },
  { code: '+377', flag: '🇲🇨', name: 'Monaco' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+95', flag: '🇲🇲', name: 'Myanmar' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+389', flag: '🇲🇰', name: 'North Macedonia' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+507', flag: '🇵🇦', name: 'Panama' },
  { code: '+51', flag: '🇵🇪', name: 'Peru' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+40', flag: '🇷🇴', name: 'Romania' },
  { code: '+7', flag: '🇷🇺', name: 'Russia/Kazakhstan' },
  { code: '+378', flag: '🇸🇲', name: 'San Marino' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
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
    <div style={{ display: 'flex', gap: '8px' }}>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button type="button" onClick={() => setOpen(!open)} style={{
          height: '46px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
          borderRadius: '10px', color: '#fff', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', transition: 'var(--transition)'
        }}>
          <span style={{ fontSize: '18px' }}>{country.flag}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{country.code}</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
            background: '#121212', border: '1px solid #222', borderRadius: '12px',
            width: '220px', padding: '8px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <input
                autoFocus placeholder={t.auth_search_country}
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
                  padding: '8px 10px', color: '#fff', fontSize: '12px', outline: 'none'
                }}
              />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filtered.map(c => (
                <button key={c.code} type="button" onClick={() => { setCountry(c); setOpen(false); setSearch(''); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px',
                    borderRadius: '6px', background: country.code === c.code ? '#1a1a1a' : 'transparent',
                    border: 'none', color: '#fff', cursor: 'pointer', textAlign: 'left'
                  }}>
                  <span style={{ fontSize: '16px' }}>{c.flag}</span>
                  <span style={{ flex: 1, fontSize: '12px' }}>{c.name}</span>
                  <span style={{ fontSize: '11px', color: '#555' }}>{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <input 
        className="input-field" 
        type="tel" 
        placeholder="6X XXX XXXX" 
        value={phone} 
        onChange={e => {
          let val = e.target.value;
          let digits = val.replace(/\D/g, '');
          if (!digits) {
            setPhone('');
            return;
          }
          
          const formatter = new AsYouType();
          const fullFormatted = formatter.input(country.code + digits) || '';
          
          const codeFormatter = new AsYouType();
          const formattedCode = codeFormatter.input(country.code) || country.code;
          
          let localFormatted = fullFormatted;
          if (localFormatted.startsWith(formattedCode + ' ')) {
            localFormatted = localFormatted.substring(formattedCode.length + 1);
          } else if (localFormatted.startsWith(formattedCode)) {
            localFormatted = localFormatted.substring(formattedCode.length).trim();
          } else if (localFormatted.startsWith(country.code + ' ')) {
            localFormatted = localFormatted.substring(country.code.length + 1);
          } else if (localFormatted.startsWith(country.code)) {
            localFormatted = localFormatted.substring(country.code.length).trim();
          }
          
          setPhone(localFormatted || digits);
        }} 
        style={{ flex: 1 }} 
        required 
      />
    </div>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify' | 'new_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[1]); // Default Albania
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useStore((state: any) => state.login);
  const setGuestMode = useStore((state: any) => state.setGuestMode);
  const addNotification = useStore((state: any) => state.addNotification);
  const language = useStore((state: any) => state.language);
  const setLanguage = useStore((state: any) => state.setLanguage);
  const t = translations[language] || translations.al;

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'Configuration') {
        setError('Gabim në konfigurimin e Google. Kontrolloni Client ID dhe Secret.');
      } else if (errorParam === 'AccessDenied') {
        setError('Aksesi u refuzua nga Google.');
      } else {
        setError(`Gabim gjatë autentikimit: ${errorParam}`);
      }
    }
  }, [searchParams]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(t.auth_code_sent);
        setMode('verify');
      } else {
        setError(data.error || t.auth_code_failed);
      }
    } catch (err) {
      setError(t.auth_server_error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(t.auth_code_verified);
        setMode('new_password');
      } else {
        setError(data.error || t.auth_invalid_code);
      }
    } catch (err) {
      setError(t.auth_server_error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(t.auth_password_changed, 'success');
        setMode('login');
        setSuccess('');
        setEmail('');
        setCode('');
        setNewPassword('');
      } else {
        setError(data.error || t.auth_change_failed);
      }
    } catch (err) {
      setError(t.auth_server_error);
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await signIn('credentials', {
          email: email.toLowerCase(),
          password,
          redirect: false,
        });

        if (result?.error) {
          setError(t.auth_invalid_credentials);
        } else {
          addNotification(t.auth_welcome, 'success');
          window.location.reload();
        }
      } else {
        const fullPhone = `${selectedCountry.code} ${phone}`;
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone: fullPhone }),
        });
        const data = await res.json();

        if (res.ok) {
          // Auto login after registration
          const result = await signIn('credentials', {
            email: email.toLowerCase(),
            password,
            redirect: false,
          });
          
          if (!result?.error) {
            addNotification(t.auth_account_created, 'success');
            window.location.reload();
          } else {
            setError(t.auth_auto_login_error);
          }
        } else {
          setError(data.error || t.auth_register_failed);
        }
      }
    } catch (err) {
      setError(t.auth_server_error);
    } finally {
      setLoading(false);
    }
  }

  const handleSocialLogin = async (provider: string) => {
    try {
      setLoading(true);
      if (provider.toLowerCase() === 'google') {
        await Preferences.set({ key: 'google_login_pending', value: '1' });
      }
      await signIn(provider.toLowerCase());
    } catch (err) {
      addNotification('Social login failed.', 'danger');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-dark)', position: 'relative' }}>

      {/* Brand Identity - Top Left */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1.5px solid var(--border)', flexShrink: 0 }}>
          <img src="/logo.png" alt="Urban Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '900', lineHeight: '1.1', background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Syne', sans-serif" }}>Urbani Im</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.01em', marginTop: '1px' }}>{t.auth_subtitle}</p>
        </div>
      </div>

      {/* Language Switcher - Top Right */}
      <div style={{ position: 'absolute', top: '32px', right: '32px', display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.02)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border)' }}>
        {['al', 'en', 'it'].map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            style={{
              padding: '4px 10px', borderRadius: '7px', fontSize: '10px', fontWeight: '800',
              textTransform: 'uppercase', cursor: 'pointer', transition: 'var(--transition)',
              background: language === lang ? '#2a2a2a' : 'transparent',
              color: language === lang ? '#fff' : 'var(--text-dim)',
              border: 'none'
            }}
          >
            {lang}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10, padding: '0 24px' }}>
        <div style={{ padding: '32px 0' }}>
          {/* Tabs - Triangle Indicator Design */}
          {(mode === 'login' || mode === 'register') && (
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '32px', position: 'relative' }}>
              {(['login', 'register'] as const).map((m, idx) => (
                <button key={m} type="button" onClick={() => { setMode(m); setError(''); }}
                  style={{
                    flex: 1, padding: '16px 0', fontSize: '13px', fontWeight: '700',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', background: 'none', border: 'none', cursor: 'pointer',
                    color: mode === m ? '#fff' : 'rgba(255,255,255,0.2)',
                    textShadow: mode === m ? '0 0 15px rgba(255,255,255,0.3)' : 'none',
                    position: 'relative', letterSpacing: '0.06em', textTransform: 'uppercase', zIndex: 2
                  }}>
                  {m === 'login' ? t.auth_login : t.auth_register}
                </button>
              ))}

              {/* Central Divider with Rotating Triangle */}
              <div style={{
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)', zIndex: 3
              }}>
                <div style={{
                  position: 'absolute', top: '50%',
                  left: mode === 'login' ? '0px' : '1px',
                  width: 0, height: 0,
                  borderTop: '5px solid transparent',
                  borderBottom: '5px solid transparent',
                  borderRight: mode === 'login' ? '6px solid #fff' : 'none',
                  borderLeft: mode === 'register' ? '6px solid #fff' : 'none',
                  transform: `translate(${mode === 'login' ? '-100%' : '0%'}, -50%)`,
                  transition: 'all 0.4s cubic-bezier(0.65, 0, 0.35, 1)',
                  filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))'
                }}></div>
              </div>
            </div>
          )}

          {/* Forms Section */}
          <style>{`
            @keyframes formEnter {
              from { opacity: 0; transform: translateY(10px); filter: blur(10px); }
              to { opacity: 1; transform: translateY(0); filter: blur(0); }
            }
          `}</style>

          {(mode === 'login' || mode === 'register') && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'formEnter 0.4s ease-out' }}>
              {mode === 'register' && (
                <div>
                  <label className="label">{t.auth_fullname}</label>
                  <input className="input-field" type="text" placeholder="Andi Krasniqi" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              )}
              <div>
                <label className="label">{t.auth_email}</label>
                <input className="input-field" type="email" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {mode === 'register' && (
                <div>
                  <label className="label">{t.auth_phone}</label>
                  <PhoneInput country={selectedCountry} setCountry={setSelectedCountry} phone={phone} setPhone={setPhone} t={t} />
                </div>
              )}
              <div>
                <label className="label">{t.auth_password}</label>
                <div style={{ position: 'relative' }}>
                  <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <IonIcon icon={eyeOffOutline} style={{ fontSize: 16 }} /> : <IonIcon icon={eyeOutline} style={{ fontSize: 16 }} />}
                  </button>
                </div>
                {mode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
                      {t.auth_forgot}
                    </button>
                  </div>
                )}
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--danger)' }}>{error}</div>}
              <button type="submit" className="btn" style={{ width: '100%', padding: '13px', background: '#3b82f6', color: '#fff', boxShadow: '0 4px 14px rgba(59,130,246,0.4)', border: 'none', borderRadius: '8px', fontWeight: 'bold' }} disabled={loading}>
                {loading ? '...' : (mode === 'login' ? t.auth_login : t.auth_register)} <IonIcon icon={arrowForwardOutline} style={{ fontSize: 16 }} />
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'formEnter 0.4s ease-out' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>{t.auth_step1_title}</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{t.auth_step1_desc}</p>
              <div>
                <label className="label">{t.auth_email}</label>
                <input className="input-field" type="email" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px' }} disabled={loading}>
                {loading ? t.auth_sending : t.auth_continue}
              </button>
              <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer' }}>{t.auth_cancel}</button>
            </form>
          )}

          {mode === 'verify' && (
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'formEnter 0.4s ease-out' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>{t.auth_step2_title}</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{t.auth_step2_desc}</p>
              {success && <div style={{ color: '#10b981', fontSize: '13px', textAlign: 'center' }}>{success}</div>}
              <div>
                <label className="label">{t.auth_code}</label>
                <input className="input-field" type="text" maxLength={6} placeholder="123456" value={code} onChange={e => setCode(e.target.value)} required style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }} />
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px' }} disabled={loading}>
                {loading ? t.auth_verifying : t.auth_verify}
              </button>
            </form>
          )}

          {mode === 'new_password' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'formEnter 0.4s ease-out' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>{t.auth_step3_title}</h3>
              <div>
                <label className="label">{t.auth_new_password}</label>
                <input className="input-field" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px' }} disabled={loading}>
                {loading ? t.auth_saving : t.auth_change_password}
              </button>
            </form>
          )}



          {/* Social Logins */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <div style={{ margin: '20px 0 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>{t.auth_or_continue}</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => handleSocialLogin('Google')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', color: '#fff', transition: 'var(--transition)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                <button type="button" onClick={() => handleSocialLogin('Apple')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', color: '#fff', transition: 'var(--transition)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.88 3.5-.84 1.58.07 2.79.75 3.67 1.99-3.18 1.9-2.58 5.98.54 7.21-.71 1.83-1.6 3.65-2.79 4.83zm-3.69-14.86c-.53-2.05 1.25-4.14 3.19-4.42.74 2.3-1.69 4.38-3.19 4.42z"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-dim)', opacity: 0.6 }}>
          <IonIcon icon={locationOutline} style={{ fontSize: 12, display: 'inline', marginRight: '4px' }} />
          Tirana, Shqipëri &nbsp;·&nbsp; 
          <span 
            onClick={() => setGuestMode(true)} 
            style={{ cursor: 'default' }}
          >
            v1.0.6
          </span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }} />}>
      <LoginContent />
    </Suspense>
  );
}
