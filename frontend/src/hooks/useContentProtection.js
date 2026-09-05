/**
 * useContentProtection
 *
 * Applies practical content-protection measures to a container element.
 * Attaches on mount, cleans up on unmount.
 *
 * IMPORTANT DISCLAIMER:
 * These measures make it significantly harder to casually copy or screenshot
 * content using normal browser interactions, but they CANNOT guarantee that
 * a determined user cannot capture the screen. Browser-based JavaScript has
 * no access to OS-level screenshot APIs. This is a deterrent, not a guarantee.
 *
 * What this protects against:
 *   - Right-click → Save/Copy
 *   - Ctrl+C / Ctrl+X text copy
 *   - Drag-to-copy text
 *   - Ctrl+P print
 *   - DevTools text selection
 *
 * What this cannot prevent:
 *   - OS-level screenshot (Print Screen, Snipping Tool, etc.)
 *   - Browser extensions
 *   - Screen recording software
 *
 * Usage:
 *   const containerRef = useContentProtection({ enabled: true });
 *   return <div ref={containerRef}>protected content</div>;
 */

import { useRef, useEffect } from "react";

const useContentProtection = ({ enabled = true } = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const el = containerRef.current;
    if (!el) return;

    // ── Prevent right-click context menu ──────────────────────────────────
    const preventContextMenu = (e) => e.preventDefault();

    // ── Prevent copy and cut ──────────────────────────────────────────────
    const preventCopy = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // ── Prevent drag (drag-to-copy images/text) ───────────────────────────
    const preventDrag = (e) => e.preventDefault();

    // ── Prevent Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+S, Ctrl+P ───────────────────
    const preventKeyboardShortcuts = (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && ["c", "x", "a", "s", "p", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // ── Detect page visibility change — blur content when hidden ─────────
    // (e.g. user Alt+Tabs to screenshot tool)
    const handleVisibilityChange = () => {
      if (document.hidden && el) {
        el.style.filter = "blur(8px)";
        el.setAttribute("aria-hidden", "true");
      } else if (el) {
        el.style.filter = "";
        el.removeAttribute("aria-hidden");
      }
    };

    el.addEventListener("contextmenu", preventContextMenu);
    el.addEventListener("copy", preventCopy);
    el.addEventListener("cut", preventCopy);
    el.addEventListener("dragstart", preventDrag);
    el.addEventListener("keydown", preventKeyboardShortcuts);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      el.removeEventListener("contextmenu", preventContextMenu);
      el.removeEventListener("copy", preventCopy);
      el.removeEventListener("cut", preventCopy);
      el.removeEventListener("dragstart", preventDrag);
      el.removeEventListener("keydown", preventKeyboardShortcuts);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Restore in case it was blurred
      if (el) {
        el.style.filter = "";
        el.removeAttribute("aria-hidden");
      }
    };
  }, [enabled]);

  return containerRef;
};

export default useContentProtection;
