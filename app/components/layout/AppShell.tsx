'use client';
import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import Sidebar from './Sidebar';
import MapView from '../map/MapView';
import BusTracker from '../map/BusTracker';
import TripPlanner from '../map/TripPlanner';
import ProfileView from '../profile/ProfileView';
import UserFavorites from '../profile/UserFavorites';
import EditProfileView from '../profile/EditProfileView';
import SubscriptionView from '../subscription/SubscriptionView';
import SubscriptionPackagesView from '../subscription/SubscriptionPackagesView';
import SubscriptionCheckoutView from '../subscription/SubscriptionCheckoutView';
import SubscriptionGetPassView from '../subscription/SubscriptionGetPassView';
import PassesView from '../subscription/PassesView';
import useStore from '../../store/useStore';
import { useSession } from "next-auth/react";
import { IonIcon } from '@ionic/react';
import { mapOutline, busOutline, ticketOutline, personOutline } from 'ionicons/icons';
import { translations } from '../../store/translations';
import SwipeDismissView from './SwipeDismissView';


export default function AppShell() {
  const { data: session } = useSession();
  const currentView = useStore((state: any) => state.currentView);
  const setView = useStore((state: any) => state.setView);
  const isSidebarOpen = useStore((state: any) => state.isSidebarOpen);
  const language = useStore((state: any) => state.language);
  const selectingOnMap = useStore((state: any) => state.selectingOnMap);
  const fetchBuses = useStore((state: any) => state.fetchBuses);
  const addNotification = useStore((state: any) => state.addNotification);
  const t = translations[language] || translations.al;
  const googleLoginHandled = useRef(false);

  // ─── Sync Session with Store + Google Welcome ───
  useEffect(() => {
    const handleSession = async () => {
      if (!session?.user) return;
      const u = session.user as any;
      if (u.role === 'user') {
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
      } else {
        useStore.getState().loginAsStaff(u);
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
  }, [session, language, addNotification]);

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

  // ─── Periodic Geolocation Sync (every 5 seconds) ───
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
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const MENU = [
    { id: 'map', label: t.map, icon: mapOutline },
    { id: 'tracker', label: t.live_buses, icon: busOutline },
    { id: 'packages', label: t.packages, icon: ticketOutline },
    { id: 'profile', label: t.profile, icon: personOutline },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'map': return <MapView />;
      case 'tracker': return <BusTracker />;
      case 'planner': return <TripPlanner />;
      case 'profile': return <ProfileView />;
      case 'favorites': return (
        <SwipeDismissView onDismiss={() => setView('profile')} background={<ProfileView />}>
          <UserFavorites />
        </SwipeDismissView>
      );
      case 'edit_profile': return (
        <SwipeDismissView onDismiss={() => setView('profile')} background={<ProfileView />}>
          <EditProfileView />
        </SwipeDismissView>
      );
      case 'subscription': return (
        <SwipeDismissView onDismiss={() => setView('profile')} background={<ProfileView />}>
          <SubscriptionView />
        </SwipeDismissView>
      );
      case 'packages': return <SubscriptionPackagesView />;
      case 'checkout': return (
        <SwipeDismissView onDismiss={() => setView('packages')} background={<SubscriptionPackagesView />}>
          <SubscriptionCheckoutView />
        </SwipeDismissView>
      );
      case 'get_pass': return (
        <SwipeDismissView onDismiss={() => setView('packages')} background={<SubscriptionPackagesView />}>
          <SubscriptionGetPassView />
        </SwipeDismissView>
      );
      case 'passes': return (
        <SwipeDismissView onDismiss={() => setView('profile')} background={<ProfileView />}>
          <PassesView />
        </SwipeDismissView>
      );
      default: return <MapView />;
    }
  };

  return (
    <div className="app-layout">
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
      {!selectingOnMap && (
        <nav className="bottom-nav" aria-label="Main navigation">
          {MENU.map(({ id, label, icon: Icon }) => {
            const active = currentView === id ||
              (id === 'profile' && (currentView === 'edit_profile' || currentView === 'passes' || currentView === 'subscription' || currentView === 'get_pass')) ||
              (id === 'packages' && (currentView === 'checkout'));
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
            padding-bottom: 96px;
          }

          /* Floating pill nav */
          .bottom-nav {
            display: flex;
            align-items: center;
            justify-content: space-around;

            position: fixed;
            bottom: 20px;
            left: 12px;
            right: 12px;
            height: 64px;
            padding: 0 8px;

            background: rgba(10, 14, 24, 0.82);
            backdrop-filter: blur(20px) saturate(160%);
            -webkit-backdrop-filter: blur(20px) saturate(160%);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            box-shadow:
              0 4px 24px rgba(0, 0, 0, 0.45),
              0 1px 0 rgba(255,255,255,0.05) inset;
            z-index: 2000;
          }

          /* ── Individual tab button ─────────────── */
          .nav-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
            flex: 1;
            padding: 8px 0;
            min-height: 44px;
            min-width: 44px;

            background: none;
            border: none;
            cursor: pointer;
            border-radius: 14px;
            transition: transform 0.15s ease, color 0.2s ease;
            color: rgba(255, 255, 255, 0.45);
            -webkit-tap-highlight-color: transparent;
          }

          .nav-btn:active {
            transform: scale(0.92);
          }

          .nav-btn.active {
            color: #f59e0b;
          }

          /* ── Label ─────────────────────────────── */
          .nav-label {
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.02em;
            line-height: 1;
            margin-top: 2px;
          }
        }

        /* ── Tablet-specific refinements (iPad) ── */
        @media (min-width: 901px) and (max-width: 1180px) {
          .main-area {
            padding-bottom: 112px;
          }

          .bottom-nav {
            left: 32px;
            right: 32px;
            bottom: 24px;
            height: 72px;
            padding: 0 24px;
            border-radius: 28px;
          }

          .nav-btn {
            padding: 12px 0;
            min-height: 56px;
            min-width: 60px;
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