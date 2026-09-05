/**
 * offlineStorageService.js
 *
 * Manages all offline lesson storage using IndexedDB.
 * This is the ONLY place that reads/writes offline lesson data.
 *
 * Architecture:
 * - DB name:  smart-bionote-reader-offline
 * - Store:    downloaded_lessons  (key: lessonId)
 * - Store:    offline_progress    (key: lessonId)
 * - Store:    offline_settings    (key: key)
 *
 * What is stored:
 *   - Lesson metadata + content + drawingSteps (from API)
 *   - Cloudinary image/audio URLs (frontend fetches + stores blobs)
 *   - Download date + last sync date
 *
 * What is NEVER stored:
 *   - Passwords, JWT tokens, Cloudinary secrets
 *   - Payment secrets or subscription keys
 *   - Admin credentials
 */

const DB_NAME = "smart-bionote-reader-offline";
const DB_VERSION = 1;

const STORES = {
  LESSONS: "downloaded_lessons",
  PROGRESS: "offline_progress",
  SETTINGS: "offline_settings",
};

let dbInstance = null;

/** Opens (or reuses) the IndexedDB connection. */
const openDB = () => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.LESSONS)) {
        db.createObjectStore(STORES.LESSONS, { keyPath: "lessonId" });
      }
      if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
        db.createObjectStore(STORES.PROGRESS, { keyPath: "lessonId" });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: "key" });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = () => reject(new Error("Failed to open IndexedDB."));
  });
};

const tx = async (storeName, mode, fn) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = fn(store);
    if (request) {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } else {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    }
  });
};

// ── Downloaded Lessons ────────────────────────────────────────────────────────

/**
 * Saves a fully downloaded lesson to IndexedDB.
 * @param {Object} lesson - full lesson object from the API
 * @param {Object} mediaBlobs - { coverImage: blob|null, steps: [{ image: blob|null, audio: blob|null }] }
 */
export const saveDownloadedLesson = async (lesson, mediaBlobs = {}) => {
  const record = {
    lessonId: lesson._id,
    lesson,
    mediaBlobs,          // locally cached blobs for offline media display
    downloadedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };
  await tx(STORES.LESSONS, "readwrite", (store) => store.put(record));
};

/** Returns the offline record for a lesson, or null if not downloaded. */
export const getDownloadedLesson = async (lessonId) => {
  return tx(STORES.LESSONS, "readonly", (store) => store.get(lessonId));
};

/** Returns all downloaded lesson records. */
export const getAllDownloadedLessons = async () => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const transaction = db.transaction(STORES.LESSONS, "readonly");
    const store = transaction.objectStore(STORES.LESSONS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/** Returns true if the lesson is currently downloaded. */
export const isLessonDownloaded = async (lessonId) => {
  const record = await getDownloadedLesson(lessonId);
  return Boolean(record);
};

/** Removes a downloaded lesson from IndexedDB. */
export const deleteDownloadedLesson = async (lessonId) => {
  await tx(STORES.LESSONS, "readwrite", (store) => store.delete(lessonId));
};

/** Removes all downloaded lessons. */
export const deleteAllDownloads = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.LESSONS, "readwrite");
    const request = transaction.objectStore(STORES.LESSONS).clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// ── Offline Progress ──────────────────────────────────────────────────────────

export const saveOfflineProgress = async (lessonId, progressData) => {
  const record = {
    lessonId,
    ...progressData,
    updatedAt: new Date().toISOString(),
    synced: false,
  };
  await tx(STORES.PROGRESS, "readwrite", (store) => store.put(record));
};

export const getOfflineProgress = async (lessonId) => {
  return tx(STORES.PROGRESS, "readonly", (store) => store.get(lessonId));
};

export const getAllUnsyncedProgress = async () => {
  return new Promise(async (resolve, reject) => {
    const db = await openDB();
    const transaction = db.transaction(STORES.PROGRESS, "readonly");
    const store = transaction.objectStore(STORES.PROGRESS);
    const request = store.getAll();
    request.onsuccess = () => resolve((request.result || []).filter((p) => !p.synced));
    request.onerror = () => reject(request.error);
  });
};

export const markProgressSynced = async (lessonId) => {
  const existing = await getOfflineProgress(lessonId);
  if (existing) {
    await tx(STORES.PROGRESS, "readwrite", (store) => store.put({ ...existing, synced: true }));
  }
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const setSetting = async (key, value) => {
  await tx(STORES.SETTINGS, "readwrite", (store) => store.put({ key, value }));
};

export const getSetting = async (key) => {
  const record = await tx(STORES.SETTINGS, "readonly", (store) => store.get(key));
  return record?.value ?? null;
};

// ── Storage estimation ────────────────────────────────────────────────────────

/** Returns an estimated storage usage string (where browser APIs allow). */
export const estimateStorageUsage = async () => {
  if (!navigator?.storage?.estimate) return null;
  try {
    const { usage, quota } = await navigator.storage.estimate();
    return {
      usedMB: (usage / 1024 / 1024).toFixed(1),
      quotaMB: (quota / 1024 / 1024).toFixed(0),
      percentage: quota > 0 ? Math.round((usage / quota) * 100) : 0,
    };
  } catch {
    return null;
  }
};
