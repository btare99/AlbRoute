'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Camera, CheckCircle2 } from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../store/translations';

const W = 1240;
const H = 735;

export default function SubscriptionGetPassView() {
  const setView = useStore((s: any) => s.setView);
  const language = useStore((s: any) => s.language);
  const user = useStore((s: any) => s.user);
  const updateProfile = useStore((s: any) => s.updateProfile);
  const activePackage = useStore((s: any) => s.checkoutPackage);
  const t = translations[language as keyof typeof translations] || translations.al;

  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // If no package is selected, go back to packages view (fail-safe)
  if (!activePackage) {
    setView('packages');
    return null;
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleGenerate = () => {
    if (!photo) return;
    setIsProcessing(true);
    setTimeout(() => {
      // Save photo to user profile
      updateProfile({ subscriptionPhoto: photo });
      setIsProcessing(false);
      setView('subscription'); // Send to final digital pass
    }, 1500);
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
  const idNumber = user?.idNumber || '';

  // Dynamic Dates
  const now = new Date();
  const zoneNumber = (now.getMonth() + 1).toString(); // Current month number
  const monthNamesAl = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
  const monthYear = `${monthNamesAl[now.getMonth()]} ${now.getFullYear()}`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const validity = `01.${zoneNumber.padStart(2, '0')}.${now.getFullYear()} - ${lastDay}.${zoneNumber.padStart(2, '0')}.${now.getFullYear()}`;

  const serialNo = '018494';
  const city = 'Bashkia Tiranë';
  const zoneName = 'Transporti Urban';
  const passType = activePackage?.name || 'Abone e Përgjithshme';
  const price = activePackage?.price || '1600';

  if (isProcessing) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: '#fff', padding: 20, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'scaleIn 0.5s cubic-bezier(0.25, 1, 0.5, 1)' }}>
          <CheckCircle2 size={40} color="#10b981" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Po Gjenerohet...</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, maxWidth: 300 }}>
          Ju lutem prisni pak sekonda.
        </p>
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: '#fff' }}>

      {/* Header */}
      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#10b981' }}>
          {t.get_pass_title || 'Merr Abonenë Tënde'}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
          {t.get_pass_subtitle || 'Ju lutem ngarkoni një foto për të gjeneruar abonenë.'}
        </p>
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
              backgroundImage: `url(${activePackage?.id === 'student' ? '"/abone-student.png"' : '"/abone1.png"'})`,
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
                <div style={{ width: '100%', height: '100%' }}>
                  <img src={photo} alt="Uploaded photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <Camera size={64} color="rgba(255,255,255,0.5)" />
                </div>
              )}
            </div>

            {/* Bottom Main Text */}
            <div style={{ position: 'absolute', left: 120, bottom: 35, color: '#172544' }}>
              <div style={{ fontSize: 60, lineHeight: '80px', fontWeight: 700 }}>{monthYear}</div>
              <div style={{ fontSize: 75, lineHeight: '90px', fontWeight: 700 }}>{passType}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 10 }}>
                <span style={{ fontSize: 75, fontWeight: 700, lineHeight: 1 }}>{price}</span>
                {price !== 'Falas' && price !== 'Free' && price !== 'Gratis' && (
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

        {/* Generate Controls! */}
        <div style={{ marginTop: 30, width: '100%', maxWidth: 400 }}>
          
          <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
            
            {/* Photo Picker */}
            <label style={{ 
              width: 80, 
              height: 80, 
              flexShrink: 0,
              background: photo ? 'transparent' : 'rgba(255,255,255,0.05)', 
              border: `2px dashed ${photo ? '#10b981' : '#f59e0b'}`, 
              borderRadius: 16, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              {photo ? (
                <>
                  <img src={photo} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s ease' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                    <Camera size={24} color="#fff" />
                  </div>
                </>
              ) : (
                <>
                  <Camera size={28} color="#f59e0b" style={{ marginBottom: 4 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>Foto</span>
                </>
              )}
            </label>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!photo}
              style={{ 
                flex: 1,
                background: photo ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.05)', 
                color: photo ? '#fff' : 'rgba(255,255,255,0.3)', 
                border: 'none', 
                borderRadius: 16, 
                fontSize: 16, 
                fontWeight: 700, 
                cursor: photo ? 'pointer' : 'not-allowed', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 8, 
                boxShadow: photo ? '0 8px 24px rgba(16, 185, 129, 0.25)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {t.generate_pass_btn || 'Gjenero Abonenë'}
            </button>
          </div>

          {!photo && (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 16, fontWeight: 500 }}>
              {t.upload_photo_req || 'Fotoja është e detyrueshme për të vazhduar.'}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
