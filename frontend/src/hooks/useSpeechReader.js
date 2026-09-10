/**
 * useSpeechReader — Smart Biology Reader hook
 *
 * Uses the browser's Web Speech API (SpeechSynthesis) to read lesson content
 * aloud. The teacher NEVER uploads a reading voice for normal notes — the
 * student's device provides the voice via SpeechSynthesis.
 *
 * Browser limitations:
 * - SpeechSynthesis.onboundary fires "word" events in Chrome/Edge but is
 *   unreliable or absent in Firefox and Safari.
 * - When word-level boundary events are unavailable, the hook falls back to
 *   sentence-level highlighting — it does NOT fake word timing.
 * - Voices load asynchronously; the hook exposes `voicesReady` to let the
 *   UI show a loading state.
 *
 * Synchronisation strategy:
 * 1. Split content into sentences (split on . ! ?).
 * 2. For each sentence, create a SpeechSynthesisUtterance.
 * 3. onstart → mark current sentence.
 * 4. onboundary (type==="word") → mark current word offset within sentence
 *    when the browser supports it.
 * 5. onend → advance to next sentence.
 * 6. Expose activeSentenceIdx and activeWordRange so the UI can highlight.
 */

import { useState, useEffect, useRef, useCallback } from "react";

/** Splits a text block into an array of non-empty sentence strings. */
const splitIntoSentences = (text) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Pre-processes Biology note text so the TTS voice reads it naturally.
 * Converts symbols and abbreviations into spoken equivalents before
 * passing to SpeechSynthesis.
 *
 * Examples:
 *   /        → " or "
 *   &        → " and "
 *   +        → " plus " (or "point" in decimal context)
 *   →        → " gives " (reaction arrows)
 *   ▬ ꭝ ∆ ¥ → stripped (bullet/list markers)
 *   %        → " percent"
 *   °C       → " degrees Celsius"
 *   e.g      → "for example"
 *   i.e      → "that is"
 *   etc.     → "et cetera"
 *   pH       → "P H"
 *   H2O      → "H 2 O"
 *   CO2      → "C O 2"
 *   NaCl     → "N a C l"
 *   HCl/HCL  → "hydrochloric acid"
 *   S.A      → "surface area"
 *   Numbers followed by fractions like 1&1/2 → "one and a half"
 */
const preprocessForSpeech = (text) => {
  if (!text) return "";

  return text
    // Common mixed fractions first (before & and / are replaced)
    .replace(/1&1\/2/g, "one and a half")
    .replace(/1\/2/g, "one half")
    .replace(/1\/4/g, "one quarter")
    .replace(/3\/4/g, "three quarters")
    // Chemical formulas
    .replace(/\bHCl\b/gi, "hydrochloric acid")
    .replace(/\bH2O\b/g, "H 2 O")
    .replace(/\bCO2\b/g, "C O 2")
    .replace(/\bO2\b/g, "O 2")
    .replace(/\bNaCl\b/g, "sodium chloride")
    .replace(/\bNaOH\b/g, "sodium hydroxide")
    .replace(/\bC6H12O6\b/g, "glucose")
    .replace(/\bATP\b/g, "A T P")
    .replace(/\bADP\b/g, "A D P")
    .replace(/\bDNA\b/g, "D N A")
    .replace(/\bRNA\b/g, "R N A")
    // Temperature
    .replace(/°C/g, " degrees Celsius")
    .replace(/°F/g, " degrees Fahrenheit")
    // Percentages
    .replace(/(\d+)%/g, "$1 percent")
    // pH
    .replace(/\bpH\b/g, "P H")
    // Abbreviations
    .replace(/\bS\.A\b/gi, "surface area")
    .replace(/\be\.g\.?/gi, "for example,")
    .replace(/\bi\.e\.?/gi, "that is,")
    .replace(/\betc\.?/gi, "et cetera")
    .replace(/\bvs\.?/gi, "versus")
    .replace(/\bapprox\.?/gi, "approximately")
    // Reaction arrows → "gives" or "produces"
    .replace(/→/g, " gives ")
    .replace(/->/g, " to ")
    .replace(/<-/g, " from ")
    .replace(/←/g, " is produced from ")
    .replace(/⇌/g, " is in equilibrium with ")
    // Symbols to words
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/\//g, " or ")
    .replace(/@/g, " at ")
    .replace(/=/g, " equals ")
    .replace(/</g, " is less than ")
    .replace(/>/g, " is greater than ")
    // Bullet and list markers — strip them, they're not spoken
    .replace(/[▬ꭝ∆¥►●•◆▸→◉★☆✓✗]/g, " ")
    .replace(/[+\-–—]{2,}/g, " ")   // repeated dashes/lines used as separators
    // Remove special Unicode characters used as bullet substitutes
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, " ")
    // Clean up excessive whitespace
    .replace(/\s{2,}/g, " ")
    .trim();
};

const DEFAULT_SETTINGS = {
  rate: 1,
  pitch: 1,
  volume: 1,
  voiceURI: null,
};

export const useSpeechReader = (content = "") => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
  const [activeWordRange, setActiveWordRange] = useState(null); // { start, end }
  const [voices, setVoices] = useState([]);
  const [voicesReady, setVoicesReady] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState(0); // 0–100

  const sentences = useRef([]);
  const currentIdxRef = useRef(0);
  const utteranceRef = useRef(null);
  const isCancelledRef = useRef(false);

  // ── Voice loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        setVoicesReady(true);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  // ── Split content when it changes ─────────────────────────────────────────
  useEffect(() => {
    // Pre-process the raw content to convert symbols to spoken words
    // before splitting into sentences for the TTS engine
    const processed = preprocessForSpeech(content);
    sentences.current = splitIntoSentences(processed);
    currentIdxRef.current = 0;
    setActiveSentenceIdx(-1);
    setActiveWordRange(null);
    setProgress(0);
  }, [content]);

  // ── Core utterance speaker ────────────────────────────────────────────────
  const speakSentence = useCallback(
    (idx) => {
      if (
        !window.speechSynthesis ||
        idx >= sentences.current.length ||
        isCancelledRef.current
      ) {
        setIsPlaying(false);
        setActiveSentenceIdx(-1);
        setActiveWordRange(null);
        setProgress(100);
        return;
      }

      const text = sentences.current[idx];
      const utter = new SpeechSynthesisUtterance(text);

      // Apply settings
      utter.rate = settings.rate;
      utter.pitch = settings.pitch;
      utter.volume = settings.volume;
      if (settings.voiceURI) {
        const match = voices.find((v) => v.voiceURI === settings.voiceURI);
        if (match) utter.voice = match;
      }

      utter.onstart = () => {
        setActiveSentenceIdx(idx);
        setActiveWordRange(null);
      };

      utter.onboundary = (event) => {
        // Only process word boundaries (not sentence boundaries)
        if (event.name !== "word") return;
        setActiveWordRange({ start: event.charIndex, end: event.charIndex + (event.charLength ?? 0) });
      };

      utter.onend = () => {
        if (isCancelledRef.current) return;
        const nextIdx = idx + 1;
        currentIdxRef.current = nextIdx;
        const pct = Math.round((nextIdx / sentences.current.length) * 100);
        setProgress(pct);
        speakSentence(nextIdx);
      };

      utter.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") return;
        console.warn("[useSpeechReader] Utterance error:", e.error);
        // Attempt to continue with the next sentence on error
        const nextIdx = idx + 1;
        currentIdxRef.current = nextIdx;
        speakSentence(nextIdx);
      };

      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, voices],
  );

  // ── Controls ──────────────────────────────────────────────────────────────
  const play = useCallback(
    (fromIdx = null) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      isCancelledRef.current = false;
      const startIdx = fromIdx ?? currentIdxRef.current;
      currentIdxRef.current = startIdx;
      setIsPlaying(true);
      setIsPaused(false);
      speakSentence(startIdx);
    },
    [speakSentence],
  );

  const pause = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    if (!window.speechSynthesis) return;
    isCancelledRef.current = true;
    window.speechSynthesis.cancel();
    currentIdxRef.current = 0;
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSentenceIdx(-1);
    setActiveWordRange(null);
    setProgress(0);
  }, []);

  const restart = useCallback(() => {
    isCancelledRef.current = false;
    play(0);
  }, [play]);

  const prevSentence = useCallback(() => {
    const next = Math.max(0, currentIdxRef.current - 1);
    play(next);
  }, [play]);

  const nextSentence = useCallback(() => {
    const next = Math.min(sentences.current.length - 1, currentIdxRef.current + 1);
    play(next);
  }, [play]);

  const jumpToSentence = useCallback(
    (idx) => {
      play(idx);
    },
    [play],
  );

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    // If currently playing, restart current sentence so new settings apply
    if (window.speechSynthesis?.speaking) {
      // settings ref will be updated on next render; restart triggers re-read
    }
  }, []);

  // Stop on unmount
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
    // State
    isPlaying,
    isPaused,
    activeSentenceIdx,
    activeWordRange,
    voices,
    voicesReady,
    settings,
    progress,
    sentences: sentences.current,
    totalSentences: sentences.current.length,
    currentSentenceIdx: currentIdxRef.current,
    isSpeechSupported: typeof window !== "undefined" && "speechSynthesis" in window,
    // Controls
    play,
    pause,
    resume,
    stop,
    restart,
    prevSentence,
    nextSentence,
    jumpToSentence,
    updateSettings,
  };
};
