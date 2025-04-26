"use client";

import { useState, useEffect, useTransition } from "react";
// import { submitOfflineData } from "@/actions/submitOfflineData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export const OfflineForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const { toast } = useToast();

  // --- Network Status ---
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    updateOnlineStatus(); // Initial check
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  // --- Form Submission ---
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = { name, email };

    startSubmitTransition(async () => {
      if (!isOnline) {
        toast({
          title: "Offline",
          description: "Submission queued. Will send when online."
        });
      } else {
        toast({ title: "Submitting..." });
      }

      try {
        const response = await fetch("/api/submit-offline", {
          // Target the API route
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
          // Handle errors reported by the API route (including server action errors)
          throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }

        // Only show success if online submission was immediately successful
        if (isOnline) {
          toast({ title: "Success", description: result.success || "Submission successful!" });
          setName("");
          setEmail("");
        }
        // If offline, the earlier "queued" toast is sufficient feedback
      } catch (error) {
        console.error("Submission fetch error:", error);
        // If the fetch itself fails (e.g., network error caught before SW, though unlikely with SW)
        // or if the API route returns an error status.
        if (isOnline) {
          // Only show fetch error toast if user thought they were online
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Submission failed.",
            variant: "destructive"
          });
        }
        // If offline, the SW handles it, rely on the "queued" message.
      }
    });
  };

  return (
    <div className="space-y-6 p-4 border rounded-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold">Offline Test Form (Serwist Sync)</h2>
      <p>
        Status: <span className={isOnline ? "text-green-600" : "text-red-600"}>{isOnline ? "Online" : "Offline"}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
        </div>
        <div>
          <Label htmlFor="email">Email (Optional)</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Submit"}
        </Button>
      </form>
      <Toaster />
    </div>
  );
};
