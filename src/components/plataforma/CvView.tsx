import { Camera, ExternalLink, Link2, Pencil, Plus, Sliders, UserRound, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Roadmap } from "@/lib/ai/roadmapClient";
import { parseCv } from "@/lib/cvParser";
import { DEFAULT_COVER_GRADIENT, loadProfilePhotos, resizeImageToDataUrl, saveProfilePhotos } from "@/lib/profilePhotoStore";
import { loadProfileInput } from "@/lib/profileStore";
import {
  loadProfileExtras,
  saveProfileExtras,
  type ManualExperience,
  type ManualLink,
  type ProfileExtras,
} from "@/lib/profileExtrasStore";
import type { CourseStatus } from "@/lib/roadmapProgress";

/**
 * PARTE A/B — the auto-built CV. Reads whatever /limbo handed off
 * (src/lib/profileStore.ts: the uploaded CV's raw text, or — if no CV —
 * the person's own chat answers plus the roadmap's AI-generated trigger
 * summary as a fallback "Resumen") and renders it into one standard
 * template via src/lib/cvParser.ts's plain heuristic extraction. No AI
 * rewrite happens here.
 *
 * Real feedback: this should read like a LinkedIn profile — separate
 * cards, each independently editable/addable, not a static dump of
 * whatever the CV parser found. Two data sources feed each card, kept
 * deliberately apart rather than merged:
 * - What the CV parser found (cv.experiencia/educacion/links/...) — real,
 *   read-only here (editing raw CV text is out of scope), one source of
 *   truth per src/lib/cvParser.ts.
 * - What the person types in by hand here (src/lib/profileExtrasStore.ts:
 *   carta de presentación, and manual add-ons to Destacados/Experiencia/
 *   Educación) — the one place that writes that store, additive only, so
 *   a manual addition never overwrites or hides something the CV parser
 *   found.
 *
 * "Destacados" is real URLs scanned out of the CV text (personal site,
 * portfolio, GitHub...) — never the Portfolio tab's project cards
 * (src/components/plataforma/PortfolioView.tsx already owns that, with
 * real projects; duplicating it here would just be the same content
 * twice) — plus whatever links get added manually.
 *
 * Avatar + cover photo (src/lib/profilePhotoStore.ts) are editable HERE —
 * this is the one place that writes them — and read read-only wherever
 * else the profile shows up (the Plan carrera map's trigger card, the
 * header's account menu). A CV's raw text has no photo to pull from
 * (extracting one reliably from an arbitrary PDF layout is its own hard
 * problem, out of scope), so this is a manual upload instead of anything
 * automatic; the default cover (DEFAULT_COVER_GRADIENT) is a plain
 * gradient, never a fabricated stock photo standing in for a real one.
 *
 * "Certificaciones Coderhouse" (PARTE B) isn't separately stored — it's
 * derived live from the same roadmap progress state the node map writes to
 * (src/lib/roadmapProgress.ts): any course at "completado" becomes a line
 * here, dated from when it was marked complete. Mark a course complete on
 * the map, switch to this tab, it's already there. Not manually addable —
 * unlike the other cards, this one is a real, derived fact, so inventing
 * an entry here would misrepresent what was actually completed.
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
  const [photos, setPhotos] = useState(() => loadProfilePhotos());
  const [extras, setExtras] = useState(() => loadProfileExtras());
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [editingCarta, setEditingCarta] = useState(false);
  const [cartaDraft, setCartaDraft] = useState(extras.cartaPresentacion);
  const [addingLink, setAddingLink] = useState(false);
  const [addingExp, setAddingExp] = useState(false);
  const [addingEdu, setAddingEdu] = useState(false);

  const persistExtras = (next: ProfileExtras) => {
    setExtras(next);
    saveProfileExtras(next);
  };

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
  const currentRole = cv.experiencia[0]?.puesto ?? extras.experienciaManual[0]?.puesto ?? null;

  const certifications = (roadmap?.nodos ?? [])
    .filter((n) => getStatus(n.id) === "completado")
    .map((n) => ({ nombre: n.curso.nombre, fecha: getCompletedAt(n.id) }))
    .sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""));

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        {/* User data card — cover, avatar, name/role, and carta de
            presentación all live together here, matching a LinkedIn-style
            profile header. Cover/avatar are the one editable-here pair
            (see module doc comment); carta de presentación is a plain
            manual text field, saved to profileExtrasStore. */}
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
          <div className="relative flex items-start gap-4 px-7 pb-6">
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoSelect("avatar", e)} />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              aria-label="Cambiar foto de perfil"
              className="group relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#e4e4e4] text-ink-muted"
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
            <div className="min-w-0 flex-1 pt-2">
              <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-lg text-ink">{cv.nombre ?? "Tu CV"}</p>
              {currentRole && <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">{currentRole}</p>}
            </div>
          </div>

          {/* Carta de presentación — manual only, no CV field maps to this. */}
          <div className="border-t border-border-soft px-7 py-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">Carta de presentación</h2>
              {!editingCarta && (
                <button
                  type="button"
                  onClick={() => {
                    setCartaDraft(extras.cartaPresentacion);
                    setEditingCarta(true);
                  }}
                  aria-label="Editar carta de presentación"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {editingCarta ? (
              <div>
                <textarea
                  value={cartaDraft}
                  onChange={(e) => setCartaDraft(e.target.value)}
                  rows={4}
                  placeholder="Contá brevemente quién sos y qué estás buscando…"
                  className="mb-2 w-full resize-none rounded-lg border border-border-soft bg-cream-soft px-4 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      persistExtras({ ...extras, cartaPresentacion: cartaDraft.trim() });
                      setEditingCarta(false);
                    }}
                    className="rounded-pill bg-brand-hover px-4 py-1.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-xs text-white transition-transform hover:scale-105"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCarta(false)}
                    className="rounded-pill border border-border-soft px-4 py-1.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted hover:text-ink"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : extras.cartaPresentacion ? (
              <p className="whitespace-pre-wrap font-['Inter:Regular',sans-serif] text-sm leading-relaxed text-ink">
                {extras.cartaPresentacion}
              </p>
            ) : (
              <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">Todavía no agregaste una.</p>
            )}
          </div>
        </div>

        {cv.resumen && (
          <Section title="Resumen">
            <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-relaxed text-ink">{cv.resumen}</p>
          </Section>
        )}

        {/* Destacados — real links found in the CV, plus manual add-ons. */}
        <Section title="Destacados" onAdd={() => setAddingLink(true)}>
          <LinkList links={cv.links} manual={extras.destacadosManual} onRemove={(i) => persistExtras({ ...extras, destacadosManual: extras.destacadosManual.filter((_, idx) => idx !== i) })} />
          {addingLink && (
            <AddLinkForm
              onSave={(l) => {
                persistExtras({ ...extras, destacadosManual: [...extras.destacadosManual, l] });
                setAddingLink(false);
              }}
              onCancel={() => setAddingLink(false)}
            />
          )}
        </Section>

        {/* Experiencia laboral — CV-parsed entries (read-only) plus manual add-ons (removable). */}
        <Section title="Experiencia laboral" onAdd={() => setAddingExp(true)}>
          <ExperienceList
            cvEntries={cv.experiencia}
            manual={extras.experienciaManual}
            onRemove={(i) => persistExtras({ ...extras, experienciaManual: extras.experienciaManual.filter((_, idx) => idx !== i) })}
          />
          {addingExp && (
            <AddExperienceForm
              onSave={(e) => {
                persistExtras({ ...extras, experienciaManual: [...extras.experienciaManual, e] });
                setAddingExp(false);
              }}
              onCancel={() => setAddingExp(false)}
            />
          )}
        </Section>

        {/* Educación — same real-plus-manual pattern as Experiencia laboral. */}
        <Section title="Educación" onAdd={() => setAddingEdu(true)}>
          <EducationList
            cvEntries={cv.educacion}
            manual={extras.educacionManual}
            onRemove={(i) => persistExtras({ ...extras, educacionManual: extras.educacionManual.filter((_, idx) => idx !== i) })}
          />
          {addingEdu && (
            <AddEducationForm
              onSave={(e) => {
                persistExtras({ ...extras, educacionManual: [...extras.educacionManual, e] });
                setAddingEdu(false);
              }}
              onCancel={() => setAddingEdu(false)}
            />
          )}
        </Section>

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

        {/* PARTE B — derived, not manually addable, see module doc comment. */}
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
    </div>
  );
}

// Section card + header. The Plus icon becomes a real "add" affordance
// when `onAdd` is passed (Destacados/Experiencia/Educación); otherwise it
// stays decorative, same as Sliders always is — no reorder logic exists
// for any of this data.
function Section({ title, onAdd, children }: { title: string; onAdd?: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-[20px] border border-border-soft bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-['Inter:Regular',sans-serif] text-base text-ink">{title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAdd}
            disabled={!onAdd}
            aria-label={`Agregar en ${title}`}
            className="flex h-8 w-8 items-center justify-center rounded-2xl bg-ink/5 text-ink-muted transition-colors enabled:hover:bg-ink/10 enabled:hover:text-ink"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-ink/5 text-ink-muted">
            <Sliders className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

function toHref(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function displayLink(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function LinkList({
  links,
  manual,
  onRemove,
}: {
  links: string[];
  manual: ManualLink[];
  onRemove: (i: number) => void;
}) {
  if (links.length === 0 && manual.length === 0) {
    return <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">Todavía no tenés links agregados.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {links.map((url, i) => (
        <li key={`cv-${i}`}>
          <a
            href={toHref(url)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-sm text-brand-hover hover:underline"
          >
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            {displayLink(url)}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </li>
      ))}
      {manual.map((l, i) => (
        <li key={`manual-${i}`} className="flex items-center gap-2">
          <a
            href={toHref(l.url)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-w-0 items-center gap-1.5 font-['Inter:Regular',sans-serif] text-sm text-brand-hover hover:underline"
          >
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{l.label || displayLink(l.url)}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label="Quitar link"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-3 w-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function AddLinkForm({ onSave, onCancel }: { onSave: (l: ManualLink) => void; onCancel: () => void }) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const canSave = url.trim().length > 0;
  return (
    <div className="mt-3 rounded-xl border border-border-soft bg-cream-soft p-3">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Nombre (ej: Portfolio, GitHub)"
        className="mb-2 w-full rounded-lg border border-border-soft bg-white px-3 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL"
        className="mb-3 w-full rounded-lg border border-border-soft bg-white px-3 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      <FormActions canSave={canSave} onSave={() => onSave({ label: label.trim(), url: url.trim() })} onCancel={onCancel} />
    </div>
  );
}

function ExperienceList({
  cvEntries,
  manual,
  onRemove,
}: {
  cvEntries: { puesto: string; empresa: string; fechas: string }[];
  manual: ManualExperience[];
  onRemove: (i: number) => void;
}) {
  if (cvEntries.length === 0 && manual.length === 0) {
    return <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">Todavía no agregaste experiencia laboral.</p>;
  }
  const all = [...cvEntries.map((e) => ({ ...e, manual: false })), ...manual.map((e) => ({ ...e, manual: true }))];
  return (
    <div className="flex flex-col gap-5">
      {all.map((e, i) => (
        <div key={i}>
          {i > 0 && <div className="mb-5 h-px bg-border-soft" />}
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-['Inter:Regular',sans-serif] text-[15px] text-ink">{e.puesto}</p>
              <p className="font-['Inter:Regular',sans-serif] text-[15px] text-ink">{e.empresa}</p>
              <p className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{e.fechas}</p>
            </div>
            {e.manual && (
              <button
                type="button"
                onClick={() => onRemove(i - cvEntries.length)}
                aria-label="Quitar experiencia"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AddExperienceForm({ onSave, onCancel }: { onSave: (e: ManualExperience) => void; onCancel: () => void }) {
  const [puesto, setPuesto] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [fechas, setFechas] = useState("");
  const canSave = puesto.trim().length > 0 && empresa.trim().length > 0;
  return (
    <div className="mt-3 rounded-xl border border-border-soft bg-cream-soft p-3">
      <input
        value={puesto}
        onChange={(e) => setPuesto(e.target.value)}
        placeholder="Puesto"
        className="mb-2 w-full rounded-lg border border-border-soft bg-white px-3 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      <input
        value={empresa}
        onChange={(e) => setEmpresa(e.target.value)}
        placeholder="Empresa"
        className="mb-2 w-full rounded-lg border border-border-soft bg-white px-3 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      <input
        value={fechas}
        onChange={(e) => setFechas(e.target.value)}
        placeholder="Fechas (ej: 2022 - Actualidad)"
        className="mb-3 w-full rounded-lg border border-border-soft bg-white px-3 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      <FormActions
        canSave={canSave}
        onSave={() => onSave({ puesto: puesto.trim(), empresa: empresa.trim(), fechas: fechas.trim() })}
        onCancel={onCancel}
      />
    </div>
  );
}

function EducationList({
  cvEntries,
  manual,
  onRemove,
}: {
  cvEntries: string[];
  manual: string[];
  onRemove: (i: number) => void;
}) {
  if (cvEntries.length === 0 && manual.length === 0) {
    return <p className="font-['Inter:Regular',sans-serif] text-sm text-ink-muted">Todavía no agregaste educación.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {cvEntries.map((e, i) => (
        <li key={`cv-${i}`} className="font-['Inter:Regular',sans-serif] text-[15px] text-ink">
          {e}
        </li>
      ))}
      {manual.map((e, i) => (
        <li key={`manual-${i}`} className="flex items-center justify-between gap-2 font-['Inter:Regular',sans-serif] text-[15px] text-ink">
          {e}
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label="Quitar educación"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-3 w-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function AddEducationForm({ onSave, onCancel }: { onSave: (e: string) => void; onCancel: () => void }) {
  const [value, setValue] = useState("");
  const canSave = value.trim().length > 0;
  return (
    <div className="mt-3 rounded-xl border border-border-soft bg-cream-soft p-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ej: Licenciatura en Diseño, UBA (2015-2019)"
        className="mb-3 w-full rounded-lg border border-border-soft bg-white px-3 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      <FormActions canSave={canSave} onSave={() => onSave(value.trim())} onCancel={onCancel} />
    </div>
  );
}

function FormActions({ canSave, onSave, onCancel }: { canSave: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={!canSave}
        onClick={onSave}
        className="rounded-pill bg-brand-hover px-4 py-1.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-xs text-white transition-transform hover:scale-105 disabled:opacity-40"
      >
        Guardar
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-pill border border-border-soft px-4 py-1.5 font-['Inter:Regular',sans-serif] text-xs text-ink-muted hover:text-ink"
      >
        Cancelar
      </button>
    </div>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}
