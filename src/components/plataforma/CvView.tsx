import { Briefcase, GraduationCap, Sparkles, Wrench, X } from "lucide-react";
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
  const cv = useMemo(() => parseCv(loadProfileInput(), roadmap.trigger.resumen), [roadmap]);

  const certifications = roadmap.nodos
    .filter((n) => getStatus(n.id) === "completado")
    .map((n) => ({ nombre: n.curso.nombre, fecha: getCompletedAt(n.id) }))
    .sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""));

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">
              {cv.nombre ?? "Tu CV"}
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
              Armado automáticamente con lo que ya nos contaste
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="shrink-0 rounded-pill border border-border-soft bg-white px-4 py-2 font-['Inter:Regular',sans-serif] text-xs text-ink-muted shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-colors hover:text-ink sm:text-sm"
          >
            Editar experiencia laboral
          </button>
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

        {cv.herramientas.length > 0 && (
          <Section icon={Wrench} title="Herramientas">
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
