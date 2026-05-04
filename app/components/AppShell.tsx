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
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setSidebarOpen(true)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1500,
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          color: '#fff',
          display: 'none', // Shown only on mobile via media query or JS
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        className="mobile-hamburger"
      >
        <Menu size={24} />
      </button>

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
          .mobile-hamburger {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
