/**
 * documentService.js
 *
 * Handles Word document (.docx) upload and content extraction.
 *
 * What it does:
 *   1. Uploads the .docx file to Cloudinary (raw resource type) for storage
 *   2. Uses mammoth to extract:
 *      - Rich HTML (preserves bold, italic, headings, lists, tables)
 *      - Plain text (used by the Smart Reader SpeechSynthesis voice)
 *
 * PDF support:
 *   PDFs are stored on Cloudinary and displayed via an <iframe> embed.
 *   Text extraction from PDFs is not reliable (fails on scanned/image PDFs),
 *   so for PDFs we store the URL and let the teacher also provide plain text
 *   for the voice reader.
 *
 * Architecture:
 *   - Binary data is NEVER stored in MongoDB
 *   - MongoDB stores: Cloudinary URL, extracted HTML, extracted plain text
 *   - The frontend renders the HTML; the voice reads the plain text
 */

import mammoth from "mammoth";
import cloudinary from "../config/cloudinary.js";
import { AppError } from "../utils/AppError.js";

// ── Cloudinary upload helper ──────────────────────────────────────────────────

const uploadBufferToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(new AppError("Document upload to Cloudinary failed.", 500));
      resolve(result);
    });
    stream.end(buffer);
  });

// ── Word document processing ──────────────────────────────────────────────────

/**
 * Processes a .docx buffer:
 *   1. Uploads to Cloudinary
 *   2. Extracts HTML with mammoth (preserves formatting)
 *   3. Extracts plain text for TTS voice
 *
 * @param {Buffer} buffer - The .docx file buffer from multer
 * @param {string} lessonId - Used to organise Cloudinary folder
 * @returns {{ cloudinaryUrl, publicId, html, plainText, wordCount }}
 */
export const processWordDocument = async (buffer, lessonId) => {
  // Upload original .docx to Cloudinary for download/backup
  const cloudinaryResult = await uploadBufferToCloudinary(buffer, {
    folder: `smart-bionote-reader/lessons/${lessonId}/documents`,
    resource_type: "raw",
    format: "docx",
    access_mode: "public",
  });

  // Extract rich HTML from the .docx
  const htmlResult = await mammoth.convertToHtml(
    { buffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "b => strong",
        "i => em",
        "u => u",
      ],
    },
  );

  // Extract plain text for the SpeechSynthesis voice reader
  const textResult = await mammoth.extractRawText({ buffer });

  const html = htmlResult.value || "";
  const plainText = textResult.value || "";
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  // Log any mammoth warnings (non-fatal — formatting may be approximate)
  if (htmlResult.messages?.length) {
    console.info("[documentService] mammoth warnings:", htmlResult.messages.map((m) => m.message).join("; "));
  }

  return {
    cloudinaryUrl: cloudinaryResult.secure_url,
    publicId: cloudinaryResult.public_id,
    html,
    plainText,
    wordCount,
  };
};

/**
 * Deletes a document from Cloudinary by its publicId.
 * Called when a teacher replaces or deletes their lesson document.
 * Failures are logged but never re-thrown.
 */
export const deleteDocumentFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (err) {
    console.error("[documentService] Cloudinary delete failed:", err.message);
  }
};
