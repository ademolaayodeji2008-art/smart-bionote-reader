/**
 * ContentModeSelector
 *
 * Lets the teacher choose between:
 *   "text"     — type/paste content directly in the editor
 *   "document" — upload a formatted Word (.docx) or PDF file
 *
 * Used in both TeacherCreateLesson and TeacherEditLesson.
 */

import { PenLine, Upload } from "lucide-react";

const MODES = [
  {
    value: "text",
    icon: PenLine,
    label: "Type content",
    desc: "Write or paste your lesson content directly. The Smart Reader will read it aloud.",
  },
  {
    value: "document",
    icon: Upload,
    label: "Upload document",
    desc: "Upload a formatted Word (.docx) or PDF. The app extracts the text for the reading voice.",
  },
];

const ContentModeSelector = ({ value, onChange }) => (
  <div>
    <p className="mb-3 text-sm font-medium text-text-strong">
      Content source <span className="text-danger ml-1" aria-hidden="true">*</span>
    </p>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {MODES.map(({ value: modeValue, icon: Icon, label, desc }) => {
        const isSelected = value === modeValue;
        return (
          <label
            key={modeValue}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
            }`}
          >
            <input
              type="radio"
              name="contentMode"
              value={modeValue}
              checked={isSelected}
              onChange={() => onChange(modeValue)}
              className="sr-only"
            />
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              isSelected ? "bg-primary text-white" : "bg-surface-muted text-text-muted"
            }`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-text-strong"}`}>
                {label}
              </p>
              <p className="text-xs mt-0.5 text-text-muted">{desc}</p>
            </div>
          </label>
        );
      })}
    </div>
  </div>
);

export default ContentModeSelector;
