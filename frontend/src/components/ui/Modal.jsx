import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import IconButton from "./IconButton.jsx";

/** Accessible modal dialog rendered in a portal, closable via Escape or the overlay. */
const Modal = ({ open, onClose, title, children, className = "" }) => {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-dark/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`animate-scale-in relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl ${className}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && (
            <h2 id="modal-title" className="text-h3">
              {title}
            </h2>
          )}
          <IconButton icon={X} label="Close dialog" onClick={onClose} className="-mr-2 -mt-2 shrink-0" />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
