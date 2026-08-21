/**
 * Profile avatar + cover photo, editable from Perfil (src/components/
 * plataforma/CvView.tsx) and read wherever the profile shows up elsewhere
 * (the Plan carrera map's trigger card, src/pages/Plataforma.tsx).
 *
 * There's no real photo to pull from anywhere — a CV's raw text (what
 * extractPdfText reads, see src/lib/pdf/extractPdfText.ts) doesn't carry a
 * headshot, and reliably extracting/cropping one from an arbitrary PDF
 * layout is its own hard problem, out of scope here. So this is a manual
 * upload instead: whatever the person picks, resized/compressed
 * client-side (resizeImageToDataUrl) before it's stored, since an
 * unprocessed phone photo can be several MB and sessionStorage has a real
 * quota. sessionStorage-backed, same demo-scope pattern as
 * profileStore.ts/roadmapProgress.ts — no upload, no backend, gone when
 * the tab closes.
 */

export type ProfilePhotos = {
  avatar: string | null;
  cover: string | null;
};

const STORAGE_KEY = "career-copilot-profile-photos";

export function loadProfilePhotos(): ProfilePhotos {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProfilePhotos) : { avatar: null, cover: null };
  } catch {
    return { avatar: null, cover: null };
  }
}

export function saveProfilePhotos(photos: ProfilePhotos) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

/** Resizes (max dimension `maxDim`, aspect preserved) and re-encodes as JPEG so a large upload doesn't blow sessionStorage's quota. */
export function resizeImageToDataUrl(file: File, maxDim: number, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round(height * (maxDim / width));
            width = maxDim;
          } else {
            width = Math.round(width * (maxDim / height));
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No pudimos procesar la imagen."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("No pudimos leer esa imagen."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("No pudimos leer ese archivo."));
    reader.readAsDataURL(file);
  });
}

/** A pleasant, brand-consistent default cover for everyone who hasn't uploaded their own — never a fabricated photo, just a gradient. */
export const DEFAULT_COVER_GRADIENT = "linear-gradient(120deg, #1a1a1a 0%, #3a2418 45%, #ff5a36 78%, #ff8a5c 100%)";
