"use client";

import Link from "next/link";
import { useState } from "react";

// Define a more specific type for the serwist object on the window
interface SerwistPayload {
  action: string;
  // Use unknown instead of any for better type safety
  [key: string]: unknown;
}

interface SerwistAPI {
  messageSW: (payload: SerwistPayload) => Promise<boolean>;
}

declare global {
  interface Window {
    // Use the specific type instead of any
    serwist: SerwistAPI;
  }
}

export default function Page() {
  const [isComplete, setIsComplete] = useState(false);

  const cacheContent = async () => {
    // Ensure window.serwist exists before calling messageSW
    if (window.serwist) {
      try {
        const res = await window.serwist.messageSW({ action: "cache-on-demand" });
        setIsComplete(res);
      } catch (error) {
        console.error("Error sending message to service worker:", error);
        // Optionally, set an error state here
      }
    } else {
      console.error("Serwist is not available on the window object.");
      // Optionally, set an error state here
    }
  };

  return (
    <div>
      <h1>Cache content on demand!</h1>
      <p>Clicking the button will cache an image available at &apos;images/cache-me-outside.jpg&apos;</p>
      <p>
        Try clicking it, and then navigating to the image page when you are offline. The page is prefetched and the image is
        cached so you will be able to see it.
      </p>
      <button onClick={cacheContent} className="mt-2">
        Cache an image
      </button>
      {isComplete && (
        <>
          <p>Image cached!</p>
          <span>
            Go offline and navigate to{" "}
            <Link href="/cache-on-demand/cached" className="inline-block">
              image page
            </Link>
          </span>
        </>
      )}
    </div>
  );
}
