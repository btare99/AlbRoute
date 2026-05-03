'use client';
import { useEffect } from 'react';
import useStore from './store/useStore';
import LoginPage from './components/LoginPage';
import AppShell from './components/AppShell';
import NotificationBar from './components/NotificationBar';

export default function Page() {
  const isAuthenticated = useStore((s: any) => s.isAuthenticated);
  const moveBuses = useStore((s: any) => s.moveBuses);

  useEffect(() => {
    const interval = setInterval(() => {
      moveBuses();
    }, 1500);
    return () => clearInterval(interval);
  }, [moveBuses]);

  return (
    <>
      <NotificationBar />
      {isAuthenticated ? <AppShell /> : <LoginPage />}
    </>
  );
}
