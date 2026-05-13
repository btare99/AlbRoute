'use client';
import { useEffect, useState } from 'react';
import useStore from './store/useStore';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';
import StaffDashboard from './components/StaffDashboard';
import SplashScreen from './components/SplashScreen';

export default function BackofficeApp() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Wait for Zustand persist to rehydrate before rendering
  useEffect(() => {
    setHasHydrated(true);
    // Hide splash screen after 3.2 seconds to allow animation to complete
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  const isAuthenticated = useStore((state: any) => state.isAuthenticated);
  const currentAccount = useStore((state: any) => state.currentAccount);

  // Scroll to top on auth state change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isAuthenticated]);

  // Initial data load on mount
  useEffect(() => {
    const load = async () => {
      await useStore.getState().fetchAdminBuses();
      await useStore.getState().fetchAdminDrivers();
      await useStore.getState().fetchAdminInspectors();
      await useStore.getState().fetchAdminOperators();
    };
    load();

    // Poll buses every 10s (staff data less frequently)
    const busInterval = setInterval(() => {
      useStore.getState().fetchAdminBuses();
    }, 10000);

    return () => clearInterval(busInterval);
  }, []);

  // Prevent hydration mismatch — show splash or neutral loading until Zustand has rehydrated
  if (!hasHydrated || showSplash) {
    return (
      <>
        <SplashScreen isVisible={showSplash} />
        <div className="backoffice-shell">
          <main className="page-frame">
            <div className="page-loading">Duke ngarkuar...</div>
          </main>
        </div>
      </>
    );
  }

  // ── Not authenticated → Login ──────────────────────────────────────────────
  if (!isAuthenticated || !currentAccount) {
    return (
      <div className="backoffice-shell">
        <main className="page-frame page-content">
          <LoginPage />
        </main>
      </div>
    );
  }

  // ── Driver / Inspector → Read-only Staff Dashboard ─────────────────────────
  if (currentAccount.role === 'driver' || currentAccount.role === 'inspector') {
    return (
      <div className="backoffice-shell">
        <main className="page-frame page-content staff-dashboard-page">
          <StaffDashboard />
        </main>
      </div>
    );
  }

  // ── Dispatcher / Operator → Full Admin Panel ───────────────────────────────
  if (currentAccount.role === 'dispatcher' || currentAccount.role === 'operator') {
    return (
      <div className="backoffice-shell">
        <main className="page-frame admin-panel-frame page-content">
          <AdminPanel />
        </main>
      </div>
    );
  }

  // ── Unknown role / stale state → force back to Login ──────────────────────
  // This handles any edge case where role is unrecognized
  useStore.getState().logout();
  return (
    <div className="backoffice-shell">
      <main className="page-frame page-content">
        <LoginPage />
      </main>
    </div>
  );
}
