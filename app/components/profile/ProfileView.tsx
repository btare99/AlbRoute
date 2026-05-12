'use client';

import { useState } from 'react';
import useStore from '../../store/useStore';
import { User, LogOut, ChevronRight, Bell, Share2, Info, Trash2, AlertTriangle, X, Mail, Phone, Globe, Zap, Star } from 'lucide-react';
import { translations } from '../../store/translations';

export default function ProfileView() {
  const user = useStore((state: any) => state.user);
  const staffUser = useStore((state: any) => state.staffUser);
  const logout = useStore((state: any) => state.logout);
  const language = useStore((state: any) => state.language);
  const setLanguage = useStore((state: any) => state.setLanguage);
  const t = translations[language] || translations.al;
  const setView = useStore((state: any) => state.setView);
  const addNotification = useStore((state: any) => state.addNotification);

  const activeUser = staffUser || user;

  const [activeModal, setActiveModal] = useState<'notifications' | 'help' | 'delete' | 'language' | 'logout' | null>(null);

  const menuItems = [
    { icon: <Star size={18} />, label: language === 'al' ? 'Stacionet e Ruajtura' : 'Saved Stops', action: () => setView('favorites') },
    { icon: <Bell size={18} />, label: language === 'al' ? 'Qendra e Njoftimeve' : 'Notification Center', action: () => setActiveModal('notifications') },
    { icon: <Zap size={18} />, label: language === 'al' ? 'Abonimi Im' : language === 'en' ? 'My Subscription' : 'Il mio Abbonamento', value: language === 'al' ? 'Standard' : 'Standard', action: () => setView('subscription') },
    { icon: <Globe size={18} />, label: language === 'al' ? 'Gjuha / Language' : language === 'en' ? 'Language' : 'Lingua', value: language === 'al' ? 'Shqip' : language === 'en' ? 'English' : 'Italiano', action: () => setActiveModal('language') },
    { icon: <Info size={18} />, label: language === 'al' ? 'Qendra e Ndihmës' : 'Help Center', action: () => setActiveModal('help') },
    {
      icon: <Share2 size={18} />, label: 'Share Urbani Im', action: () => {
        if (navigator.share) {
          navigator.share({
            title: 'Urbani Im',
            text: 'Shkarko aplikacionin më të mirë për transportin urban në Tiranë!',
            url: window.location.origin
          }).catch(console.error);
        } else {
          addNotification(language === 'al' ? 'Lidhja u kopjua!' : 'Link copied!', 'success');
        }
      }
    },
    { icon: <LogOut size={18} />, label: t.logout, action: () => setActiveModal('logout'), isDestructive: true },
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
              {language === 'al' ? 'Ndrysho gjeneralitetet' : 'Edit personal info'}
            </p>
          </div>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <ChevronRight size={16} />
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
              width: '36px', height: '36px', borderRadius: '10px',
              background: item.isDestructive ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: item.isDestructive ? '#ef4444' : '#94a3b8'
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1, fontSize: '15px', fontWeight: '500' }}>
              {item.label}
            </div>
            {item.value && (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginRight: '4px' }}>
                {item.value}
              </div>
            )}
            <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.1)' }} />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '4px 20px', textAlign: 'center', marginTop: 'auto', marginBottom: '5px' }}>
        <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>
          POWERED BY URBANI IM
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>
          Versioni 1.0.0
        </p>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px', animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: activeModal === 'logout' ? 'rgba(26, 29, 36, 0.6)' : '#1a1d24',
            backdropFilter: activeModal === 'logout' ? 'blur(20px)' : 'none',
            borderRadius: '24px', width: '100%', maxWidth: '300px',
            padding: activeModal === 'logout' ? '20px' : '24px', textAlign: 'center', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            border: activeModal === 'logout' ? '1px solid rgba(255,255,255,0.1)' : 'none'
          }}>
            {activeModal !== 'logout' && (
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#fff' }}>
                {activeModal === 'notifications' && (language === 'al' ? 'Njoftime' : 'Notifications')}
                {activeModal === 'help' && (language === 'al' ? 'Ndihmë' : 'Help')}
                {activeModal === 'language' && (language === 'al' ? 'Zgjidh Gjuhën' : language === 'en' ? 'Select Language' : 'Scegli la Lingua')}
              </h3>
            )}

            {activeModal === 'language' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {[
                  { id: 'al', name: 'Shqip', flag: 'al' },
                  { id: 'en', name: 'English', flag: 'us' },
                  { id: 'it', name: 'Italiano', flag: 'it' }
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setLanguage(lang.id);
                      setActiveModal(null);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: language === lang.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                      border: language === lang.id ? '1px solid #94a3b8' : '1px solid transparent',
                      padding: '12px 16px', borderRadius: '12px',
                      color: '#fff', fontSize: '15px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={`https://flagcdn.com/w40/${lang.flag}.png`} alt={lang.id} style={{ width: '20px', borderRadius: '2px' }} />
                    {lang.name}
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
                    onClick={() => { logout(); setActiveModal(null); }}
                    style={{ flex: 1, padding: '12px', background: '#ef4444', border: 'none', borderRadius: '14px', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
                  >
                    {t.yes}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
                {activeModal === 'notifications' && (language === 'al' ? 'Nuk keni asnjë njoftim të ri.' : 'You have no new notifications.')}
                {activeModal === 'help' && (language === 'al' ? 'Për çdo problem, na kontaktoni në support@albroute.al' : 'For any issues, contact us at support@albroute.al')}
              </p>
            )}

            {activeModal !== 'logout' && (
              <button onClick={() => setActiveModal(null)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                {language === 'al' ? 'Mbyll' : 'Close'}
              </button>
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
