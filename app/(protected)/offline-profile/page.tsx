"use client";

import { UserInfo } from "@/components/auth/user-info";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect, useState } from "react";
import { ExtendedUser } from "@/next-auth"; // Import the ExtendedUser type

const OfflineProfilePage = () => {
  const currentUser = useCurrentUser(); // Get user from client-side hook
  const [cachedUser, setCachedUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    caches
      .open("session")
      .then((cache) => cache.match("session-data"))
      .then((response) => {
        if (response) {
          return response.json();
        }
        return null;
      })
      .then((data) => {
        if (data) {
          setCachedUser(data);
        }
      })
      .catch((err) => console.error("Error reading session cache:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Prefer live data if available, otherwise show cached data
  const userToShow = currentUser || cachedUser;

  if (isLoading) {
    return <p>Loading user information...</p>;
  }

  if (!userToShow) {
    return <p>Could not load user information. You might be offline and no cached data is available.</p>;
  }

  return <UserInfo user={userToShow} label="👤 Offline Profile" />;
};

export default OfflineProfilePage;
