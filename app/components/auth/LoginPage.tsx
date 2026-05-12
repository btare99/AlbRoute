'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Eye, EyeOff, ArrowRight, MapPin } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../store/translations';

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

function PhoneInput({ country, setCountry, phone, setPhone }: { country: any; setCountry: (c: any) => void; phone: string; setPhone: (v: string) => void }) {
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
                autoFocus placeholder="Kërko shtetin..."
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

      <input className="input-field" type="tel" placeholder="6X XXX XXXX" value={phone} onChange={e => setPhone(e.target.value)} style={{ flex: 1 }} required />
    </div>
  );
}

export default function LoginPage() {
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
  const addNotification = useStore((state: any) => state.addNotification);
  const language = useStore((state: any) => state.language);
  const setLanguage = useStore((state: any) => state.setLanguage);

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
        setSuccess(language === 'al' ? 'Kodi u dërgua në email!' : 'Code sent to email!');
        setMode('verify');
      } else {
        setError(data.error || 'Dështoi dërgimi i kodit.');
      }
    } catch (err) {
      setError('Gabim në server.');
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
        setSuccess(language === 'al' ? 'Kodi u verifikua! Vendosni fjalëkalimin e ri.' : 'Code verified! Enter new password.');
        setMode('new_password');
      } else {
        setError(data.error || 'Kodi i pasaktë.');
      }
    } catch (err) {
      setError('Gabim në server.');
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
        addNotification(language === 'al' ? 'Fjalëkalimi u ndryshua! Tani mund të hyni.' : 'Password reset successfully!', 'success');
        setMode('login');
        setSuccess('');
        setEmail('');
        setCode('');
        setNewPassword('');
      } else {
        setError(data.error || 'Dështoi ndryshimi.');
      }
    } catch (err) {
      setError('Gabim në server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          login(data.user, 'jwt-token-mock');
          addNotification(language === 'al' ? `Mirë se erdhe, ${data.user.name}! 🚌` : `Welcome, ${data.user.name}! 🚌`, 'success');
        } else {
          setError(data.error || 'Dështoi hyrja.');
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
          login(data.user, 'jwt-token-mock');
          addNotification(language === 'al' ? 'Llogaria u krijua me sukses! 🎉' : 'Account created successfully! 🎉', 'success');
        } else {
          setError(data.error || 'Dështoi regjistrimi.');
        }
      }
    } catch (err) {
      setError(language === 'al' ? 'Ndodhi një gabim në server.' : 'Server error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const socialUser = {
      id: `social-${Date.now()}`,
      name: `Përdorues via ${provider}`,
      email: `${provider.toLowerCase()}@user.com`,
      savedLocations: { home: '', work: '' },
      travelHistory: []
    };

    login(socialUser, 'social-token-mock');
    addNotification(
      language === 'al' ? `Hytë me sukses përmes ${provider}! 🚀` :
        language === 'en' ? `Logged in via ${provider}! 🚀` :
          `Accesso effettuato tramite ${provider}! 🚀`,
      'success'
    );
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-dark)', position: 'relative' }}
    >

      {/* Brand Identity - Top Left */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1.5px solid var(--border)', flexShrink: 0 }}>
          <img src="/logo.png" alt="Urban Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '900', lineHeight: '1.1', background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Syne', sans-serif" }}>Urbani Im</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.01em', marginTop: '1px' }}>{language === 'al' ? 'Transporti Urban i Tiranës' : 'Tirana Urban Transport'}</p>
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
                  {m === 'login' ? (language === 'al' ? 'Hyr' : language === 'en' ? 'Login' : 'Accedi') : (language === 'al' ? 'Regjistrohu' : language === 'en' ? 'Register' : 'Registrati')}
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
                  <label className="label">{language === 'al' ? 'Emri i plotë' : 'Full Name'}</label>
                  <input className="input-field" type="text" placeholder="Andi Krasniqi" value={name} onChange={e => setName(e.target.value)} required />
                </div>
              )}
              <div>
                <label className="label">Email</label>
                <input className="input-field" type="email" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {mode === 'register' && (
                <div>
                  <label className="label">{language === 'al' ? 'Numri i telefonit' : 'Phone Number'}</label>
                  <PhoneInput country={selectedCountry} setCountry={setSelectedCountry} phone={phone} setPhone={setPhone} />
                </div>
              )}
              <div>
                <label className="label">{language === 'al' ? 'Fjalëkalimi' : 'Password'}</label>
                <div style={{ position: 'relative' }}>
                  <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
                      {language === 'al' ? 'Keni harruar fjalëkalimin?' : 'Forgot password?'}
                    </button>
                  </div>
                )}
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--danger)' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px' }} disabled={loading}>
                {loading ? '...' : (mode === 'login' ? 'Hyr' : 'Regjistrohu')} <ArrowRight size={16} />
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'formEnter 0.4s ease-out' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Hapi 1: Email</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Shkruani email-in tuaj për të marrë kodin.</p>
              <div>
                <label className="label">Email</label>
                <input className="input-field" type="email" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px' }} disabled={loading}>
                {loading ? 'Duke dërguar...' : 'Vazhdo'}
              </button>
              <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '13px', cursor: 'pointer' }}>Anulo</button>
            </form>
          )}

          {mode === 'verify' && (
            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'formEnter 0.4s ease-out' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Hapi 2: Kodi</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Shkruani kodin 6-shifror nga email-i.</p>
              {success && <div style={{ color: '#10b981', fontSize: '13px', textAlign: 'center' }}>{success}</div>}
              <div>
                <label className="label">Kodi</label>
                <input className="input-field" type="text" maxLength={6} placeholder="123456" value={code} onChange={e => setCode(e.target.value)} required style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }} />
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px' }} disabled={loading}>
                {loading ? 'Duke verifikuar...' : 'Verifiko'}
              </button>
            </form>
          )}

          {mode === 'new_password' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'formEnter 0.4s ease-out' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Hapi 3: Fjalëkalimi</h3>
              <div>
                <label className="label">Fjalëkalimi i Ri</label>
                <input className="input-field" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              {error && <div style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px' }} disabled={loading}>
                {loading ? 'Duke ruajtur...' : 'Ndrysho Fjalëkalimin'}
              </button>
            </form>
          )}



          {/* Social Logins */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <div style={{ margin: '20px 0 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase' }}>Ose vazhdo me</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Apple', 'Google', 'Facebook'].map(s => (
                  <button key={s} type="button" onClick={() => handleSocialLogin(s)} style={{ flex: 1, height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', color: '#fff', fontSize: '12px' }}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-dim)', opacity: 0.6 }}>
          <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Tirana, Shqipëri &nbsp;·&nbsp; v1.0.6
        </p>
      </div>
    </motion.div>
  );
}
