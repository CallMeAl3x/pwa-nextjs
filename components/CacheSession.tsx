// filepath: d:\auth-boilerplate - Copy\components\CacheSession.tsx
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const CacheSession = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Ensure service worker is ready and we have a session to cache
    if (status === "authenticated" && session && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        action: "cache-session",
        sessionData: session.user // Send only the user part of the session
      });
    }
  }, [session, status]); // Re-run when session or status changes

  return null; // This component doesn't render anything visible
};

export default CacheSession;
