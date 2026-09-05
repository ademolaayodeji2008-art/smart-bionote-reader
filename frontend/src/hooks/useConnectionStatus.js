/**
 * useConnectionStatus
 *
 * Tracks the browser's online/offline state and triggers offline progress
 * synchronization when the connection returns.
 *
 * Fix: navigator.onLine can falsely return false in PWA/service-worker
 * context on page load. We start as "online" and only flip to offline
 * when the browser fires the "offline" event — which is reliable.
 * We never trust navigator.onLine=false on initial mount.
 */

import { useState, useEffect } from "react";
import { syncOfflineProgress } from "../services/syncService.js";

export const useConnectionStatus = () => {
  // Always start as online — don't trust navigator.onLine on mount
  // because PWA service workers can cause a false offline reading briefly
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  useEffect(() => {
    // Only set offline if navigator explicitly says so after a real event
    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      try {
        const result = await syncOfflineProgress();
        setLastSyncResult(result);
      } catch {
        setLastSyncResult(null);
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, isSyncing, lastSyncResult };
};
