'use client';
import { useEffect, useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBackOutline } from 'ionicons/icons';
import useStore from '../../app/store/useStore';
import { translations } from '../../app/store/translations';

const W = 1240;
const H = 735;

const PASS_TYPES = [
  { id: 'general', name: 'Abone e Përgjithshme', price: '1600', img: '/abone1.png' },
  { id: 'student', name: 'Abone Studenti', price: 'Falas', img: '/abone-student.png' },
  { id: 'single_line', name: 'Abone Linje', price: '900', img: '/abone-single.png' },
];

export default function PassesView() {
  const setView = useStore((s: any) => s.setView);
  const language = useStore((s: any) => s.language);
  const t = translations[language] || translations.al;
  const user = useStore((s: any) => s.user);

  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState(PASS_TYPES[0].id);
  const activePass = PASS_TYPES.find(p => p.id === activeTab) || PASS_TYPES[0];
  const userSubForPass = user?.subscriptions?.find((sub: any) => sub.id === activePass.id);
  const photoToShow = userSubForPass?.photo || null;

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
  }, [activeTab]); // re-run if tabs change just in case

  // Dynamic Dates
  const now = new Date();
  const zoneNumber = (now.getMonth() + 1).toString(); // Current month number
  const monthNamesAl = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
  const monthYear = `${monthNamesAl[now.getMonth()]} ${now.getFullYear()}`;

  const firstName = user?.name?.split(' ')[0] ?? 'Lulzim';
  const lastName = user?.name?.split(' ').slice(1).join(' ') ?? 'Basha';
  const idNumber = user?.idNumber || 'J987654321A';

  const serialNo = '018494';
  const city = 'Bashkia Tiranë';
  const zoneName = 'Transporti Urban';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: '#fff' }}>

      {/* Nav */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <button onClick={() => setView('profile')} style={{ color: '#fff', padding: 8, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <IonIcon icon={chevronBackOutline} style={{ fontSize: 20, color: '#fff' }} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
          {t.sub_passes_catalog}
        </h1>
      </div>

      {/* Filters / Tabs */}
      <div style={{ padding: '20px 20px 0 20px', display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {PASS_TYPES.map((pass) => (
          <button
            key={pass.id}
            onClick={() => setActiveTab(pass.id)}
            style={{
              padding: '12px 20px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: activeTab === pass.id ? '#10b981' : 'rgba(255,255,255,0.1)',
              background: activeTab === pass.id ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
              color: activeTab === pass.id ? '#10b981' : 'rgba(255,255,255,0.6)',
              fontWeight: 700,
              fontSize: 14,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {pass.name}
          </button>
        ))}
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
              backgroundImage: `url("${activePass.img}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#f8f5f1',
              transition: 'background-image 0.4s ease-in-out'
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

            {/* Photo Placeholder */}
            <div style={{ position: 'absolute', right: 77, top: 217, width: 280, height: 300, padding: 0, overflow: 'hidden', borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)' }}>
              {photoToShow ? (
                <div style={{ width: '100%', height: '100%' }}>
                  <img src={photoToShow} alt="Uploaded photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(0,0,0,0.3)', letterSpacing: 2 }}>FOTO</span>
                </div>
              )}
            </div>

            {/* Bottom Main Text */}
            <div style={{ position: 'absolute', left: 120, bottom: 35, color: '#172544' }}>
              <div style={{ fontSize: 60, lineHeight: '80px', fontWeight: 700 }}>{monthYear}</div>
              <div style={{ fontSize: 75, lineHeight: '90px', fontWeight: 700 }}>{activePass.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 10 }}>
                <span style={{ fontSize: 75, fontWeight: 700, lineHeight: 1 }}>{activePass.price}</span>
                {activePass.price !== 'Falas' && (
                  <span style={{ fontSize: 54 }}>Lekë</span>
                )}
              </div>
            </div>

            {/* Bottom Right Number */}
            <div style={{ position: 'absolute', right: 100, bottom: 45, display: 'flex', alignItems: 'center', gap: 30 }}>
              <span style={{ fontSize: 50, color: '#d56e10', fontWeight: 600 }}>Nr.</span>
              <span style={{ fontSize: 50, letterSpacing: 4, color: '#f38a1a', fontWeight: 700 }}>{user?.serialNumber || serialNo}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
