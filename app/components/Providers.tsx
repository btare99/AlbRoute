'use client';
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { SplashScreen } from "@capacitor/splash-screen";

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
      {children}
    </SessionProvider>
  );
}
