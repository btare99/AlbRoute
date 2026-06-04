'use client';
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";

// Monkey-patch window.fetch on native platforms to map relative paths to the hosted backend
if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.0.101:3001'; // Fallback to local PC IP for testing
    
    if (typeof input === 'string') {
      if (input.startsWith('/')) {
        input = `${apiBase}${input}`;
      }
    } else if (input instanceof Request) {
      const url = input.url;
      if (url.startsWith('/')) {
        input = new Request(`${apiBase}${url}`, input);
      } else if (url.startsWith(window.location.origin)) {
        const relativePath = url.substring(window.location.origin.length);
        if (relativePath.startsWith('/')) {
          input = new Request(`${apiBase}${relativePath}`, input);
        }
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/')) {
        input = new URL(`${apiBase}${input.pathname}${input.search}`);
      }
    }
    return originalFetch(input, init);
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
