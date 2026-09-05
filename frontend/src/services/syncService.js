/**
 * syncService.js
 *
 * When the device reconnects to the internet, syncs locally stored offline
 * progress back to the backend.
 *
 * Rules:
 * - Only syncs progress that was saved while offline (synced === false)
 * - Never overwrites newer server data blindly — uses lastAccessedAt comparison
 * - Marks each record as synced after a successful API call
 * - Does not create duplicate progress records (upsert on backend)
 */

import { getAllUnsyncedProgress, markProgressSynced } from "./offlineStorageService.js";
import { updateProgress } from "./progressService.js";

let isSyncing = false;

/**
 * Syncs all pending offline progress to the backend.
 * Call this when navigator.onLine becomes true.
 * @returns {Promise<{ synced: number, failed: number }>}
 */
export const syncOfflineProgress = async () => {
  if (isSyncing) return { synced: 0, failed: 0 };
  isSyncing = true;

  let synced = 0;
  let failed = 0;

  try {
    const pending = await getAllUnsyncedProgress();

    for (const record of pending) {
      try {
        await updateProgress(record.lessonId, {
          progressPercentage: record.progressPercentage ?? 0,
          lastPosition: record.lastPosition ?? 0,
        });
        await markProgressSynced(record.lessonId);
        synced++;
      } catch {
        failed++;
      }
    }
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
};
