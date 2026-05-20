'use client';
import { useEffect, useRef } from 'react';
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
import { Map, Bus, Navigation, Star, User, Ticket } from 'lucide-react';
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
    if (session?.user) {
      const u = session.user as any;
      if (u.role === 'user') {
        useStore.getState().login(u, 'next-auth-session');
        // Fetch full profile (with photos) from DB to supplement stripped JWT
        fetch(`/api/user/profile?userId=${u.id}`)
          .then(res => res.json())
          .then(data => {
            if (!data.error) {
              useStore.getState().login({ ...u, ...data }, 'next-auth-session');
            }
          })
          .catch(console.error);
      } else {
        useStore.getState().loginAsStaff(u);
      }

      // Zbulo Google login të ri nëpërmjet sessionStorage
      if (!googleLoginHandled.current && typeof window !== 'undefined') {
        const pending = sessionStorage.getItem('google_login_pending');
        if (pending === '1') {
          googleLoginHandled.current = true;
          sessionStorage.removeItem('google_login_pending');
          // Shfaq mirëseardhjen pasi Splash ka mbaruar
          setTimeout(() => {
            addNotification(
              language === 'al'
                ? `Mirë se erdhe, ${u.name?.split(' ')[0] || ''}! 👋`
                : `Welcome, ${u.name?.split(' ')[0] || ''}! 👋`,
              'success'
            );
          }, 500);
        }
      }
    }
  }, [session]);

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
    const fetchUserLocation = useStore.getState().fetchUserLocation;

    // Kërko lejen dhe përditëso vendndodhjen menjëherë sapo montohet AppShell (pas login)
    if (typeof window !== 'undefined' && navigator.geolocation) {
      fetchUserLocation();
    }

    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        fetchUserLocation();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const MENU = [
    { id: 'map', label: t.map, icon: Map },
    { id: 'tracker', label: t.live_buses, icon: Bus },
    { id: 'packages', label: t.packages, icon: Ticket },
    { id: 'profile', label: t.profile, icon: User },
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
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
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

        /* ── Mobile breakpoint ───────────────────── */
        @media (max-width: 900px) {
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
      `}</style>
    </div>
  );
}