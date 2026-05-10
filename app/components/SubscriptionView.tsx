'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Camera } from 'lucide-react';
import useStore from '../store/useStore';

const W = 1240;
const H = 735;

export default function SubscriptionView() {
  const setView = useStore((s: any) => s.setView);
  const language = useStore((s: any) => s.language);
  const user = useStore((s: any) => s.user);

  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Responsive scaling
  useEffect(() => {
    const fit = () => {
      const wrap = wrapRef.current;
      const card = cardRef.current;
      if (!wrap || !card) return;
      const s = Math.min(1, wrap.offsetWidth / W);
      card.style.transform = `scale(${s})`;
      card.style.transformOrigin = 'top left';
      wrap.style.height = `${H * s}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Dynamic Data Variables
  const firstName = user?.name?.split(' ')[0] ?? '';
  const lastName = user?.name?.split(' ').slice(1).join(' ') ?? '';
  const idNumber = '';

  const serialNo = '018494';
  const zoneNumber = '6';
  const city = 'Bashkia Tiranë';
  const zoneName = 'Transporti Urban';
  const monthYear = 'Qershor 2024';
  const passType = 'Abone e Përgjithshme';
  const validity = '01.06.2024 - 30.06.2024';
  const price = '1600';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: '#fff' }}>

      {/* Nav */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <button onClick={() => setView('profile')} style={{ color: '#fff', padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
          {language === 'al' ? 'Abonimi Im' : 'My Subscription'}
        </h1>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div ref={wrapRef} style={{ width: '100%', maxWidth: W, position: 'relative' }}>

          {/* Scaled Card */}
          <div
            ref={cardRef}
            style={{
              width: W, height: H,
              position: 'relative',
              borderRadius: 34,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              fontFamily: 'Georgia, serif',
              // The NEW image background
              backgroundImage: 'url("/abone1.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#f8f5f1' // fallback
            }}
          >
            {/* Header Text */}
            <div style={{ position: 'absolute', top: 15, width: '100%', textAlign: 'center', color: '#162544', lineHeight: 1.2 }}>
              <div style={{ fontSize: 28, letterSpacing: 4, fontWeight: 700 }}>REPUBLIKA E SHQIPËRISË</div>
              <div style={{ marginTop: 8, fontSize: 24, letterSpacing: 2 }}>MINISTRIA E FINANCAVE</div>
              <div style={{ fontSize: 21, letterSpacing: 1 }}>DREJTORIA E PËRGJITHSHME E TATIMEVE</div>
            </div>

            {/* Left Vertical Number */}
            <div style={{ position: 'absolute', left: -70, top: 370, transform: 'rotate(-90deg)', color: '#f38a1a', fontSize: 40, letterSpacing: 4, fontWeight: 600 }}>
              Nr. {serialNo}
            </div>

            {/* Zone Number Box */}
            <div style={{ position: 'absolute', left: 110, top: 210, width: 215, height: 205, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 170, lineHeight: 1, fontWeight: 700, color: '#1a2747' }}>
                {zoneNumber}
              </div>
            </div>

            {/* Main Info (Name, Surname) */}
            <div style={{ position: 'absolute', left: 330, top: 200, color: '#172544' }}>
              <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1 }}>{city}</div>
              <div style={{ fontSize: 25, marginTop: 2 }}>{zoneName}</div>

              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 22, fontFamily: 'Arial, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ minWidth: 50, fontWeight: 600 }}>Emër:</span>
                  <div style={{ borderBottom: '2px dotted #666', width: 470, fontSize: 26, fontWeight: 800, paddingLeft: 10 }}>{firstName}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ minWidth: 80, fontWeight: 600 }}>Mbiemër:</span>
                  <div style={{ borderBottom: '2px dotted #666', width: 440, fontSize: 26, fontWeight: 800, paddingLeft: 10 }}>{lastName}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ minWidth: 80, fontWeight: 600 }}>ID / NIPT:</span>
                  <div style={{ borderBottom: '2px dotted #666', width: 440, fontSize: 24, fontWeight: 800, paddingLeft: 10 }}>{idNumber}</div>
                </div>
              </div>
            </div>

            {/* Right Panel Texts -> Photo Upload Box */}
            <div style={{ position: 'absolute', right: 77, top: 217, width: 280, height: 300, padding: 0, overflow: 'hidden', borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)' }}>
              {photo ? (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img src={photo} alt="Uploaded photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => setPhoto(null)}
                    style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, backdropFilter: 'blur(4px)', transition: 'all 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'transparent', transition: 'all 0.2s ease' }}>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '30px 40px', backgroundColor: '#fff', border: '2px dashed #d56e10', borderRadius: 20, color: '#d56e10', boxShadow: '0 4px 14px rgba(213, 110, 16, 0.15)', transition: 'all 0.2s ease' }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(213, 110, 16, 0.25)'; e.currentTarget.style.backgroundColor = '#fff9f5'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(213, 110, 16, 0.15)'; e.currentTarget.style.backgroundColor = '#fff'; }}
                  >
                    <div style={{ background: 'rgba(213, 110, 16, 0.1)', padding: 14, borderRadius: '50%' }}>
                      <Camera size={32} color="#d56e10" strokeWidth={1.5} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: 0.5, textAlign: 'center' }}>
                      Shto Fotografi
                    </div>
                    <div style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
                      Kliko për të ngarkuar
                    </div>
                  </div>
                </label>
              )}
            </div>

            {/* Bottom Main Text */}
            <div style={{ position: 'absolute', left: 120, bottom: 35, color: '#172544' }}>
              <div style={{ fontSize: 60, lineHeight: '80px', fontWeight: 700 }}>{monthYear}</div>
              <div style={{ fontSize: 75, lineHeight: '90px', fontWeight: 700 }}>{passType}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 10 }}>
                <span style={{ fontSize: 75, fontWeight: 700, lineHeight: 1 }}>{price}</span>
                <span style={{ fontSize: 54 }}>Lekë</span>
              </div>
            </div>

            {/* Bottom Right Number */}
            <div style={{ position: 'absolute', right: 100, bottom: 45, display: 'flex', alignItems: 'center', gap: 30 }}>
              <span style={{ fontSize: 50, color: '#d56e10', fontWeight: 600 }}>Nr.</span>
              <span style={{ fontSize: 50, letterSpacing: 4, color: '#f38a1a', fontWeight: 700 }}>{serialNo}</span>
            </div>

          </div>
        </div>

        <p style={{ marginTop: 28, fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: 480, lineHeight: 1.6 }}>
          {language === 'al' ? 'Kopja digjitale zyrtare e abonesë suaj.' : 'Official digital copy of your transit pass.'}
        </p>

      </div>
    </div>
  );
}