import { defaultCache } from "@serwist/next/worker";
import { BackgroundSyncPlugin, NetworkOnly, Serwist, type PrecacheEntry, type SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

// --- Add a basic fetch listener for debugging ---
self.addEventListener("fetch", (event) => {
  const { request } = event as FetchEvent;
  // Log all fetch requests intercepted by the SW
  console.log(`[SW Debug] Intercepted fetch for: ${request.url}, Method: ${request.method}`);

  // Specifically log our target request
  if (request.url.includes("/api/submit-offline") && request.method === "POST") {
    console.log("[SW Debug] !!! Intercepted POST to /api/submit-offline !!!");
  }
});

// --- Background Sync Plugin ---
const bgSyncPlugin = new BackgroundSyncPlugin("offlineSubmissionsQueue", {
  maxRetentionTime: 24 * 60 // Retry for max 24 hours
});

// --- Serwist Configuration ---
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        }
      }
    ]
  }
});

// --- Explicitly Register Capture for Background Sync ---
serwist.registerCapture(
  /^\/api\/submit-offline$/, // Matches the exact path /api/submit-offline
  // Handler: NetworkOnly strategy with the Background Sync plugin
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  "POST"
);

serwist.addEventListeners();
