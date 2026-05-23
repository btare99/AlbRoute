'use client';
import { useEffect, useRef, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { ticketOutline, chevronBackOutline, personCircleOutline } from 'ionicons/icons';
import useStore from '../../store/useStore';
import { translations } from '../../store/translations';

const W = 1240;
const H = 735;

export default function SubscriptionView() {
  const setView = useStore((s: any) => s.setView);
  const language = useStore((s: any) => s.language);
  const user = useStore((s: any) => s.user);
  const t = translations[language] || translations.al;

  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // Only use actual subscriptions from the user profile for the 'My Subscription' view
  const hasSubscription = user?.subscriptions && user.subscriptions.length > 0;
  const activePackage = hasSubscription ? user.subscriptions[user.subscriptions.length - 1] : null;

  // If NO active package from DB, show empty state
  if (!activePackage) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: '#fff' }}>

        {/* Nav */}
        <div style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          background: 'var(--bg-dark)',
          flexShrink: 0
        }}>
          <button
            onClick={() => setView('profile')}
            style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <IonIcon icon={chevronBackOutline} style={{ fontSize: 20, color: '#fff' }} />
          </button>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>
              {t.sub_my_subscription}
            </h1>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
          <IonIcon icon={ticketOutline} style={{ fontSize: '48px', marginBottom: 16, color: 'rgba(255,255,255,0.65)' }} />
          <p>{t.sub_no_active_found || 'Nuk keni asnjë abonim aktiv.'}</p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] ?? '';
  const lastName = user?.name?.split(' ').slice(1).join(' ') ?? '';
  const idNumber = user?.idNumber || '';

  // Dynamic Dates
  const now = new Date();
  const zoneNumber = (now.getMonth() + 1).toString(); // Current month number
  const monthNamesAl = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthYear = `${monthNamesAl[now.getMonth()]} ${now.getFullYear()}`;
  // Dynamic Validity based on package
  const isTourist = activePackage?.id === 'tourist';
  const isStudent = activePackage?.id === 'student';
  const expirationDays = isTourist ? 7 : 30;

  const lastDayOfRange = isTourist
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).getDate()
    : new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const monthOfExpiry = isTourist
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).getMonth() + 1
    : now.getMonth() + 1;

  const validity = isTourist
    ? `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} - ${lastDayOfRange.toString().padStart(2, '0')}.${monthOfExpiry.toString().padStart(2, '0')}.${now.getFullYear()}`
    : `01.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} - ${lastDayOfRange.toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;

  const formattedDate = language === 'al'
    ? `${now.getDate()} ${monthNamesAl[now.getMonth()].toLowerCase()} ${now.getFullYear()}`
    : `${now.getDate()} ${monthNamesEn[now.getMonth()]} ${now.getFullYear()}`;

  const serialNo = '018494';
  const city = 'Bashkia Tiranë';
  const zoneName = 'Transporti Urban';
  const passType = activePackage?.name || 'Abone e Përgjithshme';
  const price = activePackage?.price || '1600';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', color: '#fff' }}>

      {/* Nav */}
      <div style={{
        padding: '24px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        background: 'var(--bg-dark)',
        flexShrink: 0
      }}>
        <button
          onClick={() => setView('profile')}
          style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff', transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <IonIcon icon={chevronBackOutline} style={{ fontSize: 20, color: '#fff' }} />
        </button>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#fff' }}>
            {t.sub_my_subscription}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0, marginTop: '2px' }}>
            {t.sub_digital_details}
          </p>
        </div>
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
            <div style={{ position: 'absolute', left: 100, top: 175, width: 215, height: 205, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

            {/* Right Panel Texts -> Photo Upload Box */}
            <div style={{ position: 'absolute', right: 79, top: 208, width: 280, height: 300, padding: 0, overflow: 'hidden', borderRadius: 18, backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)' }}>
              {activePackage?.photo ? (
                <div style={{ width: '100%', height: '100%' }}>
                  <img src={activePackage.photo} alt="Uploaded photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0' }}>
                  <IonIcon icon={personCircleOutline} style={{ fontSize: 64, color: '#94a3b8' }} />
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

        <p style={{ marginTop: 28, fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: 480, lineHeight: 1.6 }}>
          {t.sub_official_copy}
        </p>

        <div style={{ marginTop: 12, marginBottom: 20, padding: '10px 20px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 100, border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
            {t.sub_expires_in}
          </span>
          <span style={{ fontSize: 14, color: '#f59e0b', fontWeight: 700 }}>{expirationDays} {t.sub_days}</span>
        </div>

      </div>
    </div>
  );
}