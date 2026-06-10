'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { safeSignOut } from '../../lib/auth-helpers';
import useStore from '../../store/useStore';
import {
  logOutOutline, chevronForwardOutline, notificationsOutline, shareOutline,
  helpCircleOutline, trashOutline, alertOutline, closeOutline, mailOutline, callOutline,
  globeOutline, checkmarkCircleOutline, logInOutline, arrowBackOutline, locationOutline,
  personOutline
} from 'ionicons/icons';
import { IonIcon } from '@/app/components/common/IonIcon';
import { translations } from '../../store/translations';
import { useRouter } from 'next/navigation';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export default function ProfileView() {
  const user = useStore((state: any) => state.user);
  const staffUser = useStore((state: any) => state.staffUser);
  const language = useStore((state: any) => state.language);
  const setLanguage = useStore((state: any) => state.setLanguage);
  const t = translations[language] || translations.al;
  const setView = useStore((state: any) => state.setView);
  const addNotification = useStore((state: any) => state.addNotification);
  const currentView = useStore((state: any) => state.currentView);
  const guestMode = useStore((state: any) => state.guestMode);
  const setGuestMode = useStore((state: any) => state.setGuestMode);

  const [avatarScale, setAvatarScale] = useState(currentView === 'profile' ? 0 : 1);

  useEffect(() => {
    if (currentView === 'profile') {
      setAvatarScale(1);
    } else {
      setAvatarScale(0);
    }
  }, [currentView]);

  const currentCoverIndex = useStore((state: any) => state.currentCoverIndex);

  const isAl = language === 'al';
  const isIt = language === 'it';

  const activeUser = staffUser || user;

  const [activeModal, setActiveModal] = useState<'notifications' | 'help' | 'delete' | 'language' | 'logout' | 'about' | null>(null);
  const router = useRouter();

  // Capacitor/Web sharing handler
  const handleShare = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: t.share_app_title,
          text: t.share_app_text,
          url: 'https://urbanim.app'
        });
        addNotification(t.share_success, 'success');
      } else if (navigator.share) {
        await navigator.share({
          title: t.share_app_title,
          text: t.share_app_text,
          url: window.location.origin
        });
        addNotification(t.share_success, 'success');
      } else {
        addNotification(t.prof_link_copied, 'success');
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error) || '';
      if (errorMessage.toLowerCase().includes('canceled') ||
        errorMessage.toLowerCase().includes('abort') ||
        errorMessage.toLowerCase().includes('timeout') ||
        errorMessage.toLowerCase().includes('denied')) {
        return;
      }
      if (error instanceof Error) {
        console.warn('Share error:', error.message);
      } else {
        console.warn('Share action dismissed or unavailable');
      }
      if (!errorMessage.toLowerCase().includes('user')) {
        addNotification(t.share_error, 'danger');
      }
    }
  };

  const accountGroup = [
    ...(!guestMode ? [{ icon: personOutline, label: isAl ? "Të dhënat personale" : isIt ? "Dati personali" : "Personal Data", sub: t.prof_edit_personal_info, action: () => setView('edit_profile') }] : []),
    { icon: globeOutline, label: t.prof_language, value: language === 'al' ? t.language_al : language === 'en' ? t.language_english : t.language_italiano, action: () => setActiveModal('language') },
    { icon: notificationsOutline, label: t.prof_notification_center, action: () => setActiveModal('notifications') },
  ];

  const supportGroup = [
    { icon: helpCircleOutline, label: t.prof_help_center, action: () => setView('help') },
    { icon: shareOutline, label: t.share_app_label, action: handleShare },
    guestMode 
      ? { 
          icon: logInOutline, 
          label: isAl ? "Hyr ose Regjistrohu" : isIt ? "Accedi o Registrati" : "Login or Sign Up", 
          action: () => {
            setGuestMode(false);
          }, 
          isSuccess: true 
        }
      : { icon: logOutOutline, label: t.logout, action: () => setActiveModal('logout'), isDestructive: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent', position: 'relative' }}
    >

      {/* Curved Gradient Header (Cover) */}
      <motion.div 
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        style={{
          position: 'relative',
          height: '170px',
          overflow: 'visible',
          boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          zIndex: 1,
          background: '#0a0f1d'
        }}
      >
        {/* Slideshow background images */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num, i) => (
          <div
            key={num}
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, rgba(245, 158, 11, 0.8) 0%, rgba(234, 88, 12, 0.85) 100%), url("/tirana_cover_${num}.png") center/cover no-repeat`,
              opacity: currentCoverIndex === i ? 1 : 0,
              transition: 'opacity 1.5s ease-in-out',
              zIndex: 0
            }}
          />
        ))}
        {/* Safe Area Top-spacing and Navigation header */}
        <div style={{
          position: 'absolute', top: 'calc(12px + env(safe-area-inset-top, 0px))', left: '20px', right: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5
        }}>
          {/* Title */}
          <span style={{
            color: '#fff', fontSize: '18px', fontWeight: '800',
            letterSpacing: '0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.15)'
          }}>
            {t.profile}
          </span>
        </div>

        {/* Organic Wave Bottom Divider */}
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: '45px', zIndex: 2 }}>
          <path fill="var(--bg-dark)" d="M0,160 C 180,160 180,210 360,210 C 540,210 540,110 720,110 C 900,110 900,210 1080,210 C 1260,210 1260,160 1440,160 L 1440,220 L 0,220 Z"></path>
        </svg>

        {/* Overlapping Floating Avatar wrapper (absolute positioned inside the visible-overflow header) */}
        <motion.div 
          initial={{ scale: currentView === 'profile' ? 0 : 1, opacity: currentView === 'profile' ? 0 : 1, x: '-50%' }}
          animate={{ 
            scale: avatarScale, 
            opacity: avatarScale, 
            x: '-50%' 
          }}
          transition={{ 
            type: 'spring', 
            stiffness: avatarScale === 1 ? 150 : 80, 
            damping: avatarScale === 1 ? 12 : 20,
            restDelta: 0.001
          }}
          style={{
            position: 'absolute',
            bottom: '-45px', // positions it to overlap the bottom edge
            left: '50%',
            display: 'flex',
            justifyContent: 'center',
            zIndex: 10,
            transformOrigin: 'center'
          }}
        >
          {/* Circular Container with Background Color Border */}
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: '4px solid rgba(10, 15, 26, 0.85)',
            background: 'rgba(17, 19, 24, 0.7)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: '700',
            color: '#fff',
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.6), 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.08)'
          }}>
            {activeUser?.avatar ? (
              <img src={activeUser.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
            ) : guestMode ? (
              <IonIcon icon={personOutline} style={{ fontSize: '40px', color: '#94a3b8' }} />
            ) : (
              activeUser?.name?.charAt(0) || 'U'
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Spacer for Floating Avatar */}
      <motion.div 
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 15, delay: 0.25 }}
        style={{ textAlign: 'center', marginTop: '55px', marginBottom: '24px', padding: '0 20px' }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 4px 0' }}>
          {guestMode ? (language === 'al' ? 'Vizitor' : language === 'it' ? 'Ospite' : 'Guest') : (activeUser?.name || 'Përdorues')}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '13px' }}>
          {guestMode ? (
            <span>{language === 'al' ? 'Llogari Mysafire' : language === 'it' ? 'Account Ospite' : 'Guest Account'}</span>
          ) : (
            <>
              <IonIcon icon={locationOutline} style={{ fontSize: '14px', color: '#f59e0b' }} />
              <span>{isAl ? "Tiranë, Shqipëri" : "Tirana, Albania"}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Groups Container */}
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingBottom: '30px' }}>

        {/* Account Card Group */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 16, delay: 0.35 }}
        >
          <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '8px' }}>
            {isAl ? "Llogaria" : isIt ? "Account" : "Account"}
          </h3>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            {accountGroup.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'transparent', border: 'none',
                  borderBottom: idx < accountGroup.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  padding: '16px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '11px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f59e0b',
                  flexShrink: 0
                }}>
                  <IonIcon icon={item.icon} style={{ fontSize: '18px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: '#fff' }}>{item.label}</span>
                  {(item.sub || item.value) && (
                    <span style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.sub || item.value}
                    </span>
                  )}
                </div>
                <IonIcon icon={chevronForwardOutline} style={{ fontSize: '16px', color: 'rgba(255,255,255,0.15)' }} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Support & Settings Card Group */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 16, delay: 0.45 }}
        >
          <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', paddingLeft: '8px' }}>
            {isAl ? "Mbeshtetja & Cilësimet" : isIt ? "Supporto & Impostazioni" : "Support & Settings"}
          </h3>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            {supportGroup.map((item, idx) => (
              <button
                key={idx}
                onClick={item.action}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'transparent', border: 'none',
                  borderBottom: idx < supportGroup.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  padding: '16px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: '38px', height: '38px', borderRadius: '11px',
                  background: item.isDestructive ? 'rgba(239,68,68,0.08)' : (item as any).isSuccess ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
                  border: item.isDestructive ? '1px solid rgba(239,68,68,0.15)' : (item as any).isSuccess ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: item.isDestructive ? '#ef4444' : (item as any).isSuccess ? '#10b981' : '#f59e0b',
                  flexShrink: 0
                }}>
                  <IonIcon icon={item.icon} style={{ fontSize: '18px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: item.isDestructive ? '#ef4444' : (item as any).isSuccess ? '#10b981' : '#fff' }}>
                    {item.label}
                  </span>
                </div>
                <IonIcon icon={chevronForwardOutline} style={{ fontSize: '16px', color: item.isDestructive ? 'rgba(239,68,68,0.2)' : (item as any).isSuccess ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.15)' }} />
              </button>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              style={{
                width: '100%', maxWidth: '400px',
                background: 'rgba(20, 25, 40, 0.65)',
                backdropFilter: 'blur(40px) saturate(190%)',
                WebkitBackdropFilter: 'blur(40px) saturate(190%)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '24px', padding: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
                  {activeModal === 'logout' ? t.logout :
                    activeModal === 'language' ? t.prof_language :
                      activeModal === 'delete' ? 'Fshij Llogarinë' : (activeModal === 'about' ? 'Rreth Urbani Im' : 'Informacion')}
                </h3>
                <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                  <IonIcon icon={closeOutline} style={{ fontSize: '20px' }} />
                </button>
              </div>

              {activeModal === 'language' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'al', name: 'Shqip', flag: '🇦🇱' },
                    { id: 'en', name: 'English', flag: '🇬🇧' },
                    { id: 'it', name: 'Italiano', flag: '🇮🇹' }
                  ].map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => { setLanguage(lang.id); setActiveModal(null); }}
                      style={{
                        width: '100%', padding: '14px 16px', borderRadius: '12px',
                        background: language === lang.id ? 'rgba(234, 88, 12, 0.1)' : 'transparent',
                        border: 'none',
                        color: language === lang.id ? '#ea580c' : 'rgba(255,255,255,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      {language === lang.id && (
                        <div style={{ position: 'absolute', left: 0, top: '25%', bottom: '25%', width: '4px', background: '#ea580c', borderRadius: '0 4px 4px 0' }} />
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '22px', filter: language === lang.id ? 'none' : 'grayscale(0.4) opacity(0.7)' }}>{lang.flag}</span>
                        <span style={{ fontSize: '15px', color: language === lang.id ? '#fff' : 'inherit', fontWeight: language === lang.id ? '600' : '500' }}>{lang.name}</span>
                      </div>
                      {language === lang.id && (
                        <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '18px', color: '#ea580c' }} />
                      )}
                    </button>
                  ))}
                </div>
              ) : activeModal === 'logout' ? (
                <div>
                  <p style={{ margin: '0 0 20px 0', fontSize: '15px', color: '#fff', fontWeight: '500', lineHeight: '1.5' }}>
                    {t.logout_confirm}
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setActiveModal(null)}
                      style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '14px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {t.no}
                    </button>
                    <button
                      onClick={() => {
                        useStore.getState().logout();
                        safeSignOut();
                        setActiveModal(null);
                      }}
                      style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
                    >
                      {t.yes}
                    </button>
                  </div>
                </div>
              ) : activeModal === 'about' ? (
                <div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>Urbani Im — Ndjekja e Autobuzëve në Shqipëri. Version 1.0.6. Për pyetje ose sugjerime, na kontaktoni në support@albroute.al.</p>
                </div>
              ) : (
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                  {activeModal === 'notifications' && t.prof_no_new_notifications}
                </p>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </motion.div>
  );
}
