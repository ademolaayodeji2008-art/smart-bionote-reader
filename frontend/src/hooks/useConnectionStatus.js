/**
 * useConnectionStatus
 *
 * Tracks the browser's online/offline state and triggers offline progress
 * synchronization when the connection returns.
 *
 * Note: navigator.onLine is a hint, not a guarantee of actual internet access.
 * It reliably reports false when the device has no network interface active,
 * but may report true on a captive-portal or metered connection with no real
 * internet. We use it for the indicator only.
 */

import { useState, useEffect } from "react";
import { syncOfflineProgress } from "../services/syncService.js";

export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-sync pending offline progress when connection returns
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
