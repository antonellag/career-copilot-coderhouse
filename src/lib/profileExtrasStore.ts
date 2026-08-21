/**
 * Manual additions to the CV view (src/components/plataforma/CvView.tsx)
 * that have no source in the parsed CV text (src/lib/cvParser.ts) — a
 * cover letter, extra links, and extra experience/education entries the
 * person types in by hand. sessionStorage-backed, same demo-scope pattern
 * as profileStore.ts/profilePhotoStore.ts.
 *
 * These are kept separate from (never merged into) the CV parser's own
 * output — the parser's arrays stay a pure, read-only reflection of the
 * uploaded CV text; what's typed in here is additive and rendered
 * alongside it, so neither data source is ever silently overwritten by
 * the other.
 */

export type ManualExperience = { puesto: string; empresa: string; fechas: string };
export type ManualLink = { label: string; url: string };

export type ProfileExtras = {
  cartaPresentacion: string;
  experienciaManual: ManualExperience[];
  educacionManual: string[];
  destacadosManual: ManualLink[];
};

const STORAGE_KEY = "career-copilot-profile-extras";

const EMPTY: ProfileExtras = {
  cartaPresentacion: "",
  experienciaManual: [],
  educacionManual: [],
  destacadosManual: [],
};

export function loadProfileExtras(): ProfileExtras {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<ProfileExtras>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function saveProfileExtras(extras: ProfileExtras) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(extras));
}
