'use client';
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";

// Monkey-patch window.fetch on native platforms to map relative paths to the hosted backend
if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.0.111:3000'; // Fallback to local PC IP for testing
    const localhostBase = 'http://localhost:3000';
    
    let finalInit = init;
    if (typeof input === 'string') {
      if (input.startsWith('/')) {
        input = `${apiBase}${input}`;
        finalInit = { ...init, credentials: 'include' };
      } else if (input.startsWith(localhostBase)) {
        input = input.replace(localhostBase, apiBase);
        finalInit = { ...init, credentials: 'include' };
      } else if (input.startsWith(apiBase)) {
        finalInit = { ...init, credentials: 'include' };
      }
    } else if (input instanceof Request) {
      const url = input.url;
      if (url.startsWith('/')) {
        input = new Request(`${apiBase}${url}`, input);
        input = new Request(input, { credentials: 'include' });
      } else if (url.startsWith(window.location.origin)) {
        const relativePath = url.substring(window.location.origin.length);
        if (relativePath.startsWith('/')) {
          input = new Request(`${apiBase}${relativePath}`, input);
          input = new Request(input, { credentials: 'include' });
        }
      } else if (url.startsWith(localhostBase)) {
        const relativePath = url.substring(localhostBase.length);
        input = new Request(`${apiBase}${relativePath}`, input);
        input = new Request(input, { credentials: 'include' });
      } else if (url.startsWith(apiBase)) {
        input = new Request(input, { credentials: 'include' });
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/')) {
        input = new URL(`${apiBase}${input.pathname}${input.search}`);
        finalInit = { ...init, credentials: 'include' };
      } else if (input.href.startsWith(localhostBase)) {
        const relativePath = input.href.substring(localhostBase.length);
        input = new URL(`${apiBase}${relativePath}`);
        finalInit = { ...init, credentials: 'include' };
      } else if (input.href.startsWith(apiBase)) {
        finalInit = { ...init, credentials: 'include' };
      }
    }
    return originalFetch(input, finalInit);
  };
}

import { ErrorBoundary } from "./common/ErrorBoundary";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
      } catch (error) {
        // SplashScreen plugin not available or error occurred
      }
    };

    hideSplash();
  }, []);

  return (
    <SessionProvider>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </SessionProvider>
  );
}
