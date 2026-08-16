import * as pdfjsLib from "pdfjs-dist";
// Vite-friendly way to point pdf.js at its worker bundle: importing the
// worker file's URL lets Vite fingerprint/bundle it correctly instead of
// relying on a CDN or a path that only exists in node_modules.
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const MAX_CV_FILE_BYTES = 8 * 1024 * 1024; // 8MB — generous for a client-side parse,
// not constrained by Vercel's 4.5MB request-body limit since only the
// extracted text (not the file) ever leaves the browser.

// Below this many extracted characters, treat it as "couldn't really read
// this" — e.g. a scanned CV that's just an image with no real text layer.
const MIN_MEANINGFUL_CHARS = 40;

export type ExtractPdfResult =
  | { ok: true; text: string }
  | { ok: false; reason: "not-a-pdf" | "too-large" | "empty-or-scanned" | "parse-failed" };

export function validateCvFile(file: File): ExtractPdfResult | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return { ok: false, reason: "not-a-pdf" };
  if (file.size > MAX_CV_FILE_BYTES) return { ok: false, reason: "too-large" };
  return null; // passes validation
}

/** Extracts plain text from a PDF file, entirely in the browser. */
export async function extractPdfText(file: File): Promise<ExtractPdfResult> {
  const invalid = validateCvFile(file);
  if (invalid) return invalid;

  try {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    const pageTexts: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
      pageTexts.push(pageText);
    }

    const text = pageTexts.join("\n\n").replace(/\s+/g, " ").trim();
    if (text.length < MIN_MEANINGFUL_CHARS) {
      return { ok: false, reason: "empty-or-scanned" };
    }

    // Keep the prompt payload sane even for very long CVs.
    const MAX_CHARS = 12000;
    return { ok: true, text: text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + "…" : text };
  } catch (err) {
    console.error("[extractPdfText] failed:", err);
    return { ok: false, reason: "parse-failed" };
  }
}
