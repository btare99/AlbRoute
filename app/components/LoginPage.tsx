'use client';
import { useState } from 'react';
import { Bus, Eye, EyeOff, ArrowRight, MapPin } from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../store/translations';

const MOCK_USERS = [
  { id: '1', name: 'Andi Krasniqi', email: 'andi@test.al', password: 'password', savedLocations: { home: 'Blloku', work: 'Sheshi Skënderbej' }, travelHistory: [] },
  { id: '2', name: 'Era Hoxha', email: 'era@test.al', password: 'password', savedLocations: { home: 'Kombinat', work: 'Piramida' }, travelHistory: [] },
];

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'staff'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useStore((state: any) => state.login);
  const loginAsStaff = useStore((state: any) => state.loginAsStaff);
  const addNotification = useStore((state: any) => state.addNotification);
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'staff') {
      try {
        const res = await fetch('/api/auth/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, pin: password }),
        });

        const data = await res.json();
        if (res.ok && data.user) {
          loginAsStaff(data.user);
          addNotification(language === 'al' ? `Mirë se erdhe, ${data.user.name}! 🚌` : language === 'en' ? `Welcome, ${data.user.name}! 🚌` : `Benvenuto, ${data.user.name}! 🚌`, 'success');
        } else {
          setError(language === 'al' ? 'Username ose PIN i pasaktë.' : language === 'en' ? 'Incorrect username or PIN.' : 'Username o PIN errato.');
        }
      } catch (err) {
        setError(language === 'al' ? 'Gabim në lidhje me serverin.' : language === 'en' ? 'Server connection error.' : 'Errore di connessione al server.');
      }
    } else if (mode === 'login') {
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.1) 0%, transparent 60%), var(--bg-dark)' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '22px', marginBottom: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1.5px solid var(--border)' }}>
            <img src="/logo-Urban.png" alt="Urban Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '22px' }} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '6px', background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Urbani Im</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', letterSpacing: '0.02em' }}>{language === 'al' ? 'Transporti Urban i Tiranës' : language === 'en' ? 'Tirana Urban Transport' : 'Trasporto Urbano di Tirana'}</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px', marginBottom: '28px' }}>
            {(['login', 'register', 'staff'] as const).map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(''); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', transition: 'var(--transition)', background: mode === m ? 'var(--primary)' : 'transparent', color: mode === m ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>
                {m === 'login' ? (language === 'al' ? 'Hyr' : language === 'en' ? 'Login' : 'Accedi') : m === 'register' ? (language === 'al' ? 'Regjistrohu' : language === 'en' ? 'Register' : 'Registrati') : (language === 'al' ? 'Stafi' : language === 'en' ? 'Staff' : 'Staff')}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {mode !== 'staff' ? (
              <>
                {mode === 'register' && (
                  <div>
                    <label className="label">{language === 'al' ? 'Emri i plotë' : language === 'en' ? 'Full Name' : 'Nome Completo'}</label>
                    <input className="input-field" type="text" placeholder={language === 'al' ? 'p.sh. Andi Krasniqi' : 'e.g. John Doe'} value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                )}
                <div>
                  <label className="label">Email</label>
                  <input className="input-field" type="email" placeholder="email@example.al" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="label">{language === 'al' ? 'Fjalëkalimi' : language === 'en' ? 'Password' : 'Password'}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label">{language === 'al' ? 'Përdoruesi (Username)' : language === 'en' ? 'Username' : 'Username'}</label>
                  <input className="input-field" type="text" placeholder={language === 'al' ? 'p.sh. shoferi.1' : 'e.g. driver.1'} value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="label">{language === 'al' ? 'PIN-i i Sigurisë' : language === 'en' ? 'Security PIN' : 'PIN di Sicurezza'}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="Kodi PIN" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}


            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', marginTop: '4px' }} disabled={loading}>
              {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}></span>
                : <>{mode === 'login' ? (language === 'al' ? 'Hyr në llogari' : language === 'en' ? 'Login to account' : 'Accedi all\'account') : mode === 'register' ? (language === 'al' ? 'Krijo llogarinë' : language === 'en' ? 'Create account' : 'Crea account') : (language === 'al' ? 'Hyr si Personel' : language === 'en' ? 'Login as Staff' : 'Accedi come Staff')} <ArrowRight size={16} /></>}
            </button>
          </form>

          {mode === 'login' && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>{language === 'al' ? 'LLOGARITË E TESTIMIT (Përdorues):' : 'TEST ACCOUNTS (User):'}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📧 andi@test.al &nbsp;|&nbsp; 🔑 password</p>
            </div>
          )}

          {mode === 'staff' && (
            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(59,130,246,0.05)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.1)' }}>
              <p style={{ fontSize: '12px', color: '#475569', marginBottom: '4px', fontWeight: '700' }}>{language === 'al' ? 'UDHËZIM PËR STAFIN:' : 'STAFF INSTRUCTIONS:'}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{language === 'al' ? 'Përdorni emrin e përdoruesit dhe PIN-in e dhënë nga administrata për të parë orarin tuaj.' : 'Use the username and PIN provided by administration to view your schedule.'}</p>
            </div>
          )}

        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-dim)' }}>
          <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
          Tirana, Shqipëri &nbsp;·&nbsp; {language === 'al' ? 'Të dhëna të simuluara për demonstrim' : 'Simulated data for demonstration'}
        </p>
      </div>
    </div>
  );
}
