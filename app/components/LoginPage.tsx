'use client';
import { useState, useRef, useEffect } from 'react';
import { Bus, Eye, EyeOff, ArrowRight, MapPin } from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../store/translations';

const MOCK_USERS = [
  { id: '1', name: 'Andi Krasniqi', email: 'andi@test.al', password: 'password', savedLocations: { home: 'Blloku', work: 'Sheshi Skënderbej' }, travelHistory: [] },
  { id: '2', name: 'Era Hoxha', email: 'era@test.al', password: 'password', savedLocations: { home: 'Kombinat', work: 'Piramida' }, travelHistory: [] },
];

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

function PhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState(COUNTRY_CODES[1]); // Default to Albania
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

      <input className="input-field" type="tel" placeholder="6X XXX XXXX" value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1 }} required />
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useStore((state: any) => state.login);
  const loginAsStaff = useStore((state: any) => state.loginAsStaff);
  const addNotification = useStore((state: any) => state.addNotification);
  const language = useStore((state: any) => state.language);
  const setLanguage = useStore((state: any) => state.setLanguage);
  const t = translations[language] || translations.al;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'login') {
      await new Promise(r => setTimeout(r, 800));
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (user) {
        login({ id: user.id, name: user.name, email: user.email, savedLocations: user.savedLocations, travelHistory: user.travelHistory }, 'jwt-token-mock');
        addNotification(language === 'al' ? `Mirë se erdhe, ${user.name}! 🚌` : language === 'en' ? `Welcome, ${user.name}! 🚌` : `Benvenuto, ${user.name}! 🚌`, 'success');
      } else {
        setError(language === 'al' ? 'Email ose fjalëkalimi gabim.' : language === 'en' ? 'Incorrect email or password.' : 'Email o password errata.');
      }
    } else {
      await new Promise(r => setTimeout(r, 800));
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError(language === 'al' ? 'Plotëso të gjitha fushat.' : language === 'en' ? 'Fill all fields.' : 'Compila tutti i campi.');
      } else {
        login({ id: Date.now().toString(), name, email, savedLocations: { home: '', work: '' }, travelHistory: [] }, 'jwt-token-mock');
        addNotification(language === 'al' ? `Llogaria u krijua me sukses, ${name}! 🎉` : language === 'en' ? `Account created successfully, ${name}! 🎉` : `Account creato con successo, ${name}! 🎉`, 'success');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #1c1c1c 0%, #000 100%)', position: 'relative' }}>

      {/* Brand Identity - Top Left */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1.5px solid var(--border)', flexShrink: 0 }}>
          <img src="/logo-Urban.png" alt="Urban Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                position: 'absolute', top: '50%', left: '50%',
                width: 0, height: 0, 
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
                borderRight: mode === 'login' ? '6px solid #fff' : 'none',
                borderLeft: mode === 'register' ? '6px solid #fff' : 'none',
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.4s cubic-bezier(0.65, 0, 0.35, 1)',
                filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))'
              }}></div>
            </div>
          </div>

          {/* Synchronized Smooth Animation */}
          <form 
            key={mode}
            onSubmit={handleSubmit} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              animation: 'formEnter 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards'
            }}
          >
            <style>{`
              @keyframes formEnter {
                from { 
                  opacity: 0; 
                  transform: translateX(${mode === 'register' ? '20px' : '-20px'}) scale(0.99); 
                  filter: blur(4px);
                }
                to { 
                  opacity: 1; 
                  transform: translateX(0) scale(1); 
                  filter: blur(0);
                }
              }
            `}</style>

            {mode === 'register' && (
              <div>
                <label className="label">{language === 'al' ? 'Emri i plotë' : language === 'en' ? 'Full Name' : 'Nome Completo'}</label>
                <input className="input-field" type="text" placeholder={language === 'al' ? 'p.sh. Andi Krasniqi' : 'e.g. John Doe'} value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input className="input-field" type="email" placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            {mode === 'register' && (
              <div>
                <label className="label">{language === 'al' ? 'Numri i telefonit' : 'Phone Number'}</label>
                <PhoneInput value={phone} onChange={setPhone} />
              </div>
            )}
            <div>
              <label className="label">{language === 'al' ? 'Fjalëkalimi' : language === 'en' ? 'Password' : 'Password'}</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                  <button type="button" style={{ background: 'none', border: 'none', padding: 0, color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                  >
                    {language === 'al' ? 'Keni harruar fjalëkalimin?' : language === 'en' ? 'Forgot password?' : 'Password dimenticata?'}
                  </button>
                </div>
              )}
            </div>


            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', marginTop: '4px' }} disabled={loading}>
              {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}></span>
                : <>{mode === 'login' ? (language === 'al' ? 'Hyr në llogari' : language === 'en' ? 'Login to account' : 'Accedi all\'account') : (language === 'al' ? 'Krijo llogarinë' : language === 'en' ? 'Create account' : 'Crea account')} <ArrowRight size={16} /></>}
            </button>

            {/* Social Login Section */}
            <div style={{ margin: '20px 0 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {language === 'al' ? 'Ose vazhdo me' : language === 'en' ? 'Or continue with' : 'O continua con'}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { name: 'Apple', icon: <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/> },
                { name: 'Google', icon: <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/> },
                { name: 'Facebook', icon: <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.97h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z"/> }
              ].map(social => (
                <button key={social.name} type="button" 
                  style={{ 
                    flex: 1, height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fff' }}>
                    {social.icon}
                  </svg>
                </button>
              ))}
            </div>
          </form>

          {mode === 'login' && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>{language === 'al' ? 'LLOGARITË E TESTIMIT (Përdorues):' : 'TEST ACCOUNTS (User):'}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📧 andi@test.al &nbsp;|&nbsp; 🔑 password</p>
            </div>
          )}



        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-dim)', opacity: 0.6 }}>
          <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Tirana, Shqipëri &nbsp;·&nbsp; Powered by Urbani Im &nbsp;·&nbsp; v1.0.4
        </p>
      </div>
    </div>
  );
}
