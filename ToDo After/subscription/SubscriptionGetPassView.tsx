'use client';
import { useEffect, useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBackOutline, cameraOutline, checkmarkCircleOutline, personCircleOutline, arrowForwardOutline } from 'ionicons/icons';
import useStore from '../../app/store/useStore';
import { translations } from '../../app/store/translations';

// Local fallback FacePhotoUpload component (was imported from ../profile/FacePhotoUpload which may be missing)
type FacePhotoUploadProps = {
  onPhotoDetected: (data: string) => void;
  currentPhoto: string | null;
};

function FacePhotoUpload({ onPhotoDetected }: FacePhotoUploadProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onPhotoDetected(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'transparent',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 700
        }}
      >
        Ngarko Foto (ose Përdor Kamerën)
      </button>
    </div>
  );
}

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
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedLine, setSelectedLine] = useState('');
  const [isLinePickerOpen, setIsLinePickerOpen] = useState(false);
  const [lineSearch, setLineSearch] = useState('');

  const BUS_LINES = [
    "L1: Porcelan - Qendër",
    "L1A: Allias - Selitë",
    "L1B: Allias - Kodra e Diellit",
    "L2: Tirana e Re",
    "L3: Kombinat - Kinostudio",
    "L3B: Kashar - Qendër",
    "L4: Qendër - City Park",
    "L5A: Uzina Autotraktori",
    "L5B: Institut",
    "L6: Laprakë",
    "L7: Unaza",
    "L8: Sauk",
    "L9: Kamëz",
    "L10: Shkozë",
    "L11: Qendër - Linjë 15",
    "L12: Sharre",
    "L13: Tufinë",
    "L14: Qendër - Kashar",
    "L15: Qendër - Vorë",
    "L16: Qendër - Laprakë"
  ].sort();

  const isStudent = activePackage?.id === 'student';

  // If no package is selected, go back to packages view (fail-safe)
  useEffect(() => {
    if (!activePackage) setView('packages');
  }, [activePackage, setView]);

  if (!activePackage) return null;

  const handlePhotoDetected = (photoData: string) => {
    setPhoto(photoData);
  };

  const handleGenerate = () => {
    if (!photo) return;
    if (activePackage.id === 'single_line' && !selectedLine) return;
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      // Save photo and line to user profile
      const updateData: any = {};
      if (activePackage.id === 'single_line') {
        updateData.selectedLine = selectedLine;
      }
      
      const existingSubs = user?.subscriptions || [];
      updateData.subscriptions = [...existingSubs, {
        ...activePackage,
        photo: photo,
        purchasedAt: new Date().toISOString()
      }];

      updateProfile(updateData);
      // Clear checkout package so it doesn't linger
      useStore.getState().setCheckoutPackage(null);
      setIsProcessing(false);
      setIsSuccess(true);
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
          <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 40, color: '#10b981' }} />
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

  if (isSuccess) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg-dark)', 
        color: '#fff',
        padding: '40px',
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease'
      }}>
        <div style={{ 
          width: 100, height: 100, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32,
          border: '1px solid rgba(16, 185, 129, 0.3)',
          animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: 48, color: '#10b981' }} />
        </div>
        
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>U gjenerua me sukses!</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, lineHeight: 1.6, maxWidth: 300, marginBottom: 40 }}>
          Abonja juaj dixhitale është gati dhe mund ta gjeni në profilin tuaj në çdo kohë.
        </p>

        <button
          onClick={() => setView('subscription')}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 18,
            padding: '20px 40px',
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 12px 32px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <IonIcon icon={personCircleOutline} style={{ fontSize: 20, color: '#fff' }} />
          Shko tek Abonimi Im
        </button>

        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes popIn { 
            0% { opacity: 0; transform: scale(0.5); } 
            100% { opacity: 1; transform: scale(1); } 
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
              backgroundImage: `url(${activePackage?.id === 'student' ? '/abone-studenti.png' :
                activePackage?.id === 'tourist' ? '/abone-turistike.JPEG' :
                  activePackage?.id === 'single_line' ? '/abone-linje.JPEG' :
                    '/abone-gjenerale.PNG'
                })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#f8f5f1' // fallback
            }}
          >
            {/* Header Text */}
            <div style={{ position: 'absolute', top: 5, width: '100%', textAlign: 'center', color: '#162544', lineHeight: 1.2 }}>
              <div style={{ fontSize: 28, letterSpacing: 4, fontWeight: 700 }}>REPUBLIKA E SHQIPËRISË</div>
              <div style={{ marginTop: 8, fontSize: 24, letterSpacing: 2 }}>MINISTRIA E FINANCAVE</div>
              <div style={{ fontSize: 21, letterSpacing: 1 }}>DREJTORIA E PËRGJITHSHME E TATIMEVE</div>
            </div>

            {/* Left Vertical Number */}
            <div style={{ position: 'absolute', left: -70, top: 370, transform: 'rotate(-90deg)', color: '#f38a1a', fontSize: 40, letterSpacing: 4, fontWeight: 600 }}>
              Nr. {serialNo}
            </div>

            {/* Zone Number Box */}
            <div style={{ position: 'absolute', left: 100, top: 180, width: 215, height: 205, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 170, lineHeight: 1, fontWeight: 700, color: '#1a2747' }}>
                {zoneNumber}
              </div>
            </div>

            {/* Main Info (Name, Surname) */}
            <div style={{ position: 'absolute', left: 330, top: 190, color: isStudent ? '#0c356a' : '#172544' }}>
              <div style={{ fontSize: 45, fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>
                {isStudent ? 'ABONE STUDENTI' : (activePackage?.id === 'single_line' ? 'ABONE LINJE' : city)}
              </div>
              <div style={{ fontSize: 25, marginTop: 2, fontWeight: 600, color: activePackage?.id === 'single_line' ? '#c2410c' : 'inherit' }}>
                {activePackage?.id === 'single_line' ? (user?.selectedLine || 'Linja e pazgjedhur') : (!isStudent ? zoneName : '')}
              </div>

              <div style={{ marginTop: 5, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 20, fontFamily: 'Arial, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ minWidth: 70, fontWeight: 600 }}>{isStudent ? 'Emër:' : 'Emër:'}</span>
                  <div style={{ borderBottom: '2px dotted #666', width: 450, fontSize: 24, fontWeight: 800, paddingLeft: 10 }}>{firstName}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ minWidth: 90, fontWeight: 600 }}>{isStudent ? 'Mbiemër:' : 'Mbiemër:'}</span>
                  <div style={{ borderBottom: '2px dotted #666', width: 430, fontSize: 24, fontWeight: 800, paddingLeft: 10 }}>{lastName}</div>
                </div>
                {isStudent ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ minWidth: 100, fontWeight: 600 }}>Universiteti:</span>
                      <div style={{ borderBottom: '2px dotted #666', width: 420, fontSize: 20, fontWeight: 800, paddingLeft: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.university || 'UT'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                      <span style={{ minWidth: 120, fontWeight: 600 }}>Kodi i Studentit:</span>
                      <div style={{ borderBottom: '2px dotted #666', width: 400, fontSize: 22, fontWeight: 800, paddingLeft: 10 }}>{user?.idNumber || 'S000000X'}</div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ minWidth: 80, fontWeight: 600 }}>ID / NIPT:</span>
                    <div style={{ borderBottom: '2px dotted #666', width: 440, fontSize: 24, fontWeight: 800, paddingLeft: 10 }}>{idNumber}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel -> Photo Display */}
            <div style={{ position: 'absolute', right: 80, top: 210, width: 280, height: 300, overflow: 'hidden', borderRadius: 18, border: '1px solid rgba(255, 255, 255, 0.5)', background: 'rgba(255, 255, 255, 0.1)' }}>
              {photo ? (
                <img src={photo} alt="Pass photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IonIcon icon={personCircleOutline} style={{ fontSize: 64, color: 'rgba(255,255,255,0.2)' }} />
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

        {/* Generate Controls with Face Detection */}
        <div style={{ 
          marginTop: 30, 
          width: '100%', 
          maxWidth: 400,
          paddingBottom: '140px' // Extra space for mobile scroll
        }}>
          
          {activePackage?.id === 'single_line' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, position: 'relative' }} id="line-picker-container">
              <label style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, paddingLeft: 4 }}>Zgjidhni Linjën</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  placeholder="Kërko linjën (p.sh. L1, Unaza...)"
                  value={selectedLine || lineSearch}
                  onChange={(e) => {
                    setLineSearch(e.target.value);
                    setSelectedLine(e.target.value);
                    setIsLinePickerOpen(true);
                  }}
                  onFocus={() => setIsLinePickerOpen(true)}
                  style={{ 
                    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: 16, padding: '16px', color: '#fff', fontSize: 16, outline: 'none'
                  }}
                />
                <IonIcon icon={arrowForwardOutline} style={{ fontSize: 18, position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none' }} />
              </div>

              {isLinePickerOpen && (lineSearch || selectedLine) && (
                <div style={{ 
                  position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0, 
                  background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(30px)', 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, 
                  boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', zIndex: 100, 
                  maxHeight: 200, overflowY: 'auto', padding: 6,
                  animation: 'fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {BUS_LINES.filter(l => l.toLowerCase().includes((lineSearch || selectedLine).toLowerCase())).map((line, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLine(line);
                        setLineSearch('');
                        setIsLinePickerOpen(false);
                      }}
                      style={{ 
                        width: '100%', padding: '12px 14px', textAlign: 'left', 
                        background: selectedLine === line ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                        border: 'none', borderRadius: 10, color: '#fff', 
                        fontSize: 14, fontWeight: selectedLine === line ? 700 : 500, cursor: 'pointer'
                      }}
                    >
                      {line}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <FacePhotoUpload onPhotoDetected={handlePhotoDetected} currentPhoto={photo} />

          <button
            onClick={handleGenerate}
            disabled={!photo || isProcessing}
            style={{
              width: '100%',
              marginTop: '20px',
              background: photo ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.05)',
              color: photo ? '#fff' : 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: 16,
              padding: '18px',
              fontSize: 16,
              fontWeight: 800,
              cursor: photo ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: photo ? '0 8px 24px rgba(16, 185, 129, 0.25)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {isProcessing ? 'Gjenerimi...' : (t.generate_pass_btn || 'Gjenero Abonenë')}
          </button>
        </div>

      </div>
    </div>
  );
}
