"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const CacheSession = () => {
  const { data: session } = useSession();

  useEffect(() => {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      if (session) {
        navigator.serviceWorker.controller.postMessage({
          action: "cache-session",
          sessionData: session
        });
      }
    }
  }, [session]);

  return null; // This component doesn't render anything
};

export default CacheSession;
