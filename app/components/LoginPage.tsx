'use client';
import { useState } from 'react';
import { Bus, Eye, EyeOff, ArrowRight, MapPin } from 'lucide-react';
import useStore from '../store/useStore';

const MOCK_USERS = [
  { id: '1', name: 'Andi Krasniqi', email: 'andi@test.al', password: 'password', savedLocations: { home: 'Blloku', work: 'Sheshi Skënderbej' }, travelHistory: [] },
  { id: '2', name: 'Era Hoxha', email: 'era@test.al', password: 'password', savedLocations: { home: 'Kombinat', work: 'Piramida' }, travelHistory: [] },
];

export default function LoginPage() {
  const [mode, setMode] = useState<'login'|'register'|'staff'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffId, setStaffId] = useState('');
  const [personalId, setPersonalId] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useStore((state: any) => state.login);
  const loginAsStaff = useStore((state: any) => state.loginAsStaff);
  const addNotification = useStore((state: any) => state.addNotification);
  const adminDrivers = useStore((state: any) => state.adminDrivers);
  const adminInspectors = useStore((state: any) => state.adminInspectors);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    if (mode === 'login') {
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);
      if (user) {
        login({ id: user.id, name: user.name, email: user.email, savedLocations: user.savedLocations, travelHistory: user.travelHistory }, 'jwt-token-mock');
        addNotification(`Mirë se erdhe, ${user.name}! 🚌`, 'success');
      } else {
        setError('Email ose fjalëkalimi gabim. Provoni: andi@test.al / password');
      }
    } else if (mode === 'staff') {
      // Find in drivers or inspectors
      const trimmedStaffId = staffId.trim();
      const trimmedPersonalId = personalId.trim();
      
      let foundStaff = adminDrivers.find((d: any) => d.id === trimmedStaffId && d.personalId === trimmedPersonalId);
      let isDriver = true;
      
      // Thjeshtim i kredencialeve për testim
      if (trimmedStaffId === 'stafi' && trimmedPersonalId === '123') {
        foundStaff = adminDrivers[0];
        isDriver = true;
      } else if (!foundStaff) {
        foundStaff = adminInspectors.find((i: any) => i.id === trimmedStaffId && i.personalId === trimmedPersonalId);
        isDriver = false;
      }

      if (foundStaff) {
        loginAsStaff({ ...foundStaff, type: isDriver ? 'driver' : 'inspector' });
        addNotification(`Mirë se erdhe, ${foundStaff.name}! 👨‍✈️`, 'success');
      } else {
        setError('Kredencialet e stafit nuk janë të sakta. Kontaktoni administratorin.');
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Plotëso të gjitha fushat.');
      } else {
        login({ id: Date.now().toString(), name, email, savedLocations: { home: '', work: '' }, travelHistory: [] }, 'jwt-token-mock');
        addNotification(`Llogaria u krijua me sukses, ${name}! 🎉`, 'success');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', background:'radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.1) 0%, transparent 60%), var(--bg-dark)' }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'80px', height:'80px', borderRadius:'22px', marginBottom:'16px', overflow:'hidden', background:'rgba(255,255,255,0.05)', border:'1.5px solid var(--border)' }}>
            <img src="/logo-Urban.png" alt="Urban Logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <h1 style={{ fontSize:'32px', fontWeight:'900', marginBottom:'6px', background:'linear-gradient(135deg, #fff, rgba(255,255,255,0.6))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>AlbRoute</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'14px', letterSpacing:'0.02em' }}>Transporti Urban i Tiranës</p>
        </div>

        <div className="card" style={{ padding:'32px' }}>
          {/* Tabs */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'4px', marginBottom:'28px' }}>
            {(['login','register', 'staff'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{ flex:1, padding:'10px', borderRadius:'8px', fontSize:'14px', fontWeight:'600', transition:'var(--transition)', background: mode===m ? 'var(--primary)' : 'transparent', color: mode===m ? '#fff' : 'var(--text-muted)' }}>
                {m === 'login' ? 'Hyr' : m === 'register' ? 'Regjistrohu' : 'Stafi'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {mode === 'staff' ? (
              <>
                <div>
                  <label className="label">ID e Stafit (psh. d_L1_0)</label>
                  <input className="input-field" type="text" placeholder="ID e lëshuar nga admini" value={staffId} onChange={e=>setStaffId(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Numri Personal (Fjalëkalimi)</label>
                  <div style={{ position:'relative' }}>
                    <input className="input-field" type={showPass?'text':'password'} placeholder="IXXXXXXXXX" value={personalId} onChange={e=>setPersonalId(e.target.value)} required style={{ paddingRight:'44px' }} />
                    <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}>
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {mode === 'register' && (
                  <div>
                    <label className="label">Emri i plotë</label>
                    <input className="input-field" type="text" placeholder="p.sh. Andi Krasniqi" value={name} onChange={e=>setName(e.target.value)} required />
                  </div>
                )}
                <div>
                  <label className="label">Email</label>
                  <input className="input-field" type="email" placeholder="email@example.al" value={email} onChange={e=>setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="label">Fjalëkalimi</label>
                  <div style={{ position:'relative' }}>
                    <input className="input-field" type={showPass?'text':'password'} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required style={{ paddingRight:'44px' }} />
                    <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}>
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'8px', padding:'12px', fontSize:'13px', color:'var(--danger)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width:'100%', padding:'13px', marginTop:'4px' }} disabled={loading}>
              {loading ? <span className="animate-spin" style={{ display:'inline-block', width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%' }}></span>
               : <>{mode === 'login' ? 'Hyr në llogari' : mode === 'register' ? 'Krijo llogarinë' : 'Hyr si Staf'} <ArrowRight size={16}/></>}
            </button>
          </form>

          {mode === 'login' && (
            <div style={{ marginTop:'20px', padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', border:'1px solid var(--border)' }}>
              <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px', fontWeight:'600' }}>LLOGARITË E TESTIMIT (Përdorues):</p>
              <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>📧 andi@test.al &nbsp;|&nbsp; 🔑 password</p>
            </div>
          )}
          {mode === 'staff' && adminDrivers[0] && (
            <div style={{ marginTop:'20px', padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', border:'1px solid var(--border)' }}>
              <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px', fontWeight:'600' }}>LLOGARITË E TESTIMIT (Staf):</p>
              <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>🆔 stafi &nbsp;|&nbsp; 🔑 123</p>
              <p style={{ fontSize:'11px', color:'var(--text-dim)', marginTop:'4px' }}>(Kredencialet reale të mjetit: {adminDrivers[0].id} / {adminDrivers[0].personalId})</p>
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', marginTop:'20px', fontSize:'12px', color:'var(--text-dim)' }}>
          <MapPin size={12} style={{ display:'inline', marginRight:'4px' }} />
          Tirana, Shqipëri &nbsp;·&nbsp; Të dhëna të simuluara për demonstrim
        </p>
      </div>
    </div>
  );
}
