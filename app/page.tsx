'use client';
import { useEffect, useState } from 'react';
import useStore from './store/useStore';
import LoginPage from './components/auth/LoginPage';
import AppShell from './components/layout/AppShell';
import NotificationBar from './components/layout/NotificationBar';
import SplashScreen from './components/layout/SplashScreen';

import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();
  const [hasMounted, setHasMounted] = useState(false);
  const moveBuses = useStore((s: any) => s.moveBuses);
  const guestMode = useStore((s: any) => s.guestMode);
  const isAuthenticated = status === "authenticated" || guestMode;

  // Initial Data Load & Polling
  useEffect(() => {
    setHasMounted(true);

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

  // Simulation Movement (Disabled to use real DB data)
  /*
  useEffect(() => {
    if (!hasMounted) return;
    const interval = setInterval(() => {
      moveBuses();
    }, 100);
    return () => clearInterval(interval);
  }, [hasMounted, moveBuses]);
  */

  if (!hasMounted) return null;

  return (
    <>
      <SplashScreen />
      <NotificationBar />
      {isAuthenticated ? <AppShell /> : <LoginPage />}
    </>
  );
}
