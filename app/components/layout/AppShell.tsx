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
  const showBottomNav = useStore((state: any) => state.showBottomNav);
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

  // ─── Scroll-to-Shrink Bottom Navigation (Progressive) ───
  useEffect(() => {
    let lastScrollY = 0;
    let p = 0; // shrink progress (0 = normal, 1 = fully shrunk)

    // Reset styles to normal when changing view or state
    const bottomNav = document.querySelector('.bottom-nav') as HTMLElement;
    if (bottomNav) {
      bottomNav.style.transform = 'scale(1)';
      bottomNav.style.opacity = '1';
    }

    const handleScrollCapture = (e: Event) => {
      // Don't apply scroll effects if we are in map selection or sheets are open
      const store = useStore.getState();
      if (store.selectingOnMap || store.selectedStop || store.showTripDetails) {
        return;
      }

      const target = e.target as HTMLElement;
      if (!target || typeof target.scrollTop === 'undefined') return;

      const currentScrollY = target.scrollTop;
      const delta = currentScrollY - lastScrollY;

      // Handle resetting when back at the top
      if (currentScrollY <= 5) {
        p = 0;
        const bottomNav = document.querySelector('.bottom-nav') as HTMLElement;
        if (bottomNav) {
          bottomNav.style.transform = 'scale(1)';
          bottomNav.style.opacity = '1';
        }
      } 
      // Progressive scaling on actual scroll gestures
      else if (Math.abs(delta) > 0.5) {
        if (delta > 0) {
          // Scrolling down: progressively shrink (fully shrunk at 100px scroll)
          p = Math.min(1, p + delta / 100);
        } else {
          // Scrolling up: progressively restore (fully restored at 80px scroll)
          p = Math.max(0, p + delta / 80);
        }

        const bottomNav = document.querySelector('.bottom-nav') as HTMLElement;
        if (bottomNav) {
          const scale = 1 - (p * 0.08); // goes from 1 to 0.92 (subtle shrink)
          const opacity = 1 - (p * 0.25); // goes from 1 to 0.75 (subtle opacity fade)
          
          bottomNav.style.transform = `scale(${scale})`;
          bottomNav.style.opacity = `${opacity}`;
        }
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScrollCapture, { capture: true, passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollCapture, { capture: true });
    };
  }, [currentView, selectingOnMap, selectedStop, showTripDetails]);

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
      <main className="main-area">
        {renderView()}
      </main>

      {/* Floating bottom nav — mobile only */}
      <nav className={`bottom-nav ${(selectingOnMap || selectedStop || showTripDetails) ? 'bottom-nav-hidden' : ''}`} aria-label="Main navigation">
        {MENU.map(({ id, icon: Icon }) => {
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
                <IonIcon icon={Icon} style={{ fontSize: 24, color: 'currentColor' }} />
              </span>
            </button>
          );
        })}
      </nav>

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
            padding-bottom: 0; /* Let content (like Map) stretch fully to the bottom behind the glass bar */
          }

          /* Floating pill nav — Premium Dark Acrylic Style (Island) */
          .bottom-nav {
            display: flex;
            align-items: center;
            justify-content: space-around;

            position: fixed;
            /* Using CSS max() and calc() with insets to dynamically position safely on all Android/iOS/Web platforms */
            bottom: max(24px, calc(16px + env(safe-area-inset-bottom, 12px)));
            left: 16px;
            right: 16px;
            height: 64px;
            padding: 4px; /* Uniform 4px padding on all sides to establish consistent spacing */

            background: rgba(15, 20, 32, 0.52); /* Darker slate-grey glass for strong contrast over MapView */
            backdrop-filter: blur(24px) saturate(180%); /* Snappy blur that diffuses MapView details nicely */
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.16); /* Crisp, bright outer border to cleanly define the bar shape over the map */
            border-radius: 32px;
            box-shadow:
              0 16px 40px rgba(0, 0, 0, 0.65), /* Deep shadow to float the nav bar off MapView layers */
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
            z-index: 2000;
            transition: bottom 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
          }
          .bottom-nav-hidden {
            bottom: -100px !important;
            opacity: 0 !important;
            transform: none !important;
          }


          /* ── Individual tab button with internal active pill capsule ─────────────── */
          .nav-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            height: 100%;

            background: none;
            border: none;
            cursor: pointer;
            transition: color 0.25s ease;
            color: rgba(255, 255, 255, 0.45);
            -webkit-tap-highlight-color: transparent;
            position: relative;
            z-index: 1;
          }

          .nav-btn::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.14); /* Slightly higher opacity active capsule for clear focus state */
            border-radius: 28px; /* Concentrically matches outer border radius curve (32px - 4px padding) */
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
            color: #ffffff; /* Pure white active icon, matching mockup */
            animation: activeShake 0.45s cubic-bezier(0.25, 0.8, 0.25, 1) both;
          }

          @keyframes activeShake {
            0% {
              transform: scale(0.92);
            }
            25% {
              transform: scale(1.05) translateX(-2.5px) rotate(-2deg);
            }
            50% {
              transform: scale(0.98) translateX(1.5px) rotate(1.5deg);
            }
            75% {
              transform: scale(1.01) translateX(-0.5px) rotate(-0.5deg);
            }
            100% {
              transform: scale(1) translateX(0) rotate(0);
            }
          }

          .nav-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .nav-btn.active .nav-icon {
            transform: scale(1.05);
          }
        }

        /* ── Tablet-specific refinements (iPad/Android Tablets) ── */
        @media (min-width: 901px) and (max-width: 1180px) {
          .main-area {
            padding-bottom: 0; /* Fully stretch to the bottom on tablet too */
          }

          .bottom-nav {
            left: 40px;
            right: 40px;
            /* Using CSS max() on tablet to safely position bottom navigation */
            bottom: max(32px, calc(20px + env(safe-area-inset-bottom, 16px)));
            height: 72px;
            padding: 6px; /* Uniform 6px padding on tablet to match proportion */
            border-radius: 36px;
            background: rgba(15, 20, 32, 0.52); /* Darker slate-grey glass for tablet */
            backdrop-filter: blur(24px) saturate(180%); /* Moderate blur for tablet */
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.16); /* Bright border for tablet */
          }

          .nav-btn {
            height: 100%;
          }

          .nav-btn::before {
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: 30px; /* Concentrically matches outer border radius curve (36px - 6px padding) */
          }
        }
      `}</style>
    </div>
  );
}