'use client';
import { useEffect } from 'react';
import useStore from './store/useStore';
import LoginPage from './components/LoginPage';
import AppShell from './components/AppShell';
import NotificationBar from './components/NotificationBar';
import SplashScreen from './components/SplashScreen';

export default function Page() {
  const isAuthenticated = useStore((s: any) => s.isAuthenticated);
  const moveBuses = useStore((s: any) => s.moveBuses);
  const syncBusesWithAdmin = useStore((s: any) => s.syncBusesWithAdmin);
  const adminBuses = useStore((s: any) => s.adminBuses);

  useEffect(() => {
    syncBusesWithAdmin();
  }, [adminBuses, syncBusesWithAdmin]);

  // Cross-tab synchronization: Listen for storage changes from Backoffice
  useEffect(() => {
    // Fetch initial data
    const loadInitialData = async () => {
      await useStore.getState().fetchAdminDrivers();
      await useStore.getState().fetchAdminInspectors();
      await useStore.getState().fetchAdminBuses();
      await useStore.getState().syncBusesWithAdmin();
      await useStore.getState().fetchBuses();
    };
    
    loadInitialData();

    // Polling për përditësimet e buseve çdo 5 sekonda
    const pollInterval = setInterval(async () => {
      await useStore.getState().fetchAdminBuses();
      await useStore.getState().syncBusesWithAdmin();
      await useStore.getState().fetchBuses();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      moveBuses();
    }, 100);
    return () => clearInterval(interval);
  }, [moveBuses]);

  return (
    <>
      <SplashScreen />
      <NotificationBar />
      {isAuthenticated ? <AppShell /> : <LoginPage />}
    </>
  );
}
