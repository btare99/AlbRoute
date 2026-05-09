'use client';
import { useEffect, useState } from 'react';
import useStore from './store/useStore';
import LoginPage from './components/LoginPage';
import AppShell from './components/AppShell';
import NotificationBar from './components/NotificationBar';
import SplashScreen from './components/SplashScreen';

export default function Page() {
  const [hasMounted, setHasMounted] = useState(false);
  const isAuthenticated = useStore((s: any) => s.isAuthenticated);
  const moveBuses = useStore((s: any) => s.moveBuses);

  // Initial Data Load & Polling
  useEffect(() => {
    setHasMounted(true);

    const loadInitialData = async () => {
      try {
        await useStore.getState().fetchAdminDrivers();
        await useStore.getState().fetchAdminInspectors();
        await useStore.getState().fetchAdminBuses();
        await useStore.getState().syncBusesWithAdmin();
        await useStore.getState().fetchBuses();
      } catch (err) {
        console.error('Initial data load failed', err);
      }
    };

    loadInitialData();

    const pollInterval = setInterval(async () => {
      await useStore.getState().fetchAdminBuses();
      await useStore.getState().syncBusesWithAdmin();
      await useStore.getState().fetchBuses();
    }, 10000); // Polling every 10s to be safer

    return () => clearInterval(pollInterval);
  }, []);

  // Simulation Movement
  useEffect(() => {
    if (!hasMounted) return;
    const interval = setInterval(() => {
      moveBuses();
    }, 100);
    return () => clearInterval(interval);
  }, [hasMounted, moveBuses]);

  if (!hasMounted) return null;

  return (
    <>
      <SplashScreen />
      <NotificationBar />
      {isAuthenticated ? <AppShell /> : <LoginPage />}
    </>
  );
}
