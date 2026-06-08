'use client';
import { useEffect, useState } from 'react';
import useStore from './store/useStore';
import LoginPage from './components/auth/LoginPage';
import AppShell from './components/layout/AppShell';
import NotificationBar from './components/layout/NotificationBar';

import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();
  const [hasMounted, setHasMounted] = useState(false);

  const moveBuses = useStore((s: any) => s.moveBuses);
  const staffUser = useStore((s: any) => s.staffUser);
  const guestMode = useStore((s: any) => s.guestMode);

  const isAuthenticated = status === "authenticated" || !!staffUser || guestMode;

  // Initial Data Load & Polling
  useEffect(() => {
    setHasMounted(true);

    // Reset transient UI state that might have been persisted or left in a bad state
    useStore.setState({
      selectedStop: null,
      selectedBus: null,
      selectedRoute: null,
      selectingOnMap: null,
      showTripDetails: false,
      isSidebarOpen: false
    });

    const loadInitialData = async () => {
      try {
        // Fetch real-time buses from the new MongoDB source
        await useStore.getState().fetchBuses();
      } catch (err) {
        console.error('Initial data load failed', err);
      }
    };

    loadInitialData();

    // The polling is now handled in AppShell for better view-specific control,
    // but we can keep a slow background refresh here if needed.
    const pollInterval = setInterval(async () => {
      await useStore.getState().fetchBuses();
    }, 15000);

    return () => clearInterval(pollInterval);
  }, []);

  if (!hasMounted || status === "loading") {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        background: '#0a0f1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img src="/logo.png" alt="Urbani Im Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} onError={(e) => {
            e.currentTarget.style.display = 'none';
          }} />
        </div>
        <div style={{
          width: '24px',
          height: '24px',
          border: '2.5px solid rgba(255,255,255,0.1)',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <NotificationBar />
      {isAuthenticated ? <AppShell /> : <LoginPage />}
    </>
  );
}

