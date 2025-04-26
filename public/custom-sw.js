// filepath: d:\auth-boilerplate - Copy\public\custom-sw.js
const CACHE_NAME = "offline-cache-v1";
const OFFLINE_URL = "/~offline"; // Assuming you have an offline fallback page
const OFFLINE_PROFILE_URL = "/offline-profile";

// --- Installation: Cache essential assets and the offline profile page ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Add other essential assets if needed (e.g., CSS, fonts)
      await cache.addAll([OFFLINE_URL, OFFLINE_PROFILE_URL]);
      console.log("Offline profile page cached during install.");
    })()
  );
  self.skipWaiting(); // Activate worker immediately
});

// --- Activation: Clean up old caches ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if available
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
      // Delete old caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
    })()
  );
  self.clients.claim(); // Take control of clients immediately
});

// --- Message Listener for Caching Session ---
self.addEventListener("message", async (event) => {
  if (event.data.action === "cache-session") {
    const cache = await caches.open("session"); // Use a dedicated cache for session
    const sessionData = event.data.sessionData;

    if (sessionData) {
      try {
        // Store the session data under a specific key
        await cache.put("session-data", new Response(JSON.stringify(sessionData)));
        console.log("Session data cached successfully via message.");
      } catch (error) {
        console.error("Error caching session data:", error);
      }
    } else {
      console.warn("No session data provided to cache via message.");
    }
  }

  // Handle other messages like cache-on-demand if needed
  if (event.data.action === "cache-on-demand") {
    // Your existing cache-on-demand logic
    const cache = await caches.open("static-image-assets");
    const isCached = await cache.match("images/cache-me-outside.jpg");
    if (!isCached) {
      try {
        const res = await fetch("images/cache-me-outside.jpg");
        await cache.put("images/cache-me-outside.jpg", res);
        console.log("Cached image on demand.");
      } catch (error) {
        console.error("Failed to cache image on demand:", error);
      }
    }
    // Respond to the client if necessary (ensure event.ports[0] exists)
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage(true);
    }
  }
});

// --- Fetch Listener: Serve cached assets/pages when offline ---
self.addEventListener("fetch", (event) => {
  // Only handle navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Try network first (with navigation preload if enabled)
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // Network failed, try the cache
          console.log("Fetch failed; returning offline page instead.", error);
          const cache = await caches.open(CACHE_NAME);
          // Serve the specific offline page if it's cached, otherwise the general offline fallback
          const cachedResponse = (await cache.match(event.request.url)) || (await cache.match(OFFLINE_URL));
          return cachedResponse;
        }
      })()
    );
  }
  // For non-navigation requests (like CSS, JS, images), you might want a cache-first or network-first strategy
  // Example: Cache-first for other assets (adjust cache name as needed)
  // else {
  //   event.respondWith(
  //     caches.match(event.request).then((cachedResponse) => {
  //       return cachedResponse || fetch(event.request);
  //     })
  //   );
  // }
});
