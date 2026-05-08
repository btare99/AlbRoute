'use client';
import { useState } from 'react';
import {
  Eye, EyeOff, ArrowRight, ShieldCheck, Bus, Mail, Lock,
  AlertCircle, Info, User, Route, Activity, MapPin, Clock, Navigation, Users,
} from 'lucide-react';
import useStore from '../store/useStore';

// ── Hardcoded dispatcher accounts (not stored in MongoDB, highest privilege) ──
const DISPATCHER_ACCOUNTS = [
  { username: 'admin@urbani.al', pin: '1234', name: 'Admin Kryesor', role: 'dispatcher' as const },
];

export default function LoginPage() {
  const [mode, setMode] = useState<'dispatcher' | 'staff'>('dispatcher');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginWithAccount = useStore((state: any) => state.loginWithAccount);
  const loginFromDb = useStore((state: any) => state.loginFromDb);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedUsername = username.trim();
    const trimmedPin = pin.trim();

    try {
      if (mode === 'dispatcher') {
        // 1. Try hardcoded dispatcher accounts first
        const dispatcher = DISPATCHER_ACCOUNTS.find(
          (a) => a.username === trimmedUsername && a.pin === trimmedPin
        );

        if (dispatcher) {
          loginWithAccount(trimmedUsername, trimmedPin, {
            id: 'admin_1',
            name: dispatcher.name,
            username: dispatcher.username,
            pin: dispatcher.pin,
            role: 'dispatcher' as const,
            status: 'Aktiv',
            createdAt: 0,
          });
          return;
        }

        // 2. Try operator accounts from DB (operators also use dispatcher tab)
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedUsername, pin: trimmedPin }),
        });
        const data = await res.json();

        if (res.ok && data.user) {
          if (data.user.role === 'operator') {
            loginFromDb(data.user);
            return;
          }
          // drivers/inspectors should use the staff tab
          setError('Shoferët dhe faturinot duhet të hyjnë nga skeda "Shofer / Faturino".');
        } else {
          setError('Email ose fjalëkalim/PIN gabim.');
        }
      } else {
        // Staff tab: drivers, inspectors, AND operators
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedUsername, pin: trimmedPin }),
        });
        const data = await res.json();

        if (res.ok && data.user) {
          if (data.user.role === 'driver' || data.user.role === 'inspector' || data.user.role === 'operator') {
            loginFromDb(data.user);
          } else {
            setError('Ky llogari nuk është e konfiguruar si staf operacional.');
          }
        } else {
          setError(data.error || 'ID ose PIN gabim. Kontaktoni dispatcherin.');
        }
      }
    } catch {
      setError('Gabim në lidhje me serverin. Provoni sërish.');
    } finally {
      setLoading(false);
    }
  };

  const isDispatcher = mode === 'dispatcher';

  return (
    <div className="bo-login-shell">

  {/* LEFT PANEL — info */}
  <div className="login-left">

    <div className="login-left-brand">
      <div className="llb-icon"><Bus size={22} color="#a78bfa" /></div>
      <span>Urbani Im</span>
    </div>

    <div className="login-left-hero">
      <div className="llh-tag">Sistemi Operativ</div>
      <h2>Menaxhimi i flotës urbane në kohë reale</h2>
      <p>Platforma qendrore për drejtuesit, faturinot dhe dispatcherët e Urbanit Tiranë.</p>
    </div>

    <div className="login-stat-grid">
      {[
        { icon: <Bus size={16} />,      label: 'Autobusë aktivë',  value: '42',   color: '#a78bfa' },
        { icon: <Users size={16} />,    label: 'Staf në turne',    value: '118',  color: '#38bdf8' },
        { icon: <Route size={16} />,    label: 'Linja operative',  value: '14',   color: '#4ade80' },
        { icon: <Activity size={16} />, label: 'Ngarkesa mesatare',value: '71%',  color: '#fb923c' },
      ].map(({ icon, label, value, color }) => (
        <div key={label} className="login-stat-card">
          <div className="lsc-icon" style={{ color, background: `${color}18` }}>{icon}</div>
          <div className="lsc-val" style={{ color }}>{value}</div>
          <div className="lsc-label">{label}</div>
        </div>
      ))}
    </div>

    <div className="login-feature-list">
      {[
        { icon: <MapPin size={14} />,     text: 'Gjurmim GPS i autobusëve live' },
        { icon: <ShieldCheck size={14} />, text: 'Qasje e sigurt me PIN personal' },
        { icon: <Clock size={14} />,      text: 'Orar javor automatik për stafin' },
        { icon: <Navigation size={14} />, text: 'Planifikim rrugësh në kohë reale' },
      ].map(({ icon, text }) => (
        <div key={text} className="lfl-row">
          <div className="lfl-dot">{icon}</div>
          <span>{text}</span>
        </div>
      ))}
    </div>

    <div className="login-left-footer">
      <div className="llf-status">
        <div className="llf-dot" />
        <span>Të gjitha sistemet operative</span>
      </div>
      <span className="llf-ver">v2.5.0</span>
    </div>
  </div>

  {/* RIGHT PANEL — form */}
  <div className="login-right">
    <div className="login-card">

      <div className="lc-heading">
        <h1>Hyrje personale</h1>
        <p>Përdorni kredencialet tuaja për të aksesuar panelin tuaj.</p>
      </div>

      {/* TOGGLE */}
      <div className="mode-toggle">
        {(['dispatcher', 'staff'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(''); setUsername(''); setPin(''); }}
            className={`mode-btn${mode === m ? ' active' : ''}`}
          >
            {m === 'dispatcher'
              ? <><ShieldCheck size={14} /><span>Dispatcher</span></>
              : <><Bus size={14} /><span>Shofer / Faturino / Operator</span></>
            }
          </button>
        ))}
      </div>

      {/* ROLE BADGE */}
      <div className="role-panel" style={{ borderColor: isDispatcher ? '#2d1f5e' : '#0f3d2e' }}>
        <div className="role-icon" style={{ background: isDispatcher ? '#1a1030' : '#0a2a1e' }}>
          {isDispatcher
            ? <ShieldCheck size={15} color="#a78bfa" />
            : <Bus size={15} color="#4ade80" />
          }
        </div>
        <div className="role-text">
          <strong>{isDispatcher ? 'Hyrje Administrative' : 'Hyrje Stafi & Operatorë'}</strong>
          <small>{isDispatcher ? 'Username + PIN — vetëm Dispatcher.' : 'ID + PIN — Shofer, Faturino ose Operator.'}</small>
        </div>
        <div className="role-arrow"><ArrowRight size={14} color="#475569" /></div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="field">
          <label>{isDispatcher ? 'Email / Username' : 'ID Përdoruesi'}</label>
          <div className="input-wrap">
            <span className="input-icon">
              {isDispatcher ? <Mail size={14} color="#475569" /> : <User size={14} color="#475569" />}
            </span>
            <input
              type={isDispatcher ? 'email' : 'text'}
              placeholder={isDispatcher ? 'dispatcher@urbani.al' : 'p.sh. shoferi_01'}
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
        </div>

        <div className="field">
          <label>{isDispatcher ? 'PIN / Fjalëkalim' : 'PIN'}</label>
          <div className="input-wrap">
            <span className="input-icon"><Lock size={14} color="#475569" /></span>
            <input
              type={showPin ? 'text' : 'password'}
              placeholder={isDispatcher ? '••••' : 'PIN i lëshuar nga dispatcher'}
              value={pin}
              onChange={e => setPin(e.target.value)}
              required
              style={{ paddingRight: '42px' }}
              autoComplete="current-password"
            />
            <button type="button" className="eye-btn" onClick={() => setShowPin(!showPin)}>
              {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <AlertCircle size={13} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="submit-btn"
          style={{
            background: loading ? '#111118'
              : isDispatcher ? 'linear-gradient(135deg,#4c1d95,#6d28d9)'
              : 'linear-gradient(135deg,#064e3b,#065f46)',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading
            ? <><span className="spinner" />Duke hyrë...</>
            : <>{isDispatcher ? 'Hyr si Dispatcher' : 'Hyr si Staff / Operator'}<ArrowRight size={14} /></>
          }
        </button>
      </form>

      {/* SUPPORT */}
      <div className="support-box">
        <Info size={13} color="#475569" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <strong>Ndihmë</strong>
          <span>{isDispatcher
            ? 'Probleme me hyrjen? Kontaktoni IT support.'
            : 'Pa PIN? Kontaktoni dispatcher-in tuaj.'
          }</span>
        </div>
      </div>

      {/* TEST ACCOUNT — visible only in dispatcher tab */}
      {isDispatcher && (
        <div className="test-account-box">
          <div className="tab-row">
            <span className="tab-label">Llogari Demo</span>
          </div>
          <div className="tab-cred-row">
            <span className="tab-key">Email</span>
            <code className="tab-val">admin@urbani.al</code>
          </div>
          <div className="tab-cred-row">
            <span className="tab-key">PIN</span>
            <code className="tab-val">1234</code>
          </div>
        </div>
      )}

    </div>
  </div>

  <style>{`
    * { box-sizing: border-box; }

    .bo-login-shell {
      min-height: 100vh;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: #0a0a0f;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
    }

    /* ── LEFT ── */
    .login-left {
      background: #0d0d18;
      border-right: 1px solid #1e1e35;
      padding: clamp(32px, 5vw, 60px);
      display: flex;
      flex-direction: column;
      gap: 40px;
      position: relative;
      overflow: hidden;
    }

    .login-left::before {
      content: '';
      position: absolute;
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 65%);
      top: -200px; left: -200px;
      pointer-events: none;
    }
    .login-left::after {
      content: '';
      position: absolute;
      width: 400px; height: 400px; border-radius: 50%;
      background: radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 65%);
      bottom: -100px; right: -100px;
      pointer-events: none;
    }

    .login-left-brand {
      display: flex; align-items: center; gap: 10px;
      position: relative; z-index: 2;
    }
    .llb-icon {
      width: 40px; height: 40px; border-radius: 11px;
      background: #1a1030; border: 1px solid #2d1f5e;
      display: flex; align-items: center; justify-content: center;
    }
    .login-left-brand span {
      font-size: 16px; font-weight: 800; color: #e2e8f0; letter-spacing: 0.01em;
    }

    .login-left-hero { position: relative; z-index: 2; }
    .llh-tag {
      display: inline-flex; align-items: center;
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; color: #a78bfa;
      background: #1a1030; border: 1px solid #2d1f5e;
      padding: 4px 12px; border-radius: 20px; margin-bottom: 16px;
    }
    .login-left-hero h2 {
      margin: 0 0 12px; font-size: clamp(22px, 3vw, 30px);
      font-weight: 800; color: #f1f5f9; line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .login-left-hero p {
      margin: 0; font-size: 13px; color: #64748b; line-height: 1.65;
    }

    .login-stat-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
      position: relative; z-index: 2;
    }
    .login-stat-card {
      background: #111118; border: 1px solid #1e1e35;
      border-radius: 14px; padding: 16px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .lsc-icon {
      width: 30px; height: 30px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 4px;
    }
    .lsc-val { font-size: 22px; font-weight: 800; line-height: 1; }
    .lsc-label { font-size: 11px; color: #475569; }

    .login-feature-list {
      display: flex; flex-direction: column; gap: 10px;
      position: relative; z-index: 2;
    }
    .lfl-row {
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; color: #64748b;
    }
    .lfl-dot {
      width: 28px; height: 28px; border-radius: 8px;
      background: #111118; border: 1px solid #1e1e35;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: #475569;
    }

    .login-left-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: auto;
      position: relative; z-index: 2;
    }
    .llf-status {
      display: flex; align-items: center; gap: 7px;
      font-size: 11px; color: #475569;
    }
    .llf-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #4ade80; box-shadow: 0 0 5px #4ade80;
    }
    .llf-ver { font-size: 11px; color: #334155; }

    /* ── RIGHT ── */
    .login-right {
      display: flex; align-items: center; justify-content: center;
      padding: clamp(24px, 5vw, 60px);
      background: #0a0a0f;
    }

    .login-card {
      width: min(100%, 440px);
      display: flex; flex-direction: column; gap: 20px;
    }

    .lc-heading h1 {
      margin: 0 0 6px; font-size: clamp(20px, 3vw, 26px);
      font-weight: 800; color: #f8fafc; letter-spacing: -0.02em;
    }
    .lc-heading p { margin: 0; font-size: 13px; color: #64748b; line-height: 1.55; }

    .mode-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .mode-btn {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 11px; border-radius: 11px;
      border: 1px solid #1e1e35; background: #0a0a0f;
      color: #64748b; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: all 0.15s;
      font-family: 'Inter', sans-serif;
    }
    .mode-btn:hover { border-color: #2d2d50; color: #94a3b8; }
    .mode-btn.active { background: #1a1030; border-color: #4c1d95; color: #c4b5fd; }

    .role-panel {
      display: flex; align-items: center; gap: 11px;
      padding: 13px 15px; border-radius: 12px;
      background: #0a0a0f; border: 1px solid;
    }
    .role-icon {
      width: 34px; height: 34px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .role-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .role-text strong { font-size: 12px; font-weight: 700; color: #e2e8f0; }
    .role-text small { font-size: 11px; color: #64748b; }
    .role-arrow { flex-shrink: 0; }

    .login-form { display: flex; flex-direction: column; gap: 14px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label {
      font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.1em; color: #475569;
    }
    .input-wrap { position: relative; }
    .input-icon {
      position: absolute; left: 12px; top: 50%;
      transform: translateY(-50%); pointer-events: none;
      display: flex; align-items: center;
    }
    .input-wrap input {
      width: 100%;
      padding: 11px 14px 11px 36px;
      border-radius: 10px;
      background: #111118; border: 1px solid #1e1e35;
      color: #f1f5f9; font-size: 13px; outline: none;
      transition: border-color 0.15s;
      font-family: 'Inter', sans-serif;
    }
    .input-wrap input::placeholder { color: #334155; }
    .input-wrap input:focus { border-color: #4c1d95; }
    .eye-btn {
      position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
      background: none; border: none; color: #475569; cursor: pointer;
      display: flex; align-items: center; transition: color 0.15s;
    }
    .eye-btn:hover { color: #94a3b8; }

    .error-box {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 13px; border-radius: 9px;
      background: #1a0f0f; border: 1px solid #3d1515;
      color: #fca5a5; font-size: 12px;
    }

    .submit-btn {
      width: 100%; padding: 13px; border: none; border-radius: 11px;
      font-size: 13px; font-weight: 700; cursor: pointer; color: #fff;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: opacity 0.15s, transform 0.15s;
      font-family: 'Inter', sans-serif;
    }
    .submit-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
    .submit-btn:disabled { cursor: not-allowed; }

    .spinner {
      width: 13px; height: 13px;
      border: 2px solid rgba(255,255,255,0.15);
      border-top-color: #fff; border-radius: 50%;
      animation: spin 0.7s linear infinite; display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .support-box {
      display: flex; align-items: flex-start; gap: 9px;
      padding: 12px 14px; border-radius: 10px;
      background: #111118; border: 1px solid #1e1e2e;
    }
    .support-box > div { display: flex; flex-direction: column; gap: 2px; }
    .support-box strong { font-size: 12px; font-weight: 700; color: #cbd5e1; }
    .support-box span { font-size: 11px; color: #64748b; line-height: 1.5; }

    .test-account-box {
      padding: 12px 14px; border-radius: 10px;
      background: #0c1a0f; border: 1px dashed #1a3d24;
      display: flex; flex-direction: column; gap: 8px;
    }
    .tab-row {
      display: flex; align-items: center; gap: 6px; margin-bottom: 2px;
    }
    .tab-label {
      font-size: 10px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.1em; color: #4ade80;
    }
    .tab-cred-row {
      display: flex; align-items: center; justify-content: space-between;
    }
    .tab-key { font-size: 11px; color: #475569; }
    .tab-val {
      font-size: 12px; font-weight: 700; color: #86efac;
      background: #0f2a17; border: 1px solid #1a3d24;
      padding: 2px 9px; border-radius: 6px;
      font-family: 'Courier New', monospace; letter-spacing: 0.04em;
    }


    /* RESPONSIVE */
    @media (max-width: 860px) {
      .bo-login-shell { grid-template-columns: 1fr; }
      .login-left { display: none; }
      .login-right { padding: clamp(32px, 8vw, 60px); }
    }

    @media (max-width: 600px) {
      .login-card { width: 100%; }
      .login-right { padding: 24px 16px; }
      .mode-toggle { grid-template-columns: 1fr; }
    }
  `}</style>
</div>
  );
}
