import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { BackgroundSyncPlugin, NetworkOnly, Serwist } from "serwist"; // Keeping imports as requested

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

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
  // --- Runtime Caching ---
  runtimeCaching: [
    // Include defaultCache for other runtime caching needs
    ...defaultCache
  ],
  // --- Fallbacks ---
  fallbacks: {
    entries: [
      {
        url: "/~offline", // Your offline fallback page
        matcher({ request }) {
          return request.destination === "document";
        }
      }
    ]
  }
});

// --- Explicitly Register Capture for Background Sync ---
// Using the 3-argument signature of registerCapture
serwist.registerCapture(
  // Matcher: Use a RegExp to match the path *only*
  /^\/api\/submit-offline$/, // Matches the exact path /api/submit-offline
  // Handler: NetworkOnly strategy with the Background Sync plugin
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  "POST"
);

serwist.addEventListeners();
