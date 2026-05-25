'use client';

import { useState } from 'react';
import { signOut } from "next-auth/react";
import useStore from '../../store/useStore';
import {
  bookmarkOutline, logOutOutline, chevronForwardOutline, notificationsOutline, shareOutline,
  helpCircleOutline, trashOutline, alertOutline, closeOutline, mailOutline, callOutline,
  globeOutline, ticketOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { translations } from '../../store/translations';
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

  const activeUser = staffUser || user;

  const [activeModal, setActiveModal] = useState<'notifications' | 'help' | 'delete' | 'language' | 'logout' | null>(null);

  const hasSubscription = activeUser?.subscriptions && activeUser.subscriptions.length > 0;
  const activePackage = hasSubscription ? activeUser.subscriptions[activeUser.subscriptions.length - 1] : null;
  const subscriptionValue = activePackage
    ? activePackage.name
    : (language === 'al' ? 'Nuk ka abonim' : language === 'it' ? 'Nessun abbonamento' : 'No subscription');

  const menuItems = [
    { icon: bookmarkOutline, label: t.prof_saved_stops, action: () => setView('favorites') },
    { icon: notificationsOutline, label: t.prof_notification_center, action: () => setActiveModal('notifications') },
    { icon: ticketOutline, label: t.sub_my_subscription, value: subscriptionValue, action: () => setView('subscription') },
    { icon: globeOutline, label: t.prof_language, value: language === 'al' ? 'Shqip' : language === 'en' ? 'English' : 'Italiano', action: () => setActiveModal('language') },
    { icon: helpCircleOutline, label: t.prof_help_center, action: async () => {
        if (Capacitor.isNativePlatform()) {
          try {
            await Browser.open({ url: 'https://urbanim.app/help', windowName: '_blank' });
            return;
          } catch (error) {
            console.warn('Browser plugin failed to open help page:', error);
          }
        }
        setActiveModal('help');
      } },
    {
      icon: shareOutline, label: 'Share Urbani Im', action: async () => {
        try {
          if (Capacitor.isNativePlatform()) {
            // Përdor Capacitor Share për mobilet
            await Share.share({
              title: 'Urbani Im',
              text: 'Shkarko aplikacionin më të mirë për transportin urban në Tiranë!',
              url: 'https://urbanim.app'
            });
            addNotification(language === 'al' ? 'Aplikacioni u ndaq me sukses!' : 'App shared successfully!', 'success');
          } else if (navigator.share) {
            // Përdor Web Share API për browserët
            await navigator.share({
              title: 'Urbani Im',
              text: 'Shkarko aplikacionin më të mirë për transportin urban në Tiranë!',
              url: window.location.origin
            });
            addNotification(language === 'al' ? 'Aplikacioni u ndaq me sukses!' : 'App shared successfully!', 'success');
          } else {
            addNotification(t.prof_link_copied, 'success');
          }
        } catch (error: any) {
          const errorMessage = error?.message || String(error) || '';
          // Ignore share canceled errors
          if (errorMessage.toLowerCase().includes('canceled') || errorMessage.toLowerCase().includes('abort')) {
            return;
          }
          // Safely log error
          if (error instanceof Error) {
            console.error('Share error:', error.message);
          } else {
            console.warn('Share action dismissed or unavailable');
          }
          addNotification(language === 'al' ? 'Gabim në ndarje të aplikacionit' : 'Error sharing app', 'danger');
        }
      }
    },
    { icon: logOutOutline, label: t.logout, action: () => setActiveModal('logout'), isDestructive: true },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)', position: 'relative' }}>

      {/* Header Profile Card */}
      <div style={{ padding: '30px 20px 20px 20px' }}>
        <button
          onClick={() => setView('edit_profile')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '15px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px', padding: '16px', cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.2s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          <div style={{
            width: '56px', height: '56px', borderRadius: '18px',
            background: '#111318',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: '600', color: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.03)'
          }}>
            {activeUser?.avatar ? (
              <img src={activeUser.avatar} style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover' }} alt="Profile" />
            ) : (
              activeUser?.name?.charAt(0) || 'U'
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#fff' }}>{activeUser?.name || 'Përdorues'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '2px 0 0 0' }}>
              {t.prof_edit_personal_info}
            </p>
          </div>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <IonIcon icon={chevronForwardOutline} style={{ fontSize: '16px' }} />
          </div>
        </button>
      </div>

      {/* Menu List */}
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={item.action}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
              background: 'transparent', border: 'none', borderRadius: '14px',
              padding: '16px', cursor: 'pointer', textAlign: 'left',
              color: item.isDestructive ? '#ef4444' : '#fff',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: item.isDestructive ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: item.isDestructive ? '#ef4444' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s ease'
            }}>
              <IonIcon icon={item.icon} style={{ fontSize: '18px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '15px', fontWeight: '500' }}>{item.label}</span>
              {item.value && (
                <span style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                  {item.value}
                </span>
              )}
            </div>
            {!item.isDestructive && (
              <IonIcon icon={chevronForwardOutline} style={{ fontSize: '16px', color: 'rgba(255,255,255,0.15)' }} />
            )}
          </button>
        ))}
      </div>

      {/* Modals */}
      {activeModal && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '400px', background: '#111318', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', margin: 0 }}>
                {activeModal === 'logout' ? t.logout :
                  activeModal === 'language' ? t.prof_language :
                    activeModal === 'delete' ? 'Fshij Llogarinë' : 'Informacion'}
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
                      useStore.getState().setGuestMode(false);
                      signOut({ callbackUrl: '/' });
                      setActiveModal(null);
                    }}
                    style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
                  >
                    {t.yes}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                {activeModal === 'notifications' && t.prof_no_new_notifications}
                {activeModal === 'help' && t.prof_help_contact}
              </p>
            )}


          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
