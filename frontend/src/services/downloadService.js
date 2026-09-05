/**
 * downloadService.js
 *
 * Orchestrates downloading a lesson for offline use.
 *
 * Flow:
 * 1. Call backend /api/downloads/:lessonId to authorize + get full lesson data
 * 2. Fetch Cloudinary images/audio as blobs (so they work offline)
 * 3. Store everything in IndexedDB via offlineStorageService
 *
 * What is stored as blobs: cover image, drawing step images, drawing step audio
 * What is NOT downloaded: normal note TTS — browser SpeechSynthesis handles that
 * Binary data stored in IndexedDB — NOT in MongoDB or Cloudinary again
 */

import api from "./api.js";
import { saveDownloadedLesson, deleteDownloadedLesson } from "./offlineStorageService.js";

/** Fetches a URL and returns a Blob, or null on failure. */
const fetchBlob = async (url) => {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch {
    return null;
  }
};

/**
 * Downloads a lesson for offline access.
 * @param {string} lessonId
 * @param {Function} onProgress  - called with (percentage 0-100, statusText)
 * @returns {Promise<void>}
 */
export const downloadLesson = async (lessonId, onProgress = () => {}) => {
  onProgress(5, "Authorizing download…");

  // Step 1: Get authorized lesson data from backend
  const response = await api.post(`/downloads/${lessonId}`);
  const { lesson } = response.data.data;

  onProgress(20, "Downloading lesson content…");

  // Step 2: Fetch media blobs
  const mediaBlobs = { coverImage: null, steps: [] };

  if (lesson.coverImage?.url) {
    mediaBlobs.coverImage = await fetchBlob(lesson.coverImage.url);
    onProgress(35, "Downloading cover image…");
  }

  if (lesson.type === "drawing" && lesson.drawingSteps?.length > 0) {
    const stepCount = lesson.drawingSteps.length;
    for (let i = 0; i < stepCount; i++) {
      const step = lesson.drawingSteps[i];
      const stepBlob = {
        image: null,
        audio: null,
      };

      if (step.image?.url) {
        stepBlob.image = await fetchBlob(step.image.url);
      }
      // Teacher-recorded audio — drawing steps ONLY
      if (step.audio?.url) {
        stepBlob.audio = await fetchBlob(step.audio.url);
      }

      mediaBlobs.steps.push(stepBlob);
      const pct = 35 + Math.round(((i + 1) / stepCount) * 50);
      onProgress(pct, `Downloading step ${i + 1} of ${stepCount}…`);
    }
  }

  // Step 3: Save to IndexedDB
  onProgress(90, "Saving to device…");
  await saveDownloadedLesson(lesson, mediaBlobs);
  onProgress(100, "Download complete.");
};

/** Removes a downloaded lesson from the device. */
export const removeDownload = async (lessonId) => {
  await deleteDownloadedLesson(lessonId);
};

/** Authorizes download check without actually downloading (for UI state). */
export const checkDownloadAuthorization = async (lessonId) => {
  try {
    await api.post(`/downloads/${lessonId}`);
    return true;
  } catch {
    return false;
  }
};
