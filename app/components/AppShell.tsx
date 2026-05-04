'use client';
import Sidebar from './Sidebar';
import MapView from './MapView';
import BusTracker from './BusTracker';
import TripPlanner from './TripPlanner';
import ProfileView from './ProfileView';
import UserFavorites from './UserFavorites';
import useStore from '../store/useStore';
import { Map, Bus, Navigation, Star, User } from 'lucide-react';
import { translations } from '../store/translations';

export default function AppShell() {
  const currentView = useStore((state: any) => state.currentView);
  const setView = useStore((state: any) => state.setView);
  const isSidebarOpen = useStore((state: any) => state.isSidebarOpen);
  const language = useStore((state: any) => state.language);
  const t = translations[language] || translations.al;

  const MENU = [
    { id: 'map', label: t.map, icon: Map },
    { id: 'tracker', label: t.live_buses, icon: Bus },
    { id: 'planner', label: t.planner, icon: Navigation },
    { id: 'favorites', label: t.saved, icon: Star },
    { id: 'profile', label: t.profile, icon: User },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'map': return <MapView />;
      case 'tracker': return <BusTracker />;
      case 'planner': return <TripPlanner />;
      case 'profile': return <ProfileView />;
      case 'favorites': return <UserFavorites />;
      default: return <MapView />;
    }
  };

  return (
    <div className="app-layout">
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>

      <div className="main-area">
        {renderView()}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav" style={{
        position: 'fixed', bottom: '20px', left: '16px', right: '16px', height: '68px',
        background: 'rgba(10, 15, 26, 0.85)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 2000, display: 'none', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 10px',
      }}>
        {MENU.map(({ id, label, icon: Icon }) => (
          <button 
            key={id} 
            onClick={() => setView(id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              background: currentView === id ? 'rgba(59,130,246,0.1)' : 'transparent',
              borderRadius: '16px',
              border: 'none',
              color: currentView === id ? 'var(--primary)' : '#fff',
              cursor: 'pointer', transition: 'var(--transition)', flex: 1,
              padding: '6px 0',
              boxShadow: currentView === id ? '0 4px 12px rgba(59,130,246,0.2)' : 'none',
            }}
          >
            <Icon size={22} strokeWidth={currentView === id ? 2.5 : 2} />
            <span style={{ fontSize: '10px', fontWeight: '600' }}>{label}</span>
          </button>
        ))}
      </nav>

      <style jsx>{`
        @media (max-width: 900px) {
          .mobile-nav {
            display: flex !important;
          }
          .main-area {
            height: 100% !important;
            padding-bottom: 110px !important;
          }
          .sidebar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
