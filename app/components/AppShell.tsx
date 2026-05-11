'use client';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import MapView from './MapView';
import BusTracker from './BusTracker';
import TripPlanner from './TripPlanner';
import ProfileView from './ProfileView';
import UserFavorites from './UserFavorites';
import EditProfileView from './EditProfileView';
import SubscriptionView from './SubscriptionView';
import SubscriptionPackagesView from './SubscriptionPackagesView';
import SubscriptionCheckoutView from './SubscriptionCheckoutView';
import SubscriptionGetPassView from './SubscriptionGetPassView';
import PassesView from './PassesView';
import useStore from '../store/useStore';
import { Map, Bus, Navigation, Star, User, Ticket } from 'lucide-react';
import { translations } from '../store/translations';
import SwipeBackView from './SwipeBackView';

export default function AppShell() {
  const currentView = useStore((state: any) => state.currentView);
  const setView = useStore((state: any) => state.setView);
  const isSidebarOpen = useStore((state: any) => state.isSidebarOpen);
  const language = useStore((state: any) => state.language);
  const fetchBuses = useStore((state: any) => state.fetchBuses);
  const t = translations[language] || translations.al;

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

  const MENU = [
    { id: 'map', label: t.map, icon: Map },
    { id: 'tracker', label: t.live_buses, icon: Bus },
    { id: 'planner', label: t.planner, icon: Navigation },
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
        <SwipeBackView onBack={() => setView('profile')} background={<ProfileView />}>
          <UserFavorites />
        </SwipeBackView>
      );
      case 'edit_profile': return (
        <SwipeBackView onBack={() => setView('profile')} background={<ProfileView />}>
          <EditProfileView />
        </SwipeBackView>
      );
      case 'subscription': return (
        <SwipeBackView onBack={() => setView('profile')} background={<ProfileView />}>
          <SubscriptionView />
        </SwipeBackView>
      );
      case 'packages': return <SubscriptionPackagesView />;
      case 'checkout': return (
        <SwipeBackView onBack={() => setView('packages')} background={<SubscriptionPackagesView />}>
          <SubscriptionCheckoutView />
        </SwipeBackView>
      );
      case 'get_pass': return (
        <SwipeBackView onBack={() => setView('packages')} background={<SubscriptionPackagesView />}>
          <SubscriptionGetPassView />
        </SwipeBackView>
      );
      case 'passes': return (
        <SwipeBackView onBack={() => setView('profile')} background={<ProfileView />}>
          <PassesView />
        </SwipeBackView>
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
      <nav className="bottom-nav" aria-label="Main navigation">
        {MENU.map(({ id, label, icon: Icon }) => {
          const active = currentView === id ||
            (id === 'profile' && (currentView === 'edit_profile' || currentView === 'passes')) ||
            (id === 'packages' && (currentView === 'subscription' || currentView === 'checkout' || currentView === 'get_pass'));
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