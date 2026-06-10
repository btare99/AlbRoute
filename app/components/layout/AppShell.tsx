'use client';
import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import Sidebar from './Sidebar';
import MapView from '../map/MapView';
import BusTracker from '../map/BusTracker';

import ProfileView from '../profile/ProfileView';
import UserFavorites from '../profile/UserFavorites';
import EditProfileView from '../profile/EditProfileView';
import HelpView from '../profile/HelpView';
import FeedbackView from '../profile/FeedbackView';
import DeleteAccountView from '../profile/DeleteAccountView';
import useStore from '../../store/useStore';
import { useSession } from "next-auth/react";
import { IonIcon } from '@/app/components/common/IonIcon';
import { mapOutline, busOutline, personOutline, heartOutline } from 'ionicons/icons';
import { translations } from '../../store/translations';
import SwipeDismissView from './SwipeDismissView';
import dynamic from 'next/dynamic';

const BusAdminView = dynamic(() => import('../map/BusAdminView'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', background: '#0a0f1d', color: '#3b82f6',
      fontSize: '16px', fontWeight: '600'
    }}>
      Loading Admin Panel...
    </div>
  )
});

export default function AppShell() {
  const { data: session, status } = useSession();
  const currentView = useStore((state: any) => state.currentView);
  const setView = useStore((state: any) => state.setView);
  const isSidebarOpen = useStore((state: any) => state.isSidebarOpen);
  const language = useStore((state: any) => state.language);
  const selectingOnMap = useStore((state: any) => state.selectingOnMap);
  const selectedStop = useStore((state: any) => state.selectedStop);
  const showTripDetails = useStore((state: any) => state.showTripDetails);
  const fetchBuses = useStore((state: any) => state.fetchBuses);
  const addNotification = useStore((state: any) => state.addNotification);
  const networkStatus = useStore((state: any) => state.networkStatus);
  const t = translations[language] || translations.al;
  const googleLoginHandled = useRef(false);

  // ─── Sync Session with Store + Google Welcome ───
  useEffect(() => {
    const handleSession = async () => {
      if (status === 'unauthenticated') {
        const storeUser = useStore.getState().user;
        const storeStaffUser = useStore.getState().staffUser;
        if (storeUser || storeStaffUser) {
          useStore.getState().logout();
        }
        return;
      }
      if (status === 'authenticated') {
        const storeGuestMode = useStore.getState().guestMode;
        if (storeGuestMode) {
          useStore.setState({ guestMode: false });
        }
      }
      if (!session?.user) return;
      const u = session.user as any;
      if (u.role === 'user' || !u.role) {
        const storeUser = useStore.getState().user;
        const isAuthenticated = useStore.getState().isAuthenticated;
        const needsLogin = !isAuthenticated || !storeUser || (storeUser.id !== u.id && storeUser._id !== u.id);

        if (needsLogin) {
          useStore.getState().login(u, 'next-auth-session');
          // Fetch full profile (with photos) from DB to supplement stripped JWT
          try {
            const res = await fetch(`/api/user/profile?userId=${u.id}`);
            if (!res.ok) throw new Error(`Profile fetch failed (${res.status} ${res.statusText})`);
            const data = await res.json();
            if (!data.error) {
              useStore.getState().login({ ...u, ...data }, 'next-auth-session');
            }
          } catch (error) {
            console.error('Failed to load full user profile:', error);
          }
        }
      } else {
        const storeStaffUser = useStore.getState().staffUser;
        const isAuthenticated = useStore.getState().isAuthenticated;
        if (!isAuthenticated || !storeStaffUser || storeStaffUser.id !== u.id) {
          useStore.getState().loginAsStaff(u);
        }
      }

      if (!googleLoginHandled.current) {
        try {
          const { value } = await Preferences.get({ key: 'google_login_pending' });
          if (value === '1') {
            googleLoginHandled.current = true;
            await Preferences.remove({ key: 'google_login_pending' });
            setTimeout(() => {
              addNotification(
                (() => {
                  const username = u.name?.split(' ')[0] || '';
                  const base = t.auth_welcome.replace(/!$/, '');
                  return username ? `${base}, ${username}!` : t.auth_welcome;
                })(),
                'success'
              );
            }, 500);
          }
        } catch (error) {
          console.warn('Could not load login pending state from preferences:', error);
        }
      }
    };

    handleSession();
  }, [session, status, language, addNotification]);

  // ─── Cover Slideshow Interval (5 minutes) ───
  useEffect(() => {
    const interval = setInterval(() => {
      useStore.getState().nextCoverIndex?.();
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // ─── Live Data Polling ───
  useEffect(() => {
    // Initial fetch
    fetchBuses();

    // Interval for live updates (every 3 seconds)
    const interval = setInterval(() => {
      if (currentView === 'map' || currentView === 'tracker') {
        fetchBuses();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentView, fetchBuses]);

  // ─── Periodic Geolocation Sync (every 60 seconds) ───
  useEffect(() => {
    const initializeNativePlugins = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await useStore.getState().initializeNativeServices?.();
        } catch (error) {
          console.warn('Failed to initialize native services:', error);
        }
      }
      await useStore.getState().fetchUserLocation?.();
    };

    initializeNativePlugins();

    const interval = setInterval(() => {
      useStore.getState().fetchUserLocation?.();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const MENU = [
    { id: 'map', label: t.map, icon: mapOutline },
    { id: 'tracker', label: t.live_buses, icon: busOutline },
    { id: 'favorites', label: 'Favourites', icon: heartOutline },
    { id: 'profile', label: t.profile, icon: personOutline },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'map': return <MapView />;
      case 'tracker': return <BusTracker />;
      case 'admin': return <BusAdminView />;

      case 'profile': return <ProfileView />;
      case 'favorites': return (
        <SwipeDismissView onDismiss={() => setView('map')} background={<MapView />}>
          <UserFavorites />
        </SwipeDismissView>
      );
      case 'edit_profile': return (
        <SwipeDismissView onDismiss={() => setView('profile')} background={<ProfileView />}>
          <EditProfileView />
        </SwipeDismissView>
      );
      case 'help': return (
        <SwipeDismissView onDismiss={() => setView('profile')} background={<ProfileView />}>
          <HelpView />
        </SwipeDismissView>
      );
      case 'feedback': return (
        <SwipeDismissView onDismiss={() => setView('help')} background={<HelpView />}>
          <FeedbackView />
        </SwipeDismissView>
      );
      case 'delete_account': return (
        <SwipeDismissView onDismiss={() => setView('edit_profile')} background={<EditProfileView />}>
          <DeleteAccountView />
        </SwipeDismissView>
      );
      default: return <MapView />;
    }
  };

  return (
    <div className="app-layout">
      {/* Offline Banner */}
      {networkStatus && !networkStatus.connected && (
        <div className="offline-banner">
          <span className="offline-dot" />
          <span>Ju jeni offline. Kontrolloni lidhjen me internetin.</span>
        </div>
      )}

      {/* Sidebar + overlay */}
      <Sidebar />
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => useStore.getState().setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className={`main-area ${Capacitor.getPlatform() === 'android' ? 'android-safe' : ''}`}>
        {renderView()}
      </main>

      {/* Floating bottom nav — mobile only */}
      {!selectingOnMap && !selectedStop && !showTripDetails && (
        <nav className={`bottom-nav ${Capacitor.getPlatform() === 'android' ? 'android-safe' : ''}`} aria-label="Main navigation">
          {MENU.map(({ id, label, icon: Icon }) => {
            const active = currentView === id ||
              (id === 'profile' && (currentView === 'edit_profile' || currentView === 'help' || currentView === 'feedback' || currentView === 'delete_account'));
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`nav-btn ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="nav-icon">
                  <IonIcon icon={Icon} style={{ fontSize: 20, color: 'currentColor' }} />
                </span>
                <span className="nav-label">{label}</span>
              </button>
            );
          })}
        </nav>
      )}

      <style jsx>{`
        /* ── Offline Banner ───────────────────────── */
        .offline-banner {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: #ef4444;
          color: #fff;
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          z-index: 9999;
          animation: slideDown 0.3s ease;
        }

        .offline-dot {
          width: 8px;
          height: 8px;
          background: #fff;
          border-radius: 50%;
          animation: pulse 1s infinite alternate;
        }

        @keyframes slideDown {
          from {
            transform: translate(-50%, -20px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        /* ── Layout ───────────────────────────────── */
        .app-layout {
          display: flex;
          height: 100dvh;
          overflow: hidden;
          touch-action: manipulation;
        }

        .main-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* ── Bottom nav — hidden on desktop ──────── */
        .bottom-nav {
          display: none;
        }

        /* ── Mobile + Tablet breakpoint (≤ 1180px) ─── */
        @media (max-width: 1180px) {
          .sidebar { display: none !important; }

          .main-area {
            height: 100%;
            padding-bottom: calc(96px + env(safe-area-inset-bottom, 12px));
          }

          .main-area.android-safe {
            padding-bottom: calc(112px + env(safe-area-inset-bottom, 24px));
          }

          /* Floating pill nav — Liquid Glass Style */
          .bottom-nav {
            display: flex;
            align-items: center;
            justify-content: space-around;

            position: fixed;
            bottom: calc(20px + env(safe-area-inset-bottom, 12px));
            left: 16px;
            right: 16px;
            height: 64px;
            padding: 0 6px;

            background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%);
            backdrop-filter: blur(28px) saturate(190%);
            -webkit-backdrop-filter: blur(28px) saturate(190%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 22px;
            box-shadow:
              0 12px 32px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
            z-index: 2000;
            transition: bottom 0.3s ease;
          }

          .bottom-nav.android-safe {
            /* Extra safety margin on Android devices to clear system navigation button overlaps */
            bottom: calc(32px + env(safe-area-inset-bottom, 20px));
          }

          /* ── Individual tab button with internal glass capsule ─────────────── */
          .nav-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            flex: 1;
            padding: 6px 0;
            min-height: 48px;
            min-width: 44px;

            background: none;
            border: none;
            cursor: pointer;
            border-radius: 16px;
            transition: color 0.25s ease;
            color: rgba(255, 255, 255, 0.45);
            -webkit-tap-highlight-color: transparent;
            position: relative;
            z-index: 1;
          }

          .nav-btn::before {
            content: '';
            position: absolute;
            top: 4px;
            bottom: 4px;
            left: 6px;
            right: 6px;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
            z-index: -1;
            opacity: 0;
            transform: scale(0.85);
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
          }

          .nav-btn.active::before {
            opacity: 1;
            transform: scale(1);
          }

          .nav-btn:active {
            transform: scale(0.95);
          }

          .nav-btn.active {
            color: #f59e0b;
          }

          .nav-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .nav-btn.active .nav-icon {
            transform: translateY(-1px) scale(1.05);
          }

          /* ── Label ─────────────────────────────── */
          .nav-label {
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.02em;
            line-height: 1;
            margin-top: 1px;
          }
        }

        /* ── Tablet-specific refinements (iPad/Android Tablets) ── */
        @media (min-width: 901px) and (max-width: 1180px) {
          .main-area {
            padding-bottom: calc(112px + env(safe-area-inset-bottom, 12px));
          }

          .main-area.android-safe {
            padding-bottom: calc(128px + env(safe-area-inset-bottom, 24px));
          }

          .bottom-nav {
            left: 32px;
            right: 32px;
            bottom: calc(24px + env(safe-area-inset-bottom, 12px));
            height: 72px;
            padding: 0 16px;
            border-radius: 28px;
          }

          .bottom-nav.android-safe {
            bottom: calc(36px + env(safe-area-inset-bottom, 20px));
          }

          .nav-btn {
            padding: 10px 0;
            min-height: 56px;
            min-width: 60px;
          }

          .nav-btn::before {
            top: 6px;
            bottom: 6px;
            left: 12px;
            right: 12px;
            border-radius: 18px;
          }

          .nav-label {
            font-size: 11px;
            font-weight: 700;
          }
        }
      `}</style>
    </div>
  );
}