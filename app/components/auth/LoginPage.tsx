'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from "next-auth/react";
import { Preferences } from '@capacitor/preferences';
import useStore from '../../store/useStore';
import { translations } from '../../store/translations';
import { AsYouType } from 'libphonenumber-js';
import { Mail, Lock, User, Phone, Eye, EyeOff, ChevronLeft, ArrowRight } from 'lucide-react';

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
    <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button type="button" onClick={() => setOpen(!open)} style={{
          height: '52px', background: '#121214', border: '1px solid #27272a',
          borderRadius: '14px', color: '#ffffff', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', transition: 'all 0.2s', minWidth: 'auto', minHeight: 'auto'
        }}>
          <span style={{ fontSize: '18px' }}>{country.flag}</span>
          <span style={{ fontSize: '14px', color: '#a1a1aa', fontWeight: '600' }}>{country.code}</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
            background: '#121214', border: '1px solid #27272a', borderRadius: '14px',
            width: '220px', padding: '8px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <input
                autoFocus placeholder={t.auth_search_country}
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: '#1c1c1f', border: '1px solid #27272a', borderRadius: '8px',
                  padding: '8px 10px', color: '#ffffff', fontSize: '13px', outline: 'none'
                }}
              />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filtered.map(c => (
                <button key={c.code} type="button" onClick={() => { setCountry(c); setOpen(false); setSearch(''); }}
                  className="auth-dropdown-item"
                  style={{
                    background: country.code === c.code ? '#1c1c1f' : 'transparent',
                    fontWeight: country.code === c.code ? '700' : '400'
                  }}>
                  <span style={{ fontSize: '16px' }}>{c.flag}</span>
                  <span style={{ flex: 1, fontSize: '12px' }}>{c.name}</span>
                  <span style={{ fontSize: '11px', color: '#71717a' }}>{c.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', flex: 1 }}>
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', display: 'flex', alignItems: 'center' }}>
          <Phone size={18} />
        </span>
        <input 
          className="premium-dark-input" 
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
          style={{ paddingLeft: '48px', width: '100%' }} 
          required 
          autoComplete="tel"
        />
      </div>
    </div>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify' | 'verify-registration' | 'new_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[1]); // Default Albania
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [registrationEmail, setRegistrationEmail] = useState(''); // Store email for verification after registration
  const [registrationPassword, setRegistrationPassword] = useState(''); // Store password for auto-login after verification

  const login = useStore((state: any) => state.login);
  const setGuestMode = useStore((state: any) => state.setGuestMode);
  const addNotification = useStore((state: any) => state.addNotification);
  const language = useStore((state: any) => state.language);
  const setLanguage = useStore((state: any) => state.setLanguage);
  const t = translations[language] || translations.al;
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

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

    const token = searchParams.get('resetToken');
    if (token) {
      setResetToken(token);
      setMode('new_password');
      setSuccess('Klikoni butonin për të vendosur fjalëkalimin e ri.');
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
        setSuccess(t.auth_reset_link_sent);
        setMode('forgot');
      } else {
        setError(data.error || t.auth_change_failed);
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

  // ─── FIX #2: Verify email during registration ─────────────────────────────────
  const handleVerifyEmailRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const combinedCode = otp.join('');
      
      if (!combinedCode || combinedCode.length !== 6) {
        setError('Ju lutem shkruani kodin 6-shifror.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registrationEmail, code: combinedCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Email-i u verifikua me sukses!');
        
        // ─── Auto login after verification ──────────────────────────────────────
        const loginResult = await signIn('credentials', {
          email: registrationEmail,
          password: registrationPassword,
          redirect: false,
        });

        if (!loginResult?.error) {
          addNotification(t.auth_account_created || 'Llogara u krijua me sukses!', 'success');
          window.location.reload();
        } else {
          setError(t.auth_auto_login_error || 'Ndodhi një gabim gjatë hyrjes. Ju lutem provoni të hyni.');
        }
      } else {
        setError(data.error || 'Kodi është i pasaktë ose ka skaduar.');
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
    // Client-side confirm-password validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      const payload: any = { newPassword };
      if (resetToken) {
        payload.resetToken = resetToken;
      } else {
        payload.email = email;
        payload.code = code;
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        addNotification(t.auth_password_changed, 'success');
        setMode('login');
        setSuccess('');
        setEmail('');
        setCode('');
        setOtp(['', '', '', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
        setResetToken('');
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
          // ─── FIX #1: Store credentials and show verification screen ─────────────
          setRegistrationEmail(email.toLowerCase());
          setRegistrationPassword(password);
          setOtp(['', '', '', '', '', '']); // Reset OTP fields
          setCode('');
          setMode('verify-registration');
          setSuccess(t.auth_code_sent || 'Kodi i verifikimit u dërgua në email-in tuaj.');
          setError('');
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

  const handleBack = () => {
    setError('');
    setSuccess('');
    if (mode === 'register' || mode === 'forgot') {
      setMode('login');
    } else if (mode === 'verify-registration') {
      // ─── FIX #3: Back from email verification — return to register ─────────────
      setMode('register');
      setOtp(['', '', '', '', '', '']);
      setCode('');
      setRegistrationEmail('');
      setRegistrationPassword('');
    } else if (mode === 'verify') {
      setMode('forgot');
    } else if (mode === 'new_password') {
      if (resetToken) {
        setResetToken('');
        setMode('login');
      } else {
        setMode('verify');
      }
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    const combinedCode = newOtp.join('');
    setCode(combinedCode);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setCode(newOtp.join(''));
    
    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const getTitle = () => {
    if (language === 'al') {
      switch (mode) {
        case 'login': return <>Hej,<br />Mirë se<br />erdhe</>;
        case 'register': return <>Le të<br />fillojmë</>;
        case 'forgot': return <>Harruat<br />fjalëkalimin?</>;
        case 'verify': return <>Verifiko<br />Email-in</>;
        case 'verify-registration': return <>Verifiko<br />Email-in</>;
        case 'new_password': return <>Krijo<br />fjalëkalim të ri</>;
      }
    } else if (language === 'it') {
      switch (mode) {
        case 'login': return <>Ehi,<br />Bentornato</>;
        case 'register': return <>Iniziamo</>;
        case 'forgot': return <>Password<br />dimenticata?</>;
        case 'verify': return <>Verifica<br />la tua email</>;
        case 'verify-registration': return <>Verifica<br />la tua email</>;
        case 'new_password': return <>Crea<br />nuova password</>;
      }
    } else {
      switch (mode) {
        case 'login': return <>Hey,<br />Welcome<br />Back</>;
        case 'register': return <>Let`s get<br />Started</>;
        case 'forgot': return <>Forget<br />Password?</>;
        case 'verify': return <>Verify<br />Your Email</>;
        case 'verify-registration': return <>Verify<br />Your Email</>;
        case 'new_password': return <>Create<br />New password</>;
      }
    }
  };

  const getDescription = () => {
    if (language === 'al') {
      switch (mode) {
        case 'forgot': return 'Shkruani email-in tuaj për të marrë kodin.';
        case 'verify': return 'Ju lutem shkruani kodin 6-shifror të dërguar në email-in tuaj';
        case 'verify-registration': return 'Shkruani kodin 6-shifror të dërguar në email-in tuaj për të përfunduar regjistrimin';
        case 'new_password': return 'Fjalëkalimi i ri duhet të jetë i ndryshëm nga ai i mëparshmi';
        default: return '';
      }
    } else if (language === 'it') {
      switch (mode) {
        case 'forgot': return 'Inserisci il tuo indirizzo email per ricevere il codice.';
        case 'verify': return 'Inserisci il codice a 6 cifre inviato alla tua email';
        case 'verify-registration': return 'Inserisci il codice a 6 cifre inviato alla tua email per completare la registrazione';
        case 'new_password': return 'La nuova password deve essere diversa da quella precedente';
        default: return '';
      }
    } else {
      switch (mode) {
        case 'forgot': return 'Enter your email address to receive a reset link.';
        case 'verify': return 'Please enter the 6 digit code sent to your email.';
        case 'verify-registration': return 'Please enter the 6 digit code sent to your email to complete registration.';
        case 'new_password': return 'Use the link from your email to set a new password.';
        default: return '';
      }
    }
  };

  return (
    <div className="auth-page-bg">
      <style>{`
        .auth-page-bg {
          min-height: 100dvh;
          width: 100%;
          background: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .auth-phone-container {
          width: 100%;
          max-width: 420px;
          min-height: 100dvh;
          background-color: #000000;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 24px 24px;
          background-position: center;
          color: #ffffff;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          box-sizing: border-box;
          position: relative;
        }

        @media (min-width: 420px) {
          .auth-phone-container {
            min-height: 850px;
            height: auto;
            border-radius: 40px;
            border: 4px solid #1c1c1f;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);
            margin: 20px 0;
          }
        }

        .premium-dark-input {
          width: 100%;
          height: 52px;
          background: #121214;
          border: 1px solid #27272a;
          border-radius: 14px;
          color: #ffffff;
          font-size: 16px !important;
          padding: 12px 16px 12px 48px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .premium-dark-input:focus {
          border-color: #71717a;
          background: #18181b;
        }

        .premium-dark-input::placeholder {
          color: #52525b;
        }

        .white-capsule-btn {
          width: 100%;
          height: 52px;
          background: #ffffff;
          color: #000000;
          border: none;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          gap: 8px;
        }

        .white-capsule-btn:hover {
          background: #e4e4e7;
        }

        .white-capsule-btn:active {
          transform: scale(0.98);
        }

        .white-capsule-btn:disabled {
          background: #71717a;
          color: #18181b;
          cursor: not-allowed;
        }

        .social-capsule-btn {
          width: 100%;
          height: 52px;
          background: #000000;
          border: 1px solid #27272a;
          border-radius: 9999px;
          color: #ffffff;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: auto;
          min-height: auto;
        }

        .social-capsule-btn:hover {
          background: #121214;
          border-color: #3f3f46;
        }

        .social-capsule-btn:active {
          transform: scale(0.98);
        }

        .auth-dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 8px;
          border: none;
          color: #ffffff;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .auth-dropdown-item:hover {
          background: #1c1c1f;
        }

        .otp-square-input {
          width: 44px;
          height: 48px;
          background: #121214;
          border: 1px solid #27272a;
          border-radius: 12px;
          color: #ffffff;
          font-size: 20px;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: all 0.2s ease;
        }

        .otp-square-input:focus {
          border-color: #ffffff;
          background: #18181b;
        }

        .hover-white-link {
          color: #71717a;
          transition: color 0.2s;
        }

        .hover-white-link:hover {
          color: #ffffff;
        }

        @keyframes formEnter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="auth-phone-container">
        {/* Header containing Back Navigation and Language Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '40px', width: '100%', marginBottom: '16px' }}>
          {mode !== 'login' ? (
            <button 
              type="button" 
              onClick={handleBack}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                color: '#71717a', background: 'none', border: 'none',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                padding: '8px 0', minWidth: 'auto', minHeight: 'auto'
              }}
            >
              <ChevronLeft size={18} /> Back
            </button>
          ) : <div />}

          <div style={{ display: 'flex', gap: '2px', background: '#121214', padding: '3px', borderRadius: '8px', border: '1px solid #27272a' }}>
            {['al', 'en', 'it'].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800',
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s',
                  background: language === lang ? '#18181b' : 'transparent',
                  color: language === lang ? '#ffffff' : '#71717a',
                  border: 'none',
                  minWidth: 'auto',
                  minHeight: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Tag in Emerald matching mockup look */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Urbani Im <span style={{ fontSize: '13px' }}>↘</span>
        </div>

        {/* Massive Bold Left-Aligned Heading */}
        <h1 style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.15', color: '#ffffff', margin: '0 0 8px', letterSpacing: '-0.02em', textAlign: 'left' }}>
          {getTitle()}
        </h1>

        {/* Subtitle Description */}
        {getDescription() && (
          <p style={{ fontSize: '14px', color: '#71717a', margin: '0 0 32px', lineHeight: 1.4, textAlign: 'left', whiteSpace: 'pre-line' }}>
            {getDescription()}
          </p>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: getDescription() ? '0px' : '24px' }}>
          
          {/* Form Content */}
          <div>
            {(mode === 'login' || mode === 'register') && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'formEnter 0.3s ease-out' }}>
                {mode === 'register' && (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', display: 'flex', alignItems: 'center' }}>
                      <User size={18} />
                    </span>
                    <input className="premium-dark-input" type="text" placeholder={t.auth_fullname} value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
                  </div>
                )}
                
                <div style={{ position: 'relative', width: '100%' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', display: 'flex', alignItems: 'center' }}>
                    <Mail size={18} />
                  </span>
                  <input className="premium-dark-input" type="email" placeholder={t.auth_email} value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                
                {mode === 'register' && (
                  <PhoneInput country={selectedCountry} setCountry={setSelectedCountry} phone={phone} setPhone={setPhone} t={t} />
                )}
                
                <div style={{ position: 'relative', width: '100%' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} />
                  </span>
                  <input 
                    className="premium-dark-input" 
                    type={showPass ? 'text' : 'password'} 
                    placeholder={t.auth_password} 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    style={{ paddingLeft: '48px', paddingRight: '48px' }} 
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'} 
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', background: 'none', border: 'none', cursor: 'pointer', width: '24px', height: '24px', minWidth: 'auto', minHeight: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {mode === 'login' && (
                  <div style={{ textAlign: 'center', margin: '4px 0 16px' }}>
                    <button type="button" onClick={() => { setMode('forgot'); setError(''); }} style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s' }} className="hover-white-link">
                      {t.auth_forgot}
                    </button>
                  </div>
                )}

                {error && <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', padding: '12px', fontSize: '13px', color: '#ef4444', fontWeight: '500', textAlign: 'center' }}>{error}</div>}

                <button type="submit" className="white-capsule-btn" disabled={loading} style={{ marginTop: mode === 'register' ? '12px' : '0px' }}>
                  {loading ? '...' : (mode === 'login' ? t.auth_login : t.auth_register)} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'formEnter 0.3s ease-out' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', display: 'flex', alignItems: 'center' }}>
                    <Mail size={18} />
                  </span>
                  <input className="premium-dark-input" type="email" placeholder={t.auth_email} value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                {success && <div style={{ color: '#10b981', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>{success}</div>}
                {error && <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>{error}</div>}
                <button type="submit" className="white-capsule-btn" disabled={loading} style={{ marginTop: '12px' }}>
                  {loading ? t.auth_sending : t.auth_continue}
                </button>
              </form>
            )}

            {mode === 'verify' && (
              <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'formEnter 0.3s ease-out' }}>
                {success && <div style={{ color: '#10b981', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>{success}</div>}
                
                {/* 6 Grid Squares for verification code entry */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', maxWidth: '340px', margin: '12px auto' }} onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text"
                      className="otp-square-input"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(e.target.value, idx)}
                      onKeyDown={e => handleOtpKeyDown(e, idx)}
                      required
                    />
                  ))}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button type="button" onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s' }} className="hover-white-link">
                    Resend Code
                  </button>
                </div>

                {error && <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>{error}</div>}
                
                <button type="submit" className="white-capsule-btn" disabled={loading}>
                  {loading ? t.auth_verifying : t.auth_verify}
                </button>
              </form>
            )}

            {/* ─── FIX #4: Email verification form during registration ──────────────── */}
            {mode === 'verify-registration' && (
              <form onSubmit={handleVerifyEmailRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'formEnter 0.3s ease-out' }}>
                {success && <div style={{ color: '#10b981', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>{success}</div>}
                
                <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '10px', textAlign: 'center', fontSize: '12px', color: '#2563eb' }}>
                  Kodi u dërgua në: <strong>{registrationEmail}</strong>
                </div>

                {/* 6 Grid Squares for verification code entry */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', maxWidth: '340px', margin: '12px auto' }} onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text"
                      className="otp-square-input"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(e.target.value, idx)}
                      onKeyDown={e => handleOtpKeyDown(e, idx)}
                      required
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'color 0.2s' }} className="hover-white-link">
                    Dërgoje kodin sërish
                  </button>
                </div>

                {error && <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '12px', padding: '12px', fontSize: '13px', color: '#ef4444', fontWeight: '500', textAlign: 'center' }}>{error}</div>}
                
                <button type="submit" className="white-capsule-btn" disabled={loading}>
                  {loading ? '...' : 'Verifiko'} <ArrowRight size={18} />
                </button>
              </form>
            )}

            {mode === 'new_password' && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'formEnter 0.3s ease-out' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} />
                  </span>
                  <input className="premium-dark-input" type="password" placeholder={t.auth_new_password} value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" />
                </div>
                <div style={{ position: 'relative', width: '100%' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#52525b', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} />
                  </span>
                  <input className="premium-dark-input" type="password" placeholder={t.edit_confirm_new_password || 'Confirm New Password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
                </div>
                {error && <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>{error}</div>}
                <button type="submit" className="white-capsule-btn" disabled={loading} style={{ marginTop: '12px' }}>
                  {loading ? t.auth_saving : t.auth_change_password}
                </button>
              </form>
            )}

            {/* Social Sign-in Section */}
            {(mode === 'login' || mode === 'register') && (
              <>
                <div style={{ margin: '24px 0 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', background: '#27272a' }}></div>
                  <span style={{ fontSize: '11px', color: '#52525b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
                  <div style={{ flex: 1, height: '1px', background: '#27272a' }}></div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button type="button" onClick={() => handleSocialLogin('Apple')} className="social-capsule-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.88 3.5-.84 1.58.07 2.79.75 3.67 1.99-3.18 1.9-2.58 5.98.54 7.21-.71 1.83-1.6 3.65-2.79 4.83zm-3.69-14.86c-.53-2.05 1.25-4.14 3.19-4.42.74 2.3-1.69 4.38-3.19 4.42z"/>
                    </svg>
                    {mode === 'login' ? 'Continue with Apple' : 'Sign up with Apple'}
                  </button>
                  <button type="button" onClick={() => handleSocialLogin('Google')} className="social-capsule-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer Navigation */}
          <div style={{ marginTop: '36px', textAlign: 'center' }}>
            {mode === 'login' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
                  Don`t have an account?{' '}
                  <button type="button" onClick={() => { setMode('register'); setError(''); }} style={{ background: 'none', border: 'none', color: '#ffffff', fontWeight: '700', padding: '2px', cursor: 'pointer', textDecoration: 'underline' }}>
                    Sign up
                  </button>
                </p>
                <button type="button" onClick={() => setGuestMode(true)} style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: '700', fontSize: '14px', padding: '4px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = '#f59e0b'}>
                  Vazhdo si Vizitor / Continue as Guest ➔
                </button>
              </div>
            ) : mode === 'register' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
                  Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: '#ffffff', fontWeight: '700', padding: '2px', cursor: 'pointer', textDecoration: 'underline' }}>
                    Login
                  </button>
                </p>
                <button type="button" onClick={() => setGuestMode(true)} style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: '700', fontSize: '14px', padding: '4px', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = '#f59e0b'}>
                  Vazhdo si Vizitor / Continue as Guest ➔
                </button>
              </div>
            ) : null}

            {/* Compact footer: location, version + links */}
            <p style={{ margin: '14px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.28)', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Tirana, Shqipëri</span>
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
              <button onClick={() => setGuestMode(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', cursor: 'pointer', padding: 0 }}>v1.0.6</button>
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
              <Link href="/privacy" className="hover-white-link" style={{ color: 'rgba(255,255,255,0.28)', textDecoration: 'underline' }}>Privacy</Link>
              <span style={{ color: 'rgba(255,255,255,0.12)' }}>·</span>
              <Link href="/terms" className="hover-white-link" style={{ color: 'rgba(255,255,255,0.28)', textDecoration: 'underline' }}>Terms</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000000' }} />}>
      <LoginContent />
    </Suspense>
  );
}
