/**
 * ConnectionStatus — shows online/offline/syncing state.
 * Uses useConnectionStatus hook which also auto-syncs offline progress on reconnect.
 */

import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { useConnectionStatus } from "../../hooks/useConnectionStatus.js";

const ConnectionStatus = ({ className = "" }) => {
  const { isOnline, isSyncing, lastSyncResult } = useConnectionStatus();

  if (isOnline && !isSyncing && !lastSyncResult) return null; // no banner when fully online and idle

  if (!isOnline) {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent ${className}`}
        role="status" aria-live="polite">
        <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
        Offline — studying downloaded content
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary ${className}`}
        role="status" aria-live="polite">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Syncing progress…
      </div>
    );
  }

  if (lastSyncResult && lastSyncResult.synced > 0) {
    return (
      <div className={`flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary ${className}`}
        role="status" aria-live="polite">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Progress synced
      </div>
    );
  }

  return null;
};

export default ConnectionStatus;
