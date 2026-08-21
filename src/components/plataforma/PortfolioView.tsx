import { ExternalLink, GraduationCap, ImagePlus, Link2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Roadmap } from "@/lib/ai/roadmapClient";
import type { CourseStatus } from "@/lib/roadmapProgress";

/**
 * Perfil > Portfolio. Visual layout is a Behance-style masonry grid (CSS
 * multi-column: 4 columns wide on desktop, columns flow independently so
 * taller cards don't force gaps — same effect as Behance's own grid), real
 * feedback replacing the previous fixed 3-column card grid.
 *
 * Every project here is created by hand through "Crear un proyecto" — no
 * auto-generated or simulated content anymore (an earlier version added a
 * generic placeholder card per completed course automatically, and had a
 * fake "Importar desde Behance" button that filled the grid with 3
 * made-up example projects; both are gone). "Crear un proyecto" offers 3
 * real sources instead:
 * - Imagen propia: upload a picture of your own work.
 * - Trabajo final de un curso: pick one of your completed courses (real,
 *   from roadmapProgress.ts — the same state the CV's "Certificaciones
 *   Coderhouse" reads) and upload a picture of what you actually built.
 * - Link de Behance: paste your own real Behance project URL.
 *
 * Grid cards show only their cover (image, or a source-tinted placeholder
 * when there isn't one) until hovered — hovering reveals title,
 * description, and edit/delete controls as an overlay, matching Behance's
 * own hover behavior.
 *
 * `projects` is lifted to src/pages/Plataforma.tsx (not local state here)
 * so it survives switching tabs — sessionStorage isn't used, so it's lost
 * on a page refresh, same demo-scope tradeoff as the rest of this app's
 * session-only state.
 */

export type PortfolioProjectSource = "propio" | "curso" | "behance";

export type PortfolioProject = {
  id: string;
  origen: PortfolioProjectSource;
  titulo: string;
  descripcion: string;
  link: string;
  imageDataUrl: string | null;
};

export function PortfolioView({
  roadmap,
  getStatus,
  projects,
  setProjects,
  disponible,
  setDisponible,
  contacto,
  setContacto,
}: {
  /** Null when /limbo's "Omitir test" shortcut skipped straight here — the "trabajo final de un curso" option just has no completed courses to offer. */
  roadmap: Roadmap | null;
  getStatus: (id: string) => CourseStatus;
  projects: PortfolioProject[];
  setProjects: (p: PortfolioProject[]) => void;
  disponible: boolean;
  setDisponible: (v: boolean) => void;
  contacto: string;
  setContacto: (v: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);

  const completedCourses = (roadmap?.nodos ?? [])
    .filter((n) => getStatus(n.id) === "completado")
    .map((n) => ({ id: n.id, nombre: n.curso.nombre }));

  const handleSave = (p: PortfolioProject) => {
    const exists = projects.some((existing) => existing.id === p.id);
    setProjects(exists ? projects.map((existing) => (existing.id === p.id ? p : existing)) : [...projects, p]);
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => setProjects(projects.filter((p) => p.id !== id));

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">Tu portfolio</h1>
        <p className="mb-6 font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
          Subí tus propios trabajos, el resultado de un curso que completaste, o sumá un proyecto que ya
          tengas en Behance — se guarda solo durante esta sesión.
        </p>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="mb-4 flex aspect-square w-full break-inside-avoid flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-soft bg-white px-6 text-center transition-colors hover:border-brand-hover/50 hover:bg-brand-hover/5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-hover/15 text-brand-hover">
              <Plus className="h-5 w-5" />
            </span>
            <span className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">Crear un proyecto</span>
            <span className="font-['Inter:Regular',sans-serif] text-xs leading-relaxed text-ink-muted">
              Mostrá tu trabajo y sumalo a tu perfil.
            </span>
          </button>

          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={() => {
                setEditing(p);
                setModalOpen(true);
              }}
              onDelete={() => handleDelete(p.id)}
            />
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border-soft bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
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

      {modalOpen && (
        <CreateProjectModal
          initial={editing}
          completedCourses={completedCourses}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

const SOURCE_LABEL: Record<PortfolioProjectSource, string> = {
  propio: "Proyecto propio",
  curso: "Trabajo final de curso",
  behance: "Behance",
};

// Behance-style masonry card: cover only until hovered, title/description/
// controls appear as an overlay on hover — never both at once, matching
// the reference the feedback pointed to.
function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: PortfolioProject;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = project.origen === "curso" ? GraduationCap : project.origen === "behance" ? Link2 : ImagePlus;
  return (
    <div className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      {project.imageDataUrl ? (
        <img src={project.imageDataUrl} alt="" className="w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-brand-hover/15 to-ink/5">
          <Icon className="h-7 w-7 text-brand-hover/60" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-black/0 p-4 opacity-0 transition-all group-hover:bg-black/65 group-hover:opacity-100">
        <div className="pointer-events-auto absolute right-3 top-3 flex gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar proyecto"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink transition-colors hover:bg-white"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Eliminar proyecto"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink transition-colors hover:bg-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="mb-1 inline-block w-fit rounded-pill bg-white/15 px-2 py-0.5 font-['Inter:Regular',sans-serif] text-[10px] uppercase tracking-wide text-white">
          {SOURCE_LABEL[project.origen]}
        </span>
        <h3 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm leading-snug text-white">
          {project.titulo}
        </h3>
        {project.descripcion && (
          <p className="mt-1 line-clamp-3 font-['Inter:Regular',sans-serif] text-xs leading-relaxed text-white/85">
            {project.descripcion}
          </p>
        )}
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto mt-2 inline-flex w-fit items-center gap-1 font-['Inter:Regular',sans-serif] text-xs text-white hover:underline"
          >
            Ver proyecto
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function CreateProjectModal({
  initial,
  completedCourses,
  onSave,
  onClose,
}: {
  initial: PortfolioProject | null;
  completedCourses: { id: string; nombre: string }[];
  onSave: (p: PortfolioProject) => void;
  onClose: () => void;
}) {
  const [origen, setOrigen] = useState<PortfolioProjectSource | null>(initial?.origen ?? null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-8" onClick={onClose}>
      <div
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base text-ink">
            {initial ? "Editar proyecto" : "Crear un proyecto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {origen === null ? (
          <div className="flex flex-col gap-2">
            <SourceOption
              icon={ImagePlus}
              title="Subir imagen"
              subtitle="Un trabajo propio, a tu ritmo."
              onClick={() => setOrigen("propio")}
            />
            <SourceOption
              icon={GraduationCap}
              title="Trabajo final de un curso"
              subtitle={
                completedCourses.length === 0
                  ? "Todavía no completaste ningún curso."
                  : "Elegí un curso que ya completaste."
              }
              disabled={completedCourses.length === 0}
              onClick={() => setOrigen("curso")}
            />
            <SourceOption
              icon={Link2}
              title="Link de Behance"
              subtitle="Sumá un proyecto que ya tengas publicado."
              onClick={() => setOrigen("behance")}
            />
          </div>
        ) : (
          <ProjectForm
            origen={origen}
            initial={initial}
            completedCourses={completedCourses}
            onSave={onSave}
            onBack={() => setOrigen(null)}
          />
        )}
      </div>
    </div>
  );
}

function SourceOption({
  icon: Icon,
  title,
  subtitle,
  disabled,
  onClick,
}: {
  icon: typeof ImagePlus;
  title: string;
  subtitle: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-border-soft px-4 py-3 text-left transition-colors enabled:hover:border-brand-hover/40 enabled:hover:bg-brand-hover/5 disabled:opacity-40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink-muted">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span>
        <span className="block font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">{title}</span>
        <span className="block font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{subtitle}</span>
      </span>
    </button>
  );
}

function ProjectForm({
  origen,
  initial,
  completedCourses,
  onSave,
  onBack,
}: {
  origen: PortfolioProjectSource;
  initial: PortfolioProject | null;
  completedCourses: { id: string; nombre: string }[];
  onSave: (p: PortfolioProject) => void;
  onBack: () => void;
}) {
  const [cursoId, setCursoId] = useState(completedCourses[0]?.id ?? "");
  const [titulo, setTitulo] = useState(
    initial?.titulo ?? (origen === "curso" && completedCourses[0] ? `Proyecto final: ${completedCourses[0].nombre}` : ""),
  );
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

  const canSave = titulo.trim().length > 0 && (origen !== "behance" || link.trim().length > 0);

  const handleSubmit = () => {
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      origen,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      link: link.trim(),
      imageDataUrl,
    });
  };

  return (
    <div>
      {origen === "curso" && (
        <select
          value={cursoId}
          onChange={(e) => {
            setCursoId(e.target.value);
            const nombre = completedCourses.find((c) => c.id === e.target.value)?.nombre;
            if (nombre) setTitulo(`Proyecto final: ${nombre}`);
          }}
          className="mb-3 w-full rounded-lg border border-border-soft bg-cream-soft px-4 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none"
        >
          {completedCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      )}

      {origen !== "behance" && (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mb-3 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border-soft bg-cream-soft"
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
        </>
      )}

      {origen === "behance" && (
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Link de tu proyecto en Behance"
          className="mb-3 w-full rounded-lg border border-border-soft bg-cream-soft px-4 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
        />
      )}

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
      {origen !== "behance" && (
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Link (opcional — repo, Figma, lo que sea)"
          className="mb-4 w-full rounded-lg border border-border-soft bg-cream-soft px-4 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink outline-none placeholder:text-ink-muted"
        />
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canSave}
          onClick={handleSubmit}
          className="flex-1 rounded-pill bg-brand-hover px-5 py-2.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white transition-transform hover:scale-[1.02] disabled:opacity-40"
        >
          Guardar proyecto
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-pill border border-border-soft px-5 py-2.5 font-['Inter:Regular',sans-serif] text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Atrás
        </button>
      </div>
    </div>
  );
}
