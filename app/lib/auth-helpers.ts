import { signOut, getCsrfToken } from "next-auth/react";
import { Capacitor } from "@capacitor/core";

export async function safeSignOut() {
  if (Capacitor.isNativePlatform()) {
    try {
      const csrfToken = await getCsrfToken();
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          csrfToken: csrfToken || "",
          callbackUrl: "/",
          json: "true",
        }),
      });
      
      // Clear localStorage or other cached session indicators
      if (typeof window !== "undefined") {
        localStorage.removeItem("explicit_logout");
        window.location.reload();
      }
    } catch (e) {
      console.error("[safeSignOut] Error during native signout fetch:", e);
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  } else {
    await signOut({ redirect: false });
  }
}
