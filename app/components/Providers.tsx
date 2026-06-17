'use client';
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { SplashScreen } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";

// Monkey-patch window.fetch on native platforms to map relative paths to the hosted backend
if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const apiBase = (() => {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      if (origin && !origin.startsWith('capacitor://') && !origin.startsWith('http://localhost') && !origin.includes('://127.0.0.1')) {
        return origin;
      }
      return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.0.102:3000';
    })();
    const localhostBase = 'http://localhost:3000';
    
    const mapUrl = (urlStr: string): string => {
      // 1. Relative path starting with /
      if (urlStr.startsWith('/')) {
        return `${apiBase}${urlStr}`;
      }
      // 2. localhost dev server base
      if (urlStr.startsWith(localhostBase)) {
        return urlStr.replace(localhostBase, apiBase);
      }
      // 3. Current window location origin (e.g., capacitor://localhost or http://localhost)
      if (window.location.origin && urlStr.startsWith(window.location.origin)) {
        return urlStr.replace(window.location.origin, apiBase);
      }
      // 4. Hardcoded capacitor iOS origin
      const capIOS = 'capacitor://localhost';
      if (urlStr.startsWith(capIOS)) {
        return urlStr.replace(capIOS, apiBase);
      }
      // 5. Hardcoded capacitor Android origin (avoid matching localhost:3000 or similar ports)
      const capAndroid = 'http://localhost';
      if (urlStr.startsWith(capAndroid) && !urlStr.startsWith('http://localhost:')) {
        return urlStr.replace(capAndroid, apiBase);
      }
      return urlStr;
    };

    let finalInit = init;
    if (typeof input === 'string') {
      const mapped = mapUrl(input);
      if (mapped !== input || input.startsWith(apiBase)) {
        input = mapped;
        finalInit = { ...init, credentials: 'include' };
      }
    } else if (input instanceof URL) {
      const mapped = mapUrl(input.href);
      if (mapped !== input.href || input.href.startsWith(apiBase)) {
        input = new URL(mapped);
        finalInit = { ...init, credentials: 'include' };
      }
    } else if (input instanceof Request) {
      const url = input.url;
      const mapped = mapUrl(url);
      if (mapped !== url) {
        input = new Request(mapped, input);
        input = new Request(input, { credentials: 'include' });
      } else if (url.startsWith(apiBase)) {
        input = new Request(input, { credentials: 'include' });
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
