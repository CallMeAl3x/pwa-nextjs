import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { BackgroundSyncPlugin, NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

// --- Background Sync Plugin ---
// This plugin will queue failed POST requests and retry them when online.
// The queue name 'offlineSubmissionsQueue' must match what you expect.
const bgSyncPlugin = new BackgroundSyncPlugin("offlineSubmissionsQueue", {
  maxRetentionTime: 24 * 60 // Retry for max 24 hours (optional)
});

// --- Serwist Configuration ---
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  // --- Runtime Caching ---
  runtimeCaching: [
    // --- THIS IS THE CRUCIAL PART for offline form submission ---
    // Apply Background Sync to POST requests to our submission API endpoint
    {
      matcher: ({ url, request }) => url.pathname === "/api/submit-offline" && request.method === "POST", // Match POST requests to the API route
      handler: new NetworkOnly({
        // Use NetworkOnly strategy
        plugins: [bgSyncPlugin] // Apply the Background Sync plugin here
      })
    },
    // --- End of crucial part ---

    // Include defaultCache for other runtime caching needs (optional, adjust as needed)
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

// Make sure Serwist listeners are added
serwist.addEventListeners();
