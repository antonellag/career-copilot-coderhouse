import { Briefcase, GraduationCap, Pencil, Settings, Sparkles, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Roadmap } from "@/lib/ai/roadmapClient";
import { parseCv } from "@/lib/cvParser";
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
 * "Certificaciones Coderhouse" (PARTE B) isn't separately stored — it's
 * derived live from the same roadmap progress state the node map writes to
 * (src/lib/roadmapProgress.ts): any course at "completado" becomes a line
 * here, dated from when it was marked complete. Mark a course complete on
 * the map, switch to this tab, it's already there.
 */
export function CvView({
  roadmap,
  getStatus,
  getCompletedAt,
}: {
  roadmap: Roadmap;
  getStatus: (id: string) => CourseStatus;
  getCompletedAt: (id: string) => string | undefined;
}) {
  const [editOpen, setEditOpen] = useState(false);
  // trigger no longer has one single "resumen" string (it's now split into
  // topic sections for the map's trigger node) — combine the two closest
  // ones as this fallback's equivalent when there's no CV to parse.
  const fallbackResumen = useMemo(
    () => [roadmap.trigger.experiencia, roadmap.trigger.habilidades].filter(Boolean).join(" "),
    [roadmap],
  );
  const cv = useMemo(() => parseCv(loadProfileInput(), fallbackResumen), [fallbackResumen]);

  const certifications = roadmap.nodos
    .filter((n) => getStatus(n.id) === "completado")
    .map((n) => ({ nombre: n.curso.nombre, fecha: getCompletedAt(n.id) }))
    .sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""));

  const currentRole = cv.experiencia[0] ? `${cv.experiencia[0].puesto} en ${cv.experiencia[0].empresa}` : null;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Profile card — colorful banner + avatar, real data only (no
            invented location/handle): name from the CV parse, current role
            from its first experiencia entry if there is one, tools as
            colored skill pills instead of the plain list this used to be. */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div
            className="relative h-24"
            style={{ background: "linear-gradient(120deg, #ffb37a 0%, #ff5c2d 30%, #ff2d78 58%, #7c3aed 80%, #2563eb 100%)" }}
          >
            <button
              type="button"
              aria-label="Editar foto de perfil"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow-[0_1px_4px_rgba(0,0,0,0.15)] transition-colors hover:bg-white"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="px-5 pb-5">
            <div className="-mt-9 mb-3 flex items-end justify-between gap-3">
              <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-4 border-white bg-ink/10 text-ink-muted shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                <UserRound className="h-7 w-7" />
              </span>
              <div className="flex gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="rounded-pill bg-ink px-4 py-2 font-['Inter:Regular',sans-serif] text-xs text-white transition-opacity hover:opacity-90 sm:text-sm"
                >
                  Editar experiencia
                </button>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  aria-label="Configuración"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft text-ink-muted transition-colors hover:text-ink"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">
                {cv.nombre ?? "Tu CV"}
              </h1>
              {currentRole && (
                <span className="rounded-pill bg-brand-hover/10 px-2.5 py-1 font-['Inter:Regular',sans-serif] text-[11px] text-brand-hover">
                  {currentRole}
                </span>
              )}
            </div>
            <p className="mb-4 font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
              Armado automáticamente con lo que ya nos contaste
            </p>

            {cv.herramientas.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {cv.herramientas.map((h, i) => (
                  <span
                    key={i}
                    className="rounded-pill bg-brand-hover/10 px-3 py-1 font-['Inter:Regular',sans-serif] text-xs font-medium text-brand-hover"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {cv.resumen && (
          <Section icon={Sparkles} title="Resumen">
            <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-relaxed text-ink">{cv.resumen}</p>
          </Section>
        )}

        {cv.experiencia.length > 0 && (
          <Section icon={Briefcase} title="Experiencia laboral">
            <div className="space-y-3">
              {cv.experiencia.map((e, i) => (
                <div key={i}>
                  <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
                    {e.puesto} <span className="font-['Inter:Regular',sans-serif] font-normal text-ink-muted">en {e.empresa}</span>
                  </p>
                  <p className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{e.fechas}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {cv.educacion.length > 0 && (
          <Section icon={GraduationCap} title="Educación">
            <ul className="space-y-1.5">
              {cv.educacion.map((e, i) => (
                <li key={i} className="font-['Inter:Regular',sans-serif] text-[15px] text-ink">
                  {e}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {cv.extra.length > 0 && (
          <Section icon={Briefcase} title="Otros datos de tu CV">
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
        <Section icon={Sparkles} title="Certificaciones Coderhouse">
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

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Briefcase;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-border-soft bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-hover" />
        <h2 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">{title}</h2>
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
