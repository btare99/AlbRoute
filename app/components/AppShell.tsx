'use client';
import Sidebar from './Sidebar';
import NotificationBar from './NotificationBar';
import MapView from './MapView';
import BusTracker from './BusTracker';
import TripPlanner from './TripPlanner';
import ProfileView from './ProfileView';
import UserFavorites from './UserFavorites';
import useStore from '../store/useStore';

import { Menu } from 'lucide-react';

export default function AppShell() {
  const currentView = useStore((state: any) => state.currentView);
  const isSidebarOpen = useStore((state: any) => state.isSidebarOpen);
  const setSidebarOpen = useStore((state: any) => state.setSidebarOpen);

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
      {/* Mobile Header Bar */}
      <div className="mobile-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', zIndex: 1500,
        display: 'none', alignItems: 'center', padding: '0 16px', gap: '12px'
      }}>
        <button 
          onClick={() => setSidebarOpen(true)}
          style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <Menu size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/AlbRouteLogo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
          <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>AlbRoute</h1>
        </div>
      </div>

      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>

      <div className="main-area">
        {renderView()}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .mobile-header {
            display: flex !important;
          }
          .main-area {
            padding-top: 64px;
          }
        }
      `}</style>
    </div>
  );
}
