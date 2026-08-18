import { ExternalLink, ImagePlus, Loader2, Pencil, Plus, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import type { Roadmap } from "@/lib/ai/roadmapClient";
import type { CourseStatus } from "@/lib/roadmapProgress";

/**
 * Perfil > Portfolio. The grid combines three sources — none need to look
 * visually different from each other, they're just different ways a card
 * got there:
 * - Auto-generated: one card per course marked "completado" on the
 *   Recorrido map (same demo action the CV's certifications already use —
 *   see src/lib/roadmapProgress.ts). No real final project per course
 *   exists, so this is generic placeholder content only: a title like
 *   "Proyecto final: <curso>", no invented description or link.
 * - Manual: the one project the person can upload themselves (image,
 *   title, description, link).
 * - "Importar desde Behance": fully simulated, no real Behance API/OAuth —
 *   that would need real auth for zero real demo value. A fake ~1s loading
 *   beat, then 2-3 obviously-generic placeholder project cards get added.
 *   One-time per session (the button disables once imported) so repeat
 *   clicks can't spam duplicates.
 *
 * All three live in session state lifted to src/pages/Plataforma.tsx so
 * they survive switching sections — a refresh loses them, no database for
 * this scope.
 */

export type PortfolioProject = {
  titulo: string;
  descripcion: string;
  link: string;
  imageDataUrl: string | null;
};

const BEHANCE_PLACEHOLDER_PROJECTS: PortfolioProject[] = [
  {
    titulo: "Rediseño de app de delivery",
    descripcion: "Proyecto de ejemplo importado desde Behance.",
    link: "",
    imageDataUrl: null,
  },
  {
    titulo: "Identidad visual para marca de café",
    descripcion: "Proyecto de ejemplo importado desde Behance.",
    link: "",
    imageDataUrl: null,
  },
  {
    titulo: "Landing page para producto SaaS",
    descripcion: "Proyecto de ejemplo importado desde Behance.",
    link: "",
    imageDataUrl: null,
  },
];

export function PortfolioView({
  roadmap,
  getStatus,
  project,
  setProject,
  behanceProjects,
  setBehanceProjects,
  disponible,
  setDisponible,
  contacto,
  setContacto,
}: {
  roadmap: Roadmap;
  getStatus: (id: string) => CourseStatus;
  project: PortfolioProject | null;
  setProject: (p: PortfolioProject | null) => void;
  behanceProjects: PortfolioProject[];
  setBehanceProjects: (p: PortfolioProject[]) => void;
  disponible: boolean;
  setDisponible: (v: boolean) => void;
  contacto: string;
  setContacto: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [importing, setImporting] = useState(false);

  const autoItems = roadmap.nodos
    .filter((n) => getStatus(n.id) === "completado")
    .map((n) => ({ id: n.id, titulo: `Proyecto final: ${n.curso.nombre}` }));

  const handleImportBehance = () => {
    if (importing || behanceProjects.length > 0) return;
    setImporting(true);
    setTimeout(() => {
      setBehanceProjects(BEHANCE_PLACEHOLDER_PROJECTS);
      setImporting(false);
    }, 1000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">Tu portfolio</h1>
        <p className="mb-6 font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
          Se completa solo con un proyecto de ejemplo por cada curso que marques como completado en
          tu recorrido, y podés sumar el tuyo o importar desde Behance — se guarda solo durante esta
          sesión.
        </p>

        {!editing && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-pill bg-brand-hover px-4 py-2 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              {project ? "Editar tu proyecto" : "Agregar tu proyecto"}
            </button>
            <button
              type="button"
              onClick={handleImportBehance}
              disabled={importing || behanceProjects.length > 0}
              className="inline-flex items-center gap-1.5 rounded-pill border border-border-soft bg-white px-4 py-2 font-['Inter:Regular',sans-serif] text-sm text-ink-muted transition-colors hover:text-ink disabled:opacity-60"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importando tus proyectos…
                </>
              ) : behanceProjects.length > 0 ? (
                "Importado desde Behance ✓"
              ) : (
                "Importar desde Behance"
              )}
            </button>
          </div>
        )}

        {editing ? (
          <div className="mb-8">
            <ProjectForm
              initial={project}
              onSave={(p) => {
                setProject(p);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project && <ProjectCard project={project} onEdit={() => setEditing(true)} />}
            {autoItems.map((item) => (
              <PlaceholderProjectCard key={item.id} titulo={item.titulo} badge="Generado automáticamente" />
            ))}
            {behanceProjects.map((p, i) => (
              <PlaceholderProjectCard key={i} titulo={p.titulo} descripcion={p.descripcion} badge="Importado de Behance" />
            ))}
            {!project && autoItems.length === 0 && behanceProjects.length === 0 && (
              <p className="col-span-full font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
                Todavía no tenés proyectos acá — agregá el tuyo, completá un curso en tu recorrido, o
                importá desde Behance.
              </p>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
                Disponible para trabajar
              </h2>
              <p className="font-['Inter:Regular',sans-serif] text-xs text-ink-muted">
                Puramente visual — no envía ningún aviso ni notificación real.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={disponible}
              onClick={() => setDisponible(!disponible)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${disponible ? "bg-brand-hover" : "bg-ink/15"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${disponible ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </button>
          </div>
          {disponible && (
            <input
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              placeholder="Email o link de contacto"
              className="w-full rounded-pill border border-border-soft bg-cream-soft px-4 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Shared shape for both auto-generated (course) and Behance-imported cards
// — same visual as the manual ProjectCard minus the edit control, since
// neither of these is user-editable.
function PlaceholderProjectCard({
  titulo,
  descripcion,
  badge,
}: {
  titulo: string;
  descripcion?: string;
  badge: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex h-32 items-center justify-center bg-gradient-to-br from-brand-hover/10 to-ink/5">
        <Sparkles className="h-6 w-6 text-brand-hover/50" />
      </div>
      <div className="p-4">
        <span className="mb-1.5 inline-block rounded-pill bg-ink/5 px-2 py-0.5 font-['Inter:Regular',sans-serif] text-[10px] uppercase tracking-wide text-ink-muted">
          {badge}
        </span>
        <h3 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm leading-snug text-ink">{titulo}</h3>
        {descripcion && (
          <p className="mt-1 font-['Inter:Regular',sans-serif] text-xs leading-relaxed text-ink-muted">
            {descripcion}
          </p>
        )}
      </div>
    </div>
  );
}

function ProjectForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: PortfolioProject | null;
  onSave: (p: PortfolioProject) => void;
  onCancel: () => void;
}) {
  const [titulo, setTitulo] = useState(initial?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initial?.imageDataUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const canSave = titulo.trim().length > 0;

  return (
    <div className="rounded-2xl border border-border-soft bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mb-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border-soft bg-cream-soft"
      >
        {imageDataUrl ? (
          <img src={imageDataUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1.5 text-ink-muted">
            <ImagePlus className="h-5 w-5" />
            <span className="font-['Inter:Regular',sans-serif] text-xs">Subir imagen del proyecto</span>
          </span>
        )}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título del proyecto"
        className="mb-3 w-full rounded-lg border border-border-soft bg-cream-soft px-4 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      <textarea
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción corta"
        rows={3}
        className="mb-3 w-full resize-none rounded-lg border border-border-soft bg-cream-soft px-4 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Link (repo, Figma, lo que sea)"
        className="mb-4 w-full rounded-lg border border-border-soft bg-cream-soft px-4 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
      />

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canSave}
          onClick={() => onSave({ titulo: titulo.trim(), descripcion: descripcion.trim(), link: link.trim(), imageDataUrl })}
          className="flex-1 rounded-pill bg-brand-hover px-5 py-2.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white transition-transform hover:scale-[1.02] disabled:opacity-40"
        >
          Guardar proyecto
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-pill border border-border-soft px-5 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function ProjectCard({ project, onEdit }: { project: PortfolioProject; onEdit: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      {project.imageDataUrl && <img src={project.imageDataUrl} alt="" className="h-32 w-full object-cover" />}
      <div className="p-4">
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <h2 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">{project.titulo}</h2>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar proyecto"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
        {project.descripcion && (
          <p className="mb-2 font-['Inter:Regular',sans-serif] text-xs leading-relaxed text-ink-muted">
            {project.descripcion}
          </p>
        )}
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-['Inter:Regular',sans-serif] text-xs text-brand-hover hover:underline"
          >
            {project.link}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
