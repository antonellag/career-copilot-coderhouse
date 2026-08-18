import { ExternalLink, ImagePlus, Pencil } from "lucide-react";
import { useRef, useState } from "react";

/**
 * PARTE C — a one-project, Behance-style portfolio, plus a purely visual
 * "Disponible para trabajar" block. Lives entirely in session state (lifted
 * to src/pages/Plataforma.tsx so it survives switching tabs, but a refresh
 * loses it) — no database, no real matching/notification logic, exactly as
 * scoped: this shows the idea, it isn't a working marketplace.
 */

export type PortfolioProject = {
  titulo: string;
  descripcion: string;
  link: string;
  imageDataUrl: string | null;
};

export function PortfolioView({
  project,
  setProject,
  disponible,
  setDisponible,
  contacto,
  setContacto,
}: {
  project: PortfolioProject | null;
  setProject: (p: PortfolioProject | null) => void;
  disponible: boolean;
  setDisponible: (v: boolean) => void;
  contacto: string;
  setContacto: (v: string) => void;
}) {
  const [editing, setEditing] = useState(!project);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-2xl text-ink">Tu portfolio</h1>
        <p className="mb-8 font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
          Un proyecto para mostrar lo que sabés hacer — se guarda solo durante esta sesión.
        </p>

        {editing ? (
          <ProjectForm
            initial={project}
            onSave={(p) => {
              setProject(p);
              setEditing(false);
            }}
          />
        ) : project ? (
          <ProjectCard project={project} onEdit={() => setEditing(true)} />
        ) : null}

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
    </div>
  );
}

function ProjectForm({
  initial,
  onSave,
}: {
  initial: PortfolioProject | null;
  onSave: (p: PortfolioProject) => void;
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

      <button
        type="button"
        disabled={!canSave}
        onClick={() => onSave({ titulo: titulo.trim(), descripcion: descripcion.trim(), link: link.trim(), imageDataUrl })}
        className="w-full rounded-pill bg-brand-hover px-5 py-2.5 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white transition-transform hover:scale-[1.02] disabled:opacity-40"
      >
        Guardar proyecto
      </button>
    </div>
  );
}

function ProjectCard({ project, onEdit }: { project: PortfolioProject; onEdit: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      {project.imageDataUrl && <img src={project.imageDataUrl} alt="" className="h-56 w-full object-cover" />}
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-lg text-ink">{project.titulo}</h2>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar proyecto"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5 hover:text-ink"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        {project.descripcion && (
          <p className="mb-3 font-['Inter:Regular',sans-serif] text-[15px] leading-relaxed text-ink-muted">
            {project.descripcion}
          </p>
        )}
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-['Inter:Regular',sans-serif] text-sm text-brand-hover hover:underline"
          >
            {project.link}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
