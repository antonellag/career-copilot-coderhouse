import { Camera, Plus, Sliders, UserRound, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Roadmap } from "@/lib/ai/roadmapClient";
import { parseCv } from "@/lib/cvParser";
import { DEFAULT_COVER_GRADIENT, loadProfilePhotos, resizeImageToDataUrl, saveProfilePhotos } from "@/lib/profilePhotoStore";
import { loadProfileInput } from "@/lib/profileStore";
import type { CourseStatus } from "@/lib/roadmapProgress";

/**
 * PARTE A/B — the auto-built CV. Reads whatever /limbo handed off
 * (src/lib/profileStore.ts: the uploaded CV's raw text, or — if no CV —
 * the person's own chat answers plus the roadmap's AI-written trigger
 * summary as a fallback "Resumen") and renders it into one standard
 * template via src/lib/cvParser.ts's plain heuristic extraction. No AI
 * rewrite happens here.
 *
 * Profile header banner/avatar/name-role card, and each section's rounded
 * card container + SectionHeader treatment, aligned to the Figma Make
 * reference's ProfileDesktop. NOT copied from it: the "Destacado" block
 * (portfolio links) — that's what the Portfolio tab already is, with real
 * projects, so duplicating it here with the reference's placeholder Behance
 * links/images would just be fake content; the fake company/school/badge
 * thumbnail images (imgJob1, imgCert1Badge, etc.) — no real images exist
 * for this data, so none render; and "location" in the header — no real
 * location was ever collected, so only name + current role show, both
 * real (CV parse).
 *
 * Avatar + cover photo (src/lib/profilePhotoStore.ts) are editable HERE —
 * this is the one place that writes them — and read read-only wherever
 * else the profile shows up (the Plan carrera map's trigger card). Real
 * feedback: a CV's raw text has no photo to pull from (extracting one
 * reliably from an arbitrary PDF layout is its own hard problem, out of
 * scope), so this is a manual upload instead of anything automatic; the
 * default cover (DEFAULT_COVER_GRADIENT) is a plain gradient, never a
 * fabricated stock photo standing in for a real one.
 *
 * "Certificaciones Coderhouse" (PARTE B) isn't separately stored — it's
 * derived live from the same roadmap progress state the node map writes to
 * (src/lib/roadmapProgress.ts): any course at "completado" becomes a line
 * here, dated from when it was marked complete. Mark a course complete on
 * the map, switch to this tab, it's already there.
 *
 * `roadmap` is null when /limbo's "Omitir test" shortcut skipped the
 * conversation entirely (src/pages/Plataforma.tsx's doc comment) — every
 * roadmap-derived field just falls back to nothing (no trigger summary, no
 * certifications) instead of crashing; parseCv(null, null) already returns
 * a fully empty-but-safe CV on its own.
 */
export function CvView({
  roadmap,
  getStatus,
  getCompletedAt,
}: {
  roadmap: Roadmap | null;
  getStatus: (id: string) => CourseStatus;
  getCompletedAt: (id: string) => string | undefined;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [photos, setPhotos] = useState(() => loadProfilePhotos());
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async (kind: "avatar" | "cover", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file, kind === "avatar" ? 300 : 1200);
      const next = { ...photos, [kind]: dataUrl };
      setPhotos(next);
      saveProfilePhotos(next);
    } catch {
      // Best-effort — an unreadable file just leaves the existing photo (or default) in place.
    }
  };

  // trigger no longer has one single "resumen" string (it's now split into
  // topic sections for the map's trigger node) — combine the two closest
  // ones as this fallback's equivalent when there's no CV to parse.
  const fallbackResumen = useMemo(
    () => (roadmap ? [roadmap.trigger.experiencia, roadmap.trigger.habilidades].filter(Boolean).join(" ") : null),
    [roadmap],
  );
  const cv = useMemo(() => parseCv(loadProfileInput(), fallbackResumen), [fallbackResumen]);
  const currentRole = cv.experiencia[0]?.puesto ?? null;

  const certifications = (roadmap?.nodos ?? [])
    .filter((n) => getStatus(n.id) === "completado")
    .map((n) => ({ nombre: n.curso.nombre, fecha: getCompletedAt(n.id) }))
    .sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""));

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Profile header card — cover + avatar are both editable here, the
            one place that writes src/lib/profilePhotoStore.ts (see the
            module doc comment for why there's no automatic photo). */}
        <div className="mb-4 overflow-hidden rounded-[20px] border border-border-soft bg-white">
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect("cover", e)} />
          <div
            className="group relative h-[110px] cursor-pointer"
            style={{ background: photos.cover ? undefined : DEFAULT_COVER_GRADIENT }}
            onClick={() => coverInputRef.current?.click()}
          >
            {photos.cover && <img src={photos.cover} alt="" className="h-full w-full object-cover" />}
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 font-['Inter:Regular',sans-serif] text-xs text-white opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
              <Camera className="h-3.5 w-3.5" />
              Cambiar portada
            </div>
          </div>
          <div className="relative flex items-start justify-between gap-4 px-7 pb-6">
            <div className="flex items-start gap-4">
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect("avatar", e)} />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Cambiar foto de perfil"
                className="group relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-ink/10 text-ink-muted"
                style={{ width: 88, height: 88, marginTop: -44 }}
              >
                {photos.avatar ? (
                  <img src={photos.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-8 w-8" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </button>
              <div className="pt-2">
                <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-lg text-ink">
                  {cv.nombre ?? "Tu CV"}
                </p>
                {currentRole && (
                  <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">{currentRole}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="mt-2 shrink-0 rounded-pill border border-border-soft bg-white px-4 py-2 font-['Inter:Regular',sans-serif] text-xs text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-colors hover:text-ink sm:text-sm"
            >
              Editar experiencia laboral
            </button>
          </div>
        </div>

        {!cv.resumen &&
          cv.experiencia.length === 0 &&
          cv.educacion.length === 0 &&
          cv.herramientas.length === 0 &&
          cv.extra.length === 0 && (
            <div className="mb-4 rounded-[20px] border border-dashed border-border-soft bg-white px-6 py-8 text-center">
              <p className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
                Todavía no cargaste información para tu CV
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
                Contanos tu experiencia en la conversación inicial (o adjuntá tu CV ahí) y este espacio
                se completa solo.
              </p>
            </div>
          )}

        {cv.resumen && (
          <Section title="Resumen">
            <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-relaxed text-ink">{cv.resumen}</p>
          </Section>
        )}

        {cv.experiencia.length > 0 && (
          <Section title="Experiencia laboral">
            <div className="flex flex-col gap-5">
              {cv.experiencia.map((e, i) => (
                <div key={i}>
                  {i > 0 && <div className="mb-5 h-px bg-border-soft" />}
                  <p className="font-['Inter:Regular',sans-serif] text-[15px] text-ink">{e.puesto}</p>
                  <p className="font-['Inter:Regular',sans-serif] text-[15px] text-ink">{e.empresa}</p>
                  <p className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{e.fechas}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {cv.educacion.length > 0 && (
          <Section title="Educación">
            <ul className="space-y-1.5">
              {cv.educacion.map((e, i) => (
                <li key={i} className="font-['Inter:Regular',sans-serif] text-[15px] text-ink">
                  {e}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {cv.herramientas.length > 0 && (
          <Section title="Herramientas">
            <div className="flex flex-wrap gap-2">
              {cv.herramientas.map((h, i) => (
                <span
                  key={i}
                  className="rounded-pill bg-ink/5 px-3 py-1 font-['Inter:Regular',sans-serif] text-xs text-ink"
                >
                  {h}
                </span>
              ))}
            </div>
          </Section>
        )}

        {cv.extra.length > 0 && (
          <Section title="Otros datos de tu CV">
            <ul className="space-y-1.5">
              {cv.extra.map((e, i) => (
                <li key={i} className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
                  {e}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* PARTE B */}
        <Section title="Certificaciones Coderhouse">
          {certifications.length === 0 ? (
            <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
              Todavía no completaste ningún curso — marcalo como completado en el mapa de tu recorrido
              para que aparezca acá.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {certifications.map((c, i) => (
                <li key={i} className="flex items-center justify-between gap-3 font-['Inter:Regular',sans-serif] text-[15px] text-ink">
                  <span>{c.nombre}</span>
                  <span className="shrink-0 text-xs text-ink-muted">{formatDate(c.fecha)}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {editOpen && <EditExperienceModal onClose={() => setEditOpen(false)} />}
    </div>
  );
}

// Section card + header, aligned to the reference's SectionHeader (title +
// two small round icon buttons). The icons are decorative — no add/reorder
// logic exists for this data yet.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[20px] border border-border-soft bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-['Inter:Regular',sans-serif] text-base text-ink">{title}</h2>
        <div className="flex gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-ink/5 text-ink-muted">
            <Plus className="h-4 w-4" />
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-ink/5 text-ink-muted">
            <Sliders className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

// Visually functional, no logic behind it — exactly what was asked: a
// button that looks real but doesn't need to save anything yet.
function EditExperienceModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-6" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="ml-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base text-ink">Disponible próximamente</p>
        <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
          Vas a poder editar tu experiencia laboral acá muy pronto.
        </p>
      </div>
    </div>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}
