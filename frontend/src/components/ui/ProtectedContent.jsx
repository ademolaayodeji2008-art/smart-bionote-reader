/**
 * ProtectedContent
 *
 * Wrapper component that combines:
 *   1. useContentProtection — disables right-click, copy, drag, keyboard shortcuts
 *   2. ContentWatermark     — subtle repeating diagonal watermark
 *   3. CSS user-select: none — prevents text selection in supported browsers
 *   4. print CSS             — hides protected content from print dialog
 *
 * DISCLAIMER: These are practical deterrents. OS-level screenshots and screen
 * recording cannot be prevented by browser JavaScript. This is not a claim of
 * 100% screenshot prevention.
 *
 * Usage:
 *   <ProtectedContent email={user?.email}>
 *     <YourLessonContent />
 *   </ProtectedContent>
 *
 * Props:
 *   children  — content to protect
 *   email     — student email shown in watermark
 *   enabled   — boolean, default true (pass false to disable in dev/teacher preview)
 *   className — additional CSS classes
 */

import useContentProtection from "../../hooks/useContentProtection.js";
import ContentWatermark from "./ContentWatermark.jsx";

const ProtectedContent = ({ children, email, enabled = true, className = "" }) => {
  const containerRef = useContentProtection({ enabled });

  return (
    <>
      {/* Print protection — injected as a style tag */}
      {enabled && (
        <style>{`
          @media print {
            .protected-content {
              display: none !important;
            }
          }
        `}</style>
      )}

      <div
        ref={containerRef}
        className={`protected-content relative ${className}`}
        style={{
          userSelect: enabled ? "none" : undefined,
          WebkitUserSelect: enabled ? "none" : undefined,
          MozUserSelect: enabled ? "none" : undefined,
        }}
      >
        {/* Watermark sits above content but below interactive elements */}
        {enabled && <ContentWatermark email={email} />}

        {/* Actual content rendered on top of watermark */}
        <div className="relative z-20">
          {children}
        </div>
      </div>
    </>
  );
};

export default ProtectedContent;
