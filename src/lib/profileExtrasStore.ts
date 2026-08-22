/**
 * Manual additions to the CV view (src/components/plataforma/CvView.tsx)
 * that have no source in the CV itself (src/lib/ai/cvExtractClient.ts's AI
 * extraction, or src/lib/cvParser.ts's synchronous regex fallback) — a
 * cover letter, extra links, extra experience/education entries, and
 * certificaciones the person types in by hand. sessionStorage-backed, same
 * demo-scope pattern as profileStore.ts/profilePhotoStore.ts.
 *
 * These are kept separate from (never merged into) the CV's own output —
 * that stays a pure, read-only reflection of the uploaded CV text; what's
 * typed in here is additive and rendered alongside it, so neither data
 * source is ever silently overwritten by the other.
 *
 * certificacionesManual is additive to the OTHER real certification
 * source, roadmapProgress.ts's completado courses (see CvView.tsx) — a
 * certificate the person uploads/types by hand (e.g. from outside
 * Coderhouse) next to the ones this app can actually verify by itself.
 */

export type ManualExperience = { puesto: string; empresa: string; fechas: string };
export type ManualLink = { label: string; url: string };
export type ManualCertification = { titulo: string; institucion: string };

export type ProfileExtras = {
  cartaPresentacion: string;
  experienciaManual: ManualExperience[];
  educacionManual: string[];
  destacadosManual: ManualLink[];
  certificacionesManual: ManualCertification[];
};

const STORAGE_KEY = "career-copilot-profile-extras";

const EMPTY: ProfileExtras = {
  cartaPresentacion: "",
  experienciaManual: [],
  educacionManual: [],
  destacadosManual: [],
  certificacionesManual: [],
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
