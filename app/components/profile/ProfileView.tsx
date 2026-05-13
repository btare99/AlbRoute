'use client';

import { useState } from 'react';
import { signOut } from "next-auth/react";
import useStore from '../../store/useStore';
import { User, LogOut, ChevronRight, Bell, Share2, Info, Trash2, AlertTriangle, X, Mail, Phone, Globe, Zap, Star } from 'lucide-react';
import { translations } from '../../store/translations';

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
              width: '40px', height: '40px', borderRadius: '12px',
              background: item.isDestructive ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: item.isDestructive ? '#ef4444' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s ease'
            }}>
              {item.icon}
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
              <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.15)' }} />
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
                  activeModal === 'language' ? 'Ndrysho Gjuhën' :
                    activeModal === 'delete' ? 'Fshij Llogarinë' : 'Informacion'}
              </h3>
              <button onClick={() => setActiveModal(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {activeModal === 'language' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'al', name: 'Shqip' },
                  { id: 'en', name: 'English' },
                  { id: 'it', name: 'Italiano' }
                ].map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => { setLanguage(lang.id); setActiveModal(null); }}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '12px',
                      background: language === lang.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: '1px solid rgba(255,255,255,0.05)',
                      color: language === lang.id ? '#fff' : 'rgba(255,255,255,0.6)',
                      textAlign: 'left', fontWeight: '600', cursor: 'pointer'
                    }}
                  >
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
                    onClick={() => { signOut(); setActiveModal(null); }}
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
