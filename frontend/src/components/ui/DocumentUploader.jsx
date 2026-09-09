/**
 * DocumentUploader
 *
 * Handles Word (.docx) and PDF file selection + upload for lesson content.
 * Shows upload progress, success state, and error state.
 *
 * Props:
 *   lessonId        — required to call the upload API
 *   currentDocument — existing document from the lesson (if any)
 *   onSuccess       — called with the updated lesson data after successful upload
 *   disabled        — disables the uploader (e.g. lesson is archived)
 */

import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, XCircle, Loader2, FileType } from "lucide-react";
import Button from "./Button.jsx";
import ProgressBar from "./ProgressBar.jsx";
import { uploadLessonDocument } from "../../services/lessonService.js";

const ACCEPTED_TYPES = ".docx,.doc,.pdf";
const ACCEPTED_MIME = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/pdf",
];

const DocumentUploader = ({ lessonId, currentDocument, onSuccess, disabled = false }) => {
  const inputRef = useRef(null);
  const [uploadState, setUploadState] = useState("idle"); // idle | uploading | success | error
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [wordCount, setWordCount] = useState(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Client-side MIME validation
    if (!ACCEPTED_MIME.includes(file.type)) {
      setUploadState("error");
      setErrorMessage("Only Word documents (.docx) and PDF files are accepted.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadState("error");
      setErrorMessage("File is too large. Maximum size is 20 MB.");
      return;
    }

    setUploadState("uploading");
    setProgress(0);
    setErrorMessage(null);

    try {
      const res = await uploadLessonDocument(lessonId, file, (event) => {
        if (event.total) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      });

      setProgress(100);
      setUploadState("success");
      setWordCount(res.data?.wordCount ?? null);

      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setUploadState("error");
      setErrorMessage(err.response?.data?.message ?? "Upload failed. Please try again.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const isPdf = currentDocument?.type === "pdf";
  const isDocx = currentDocument?.type === "docx";

  return (
    <div className="space-y-4">
      {/* Current document status */}
      {currentDocument?.url && uploadState !== "success" && (
        <div className="flex items-center gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
          <FileType className="h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-small font-semibold text-secondary">
              {isDocx ? "Word document uploaded" : "PDF uploaded"}
            </p>
            <p className="text-caption mt-0.5">
              {isDocx
                ? "The lesson displays the formatted document. Voice reads extracted text."
                : "Students view the PDF directly. Add plain text below for the voice reader."}
            </p>
          </div>
          <a
            href={currentDocument.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-secondary hover:underline"
          >
            View
          </a>
        </div>
      )}

      {/* Upload dropzone */}
      {!disabled && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface-muted p-8 text-center transition-colors hover:border-primary/40 cursor-pointer"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          aria-label="Click or drag a Word or PDF file here to upload"
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {uploadState === "idle" && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Upload className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-body font-semibold text-text-strong">
                  {currentDocument?.url ? "Replace document" : "Upload document"}
                </p>
                <p className="text-small mt-1 text-text-muted">
                  Drag and drop, or click to browse
                </p>
                <p className="text-caption mt-1">
                  Word (.docx) or PDF · Max 20 MB
                </p>
              </div>
            </>
          )}

          {uploadState === "uploading" && (
            <div className="w-full max-w-xs space-y-3">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden="true" />
              <p className="text-small font-semibold text-primary">
                Uploading and processing…
              </p>
              <ProgressBar value={progress} showValue color="primary" />
              <p className="text-caption text-text-muted">
                Extracting text for the voice reader
              </p>
            </div>
          )}

          {uploadState === "success" && (
            <>
              <CheckCircle2 className="h-10 w-10 text-secondary" aria-hidden="true" />
              <div>
                <p className="text-body font-semibold text-secondary">Document processed!</p>
                {wordCount && (
                  <p className="text-small mt-1 text-text-muted">
                    {wordCount.toLocaleString()} words extracted for the voice reader.
                  </p>
                )}
                <p className="text-caption mt-1 text-text-muted">
                  Click to upload a different file
                </p>
              </div>
            </>
          )}

          {uploadState === "error" && (
            <>
              <XCircle className="h-10 w-10 text-danger" aria-hidden="true" />
              <div>
                <p className="text-body font-semibold text-danger">Upload failed</p>
                <p className="text-small mt-1 text-text-muted">{errorMessage}</p>
                <p className="text-caption mt-1 text-text-muted">Click to try again</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Info box — how it works */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1.5">
        <p className="text-small font-semibold text-primary">How document upload works</p>
        <ul className="text-small text-text-muted space-y-1">
          <li>• <strong>Word (.docx)</strong> — the app extracts your formatting (bold, italic, headings) and displays it exactly. The Smart Reader reads the extracted text aloud.</li>
          <li>• <strong>PDF</strong> — students see the PDF embedded in the page. Add plain text in the content box below for the reading voice.</li>
          <li>• You can switch back to typed content at any time.</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentUploader;
