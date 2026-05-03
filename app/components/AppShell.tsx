'use client';
import Sidebar from './Sidebar';
import NotificationBar from './NotificationBar';
import MapView from './MapView';
import BusTracker from './BusTracker';
import TripPlanner from './TripPlanner';
import ProfileView from './ProfileView';
import UserFavorites from './UserFavorites';
import useStore from '../store/useStore';

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
    </div>
  );
}
