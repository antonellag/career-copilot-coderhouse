import { useState } from "react";
import type { Roadmap } from "@/lib/ai/roadmapClient";
import type { CourseStatus } from "@/lib/roadmapProgress";
import { CvView } from "./CvView";
import { OfertaLaboralView } from "./OfertaLaboralView";
import { PortfolioView, type PortfolioProject } from "./PortfolioView";

/**
 * The "Perfil" tab's shell — sub-navigation for Curriculum (default)/
 * Portfolio/Oferta laboral, same pattern as Catálogo's own sub-nav
 * (src/components/plataforma/CatalogoView.tsx). Curriculum and Portfolio
 * are unchanged logic, just relocated under this shell instead of being
 * their own top-level tabs — see CvView.tsx and PortfolioView.tsx, neither
 * of which duplicate anything, they're the same components. Oferta laboral
 * is a placeholder until its real design arrives in a separate prompt.
 */

type Section = "curriculum" | "portfolio" | "oferta";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "curriculum", label: "Curriculum" },
  { id: "portfolio", label: "Portfolio" },
  { id: "oferta", label: "Oferta laboral" },
];

export function PerfilView({
  roadmap,
  getStatus,
  getCompletedAt,
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
  getCompletedAt: (id: string) => string | undefined;
  project: PortfolioProject | null;
  setProject: (p: PortfolioProject | null) => void;
  behanceProjects: PortfolioProject[];
  setBehanceProjects: (p: PortfolioProject[]) => void;
  disponible: boolean;
  setDisponible: (v: boolean) => void;
  contacto: string;
  setContacto: (v: string) => void;
}) {
  const [section, setSection] = useState<Section>("curriculum");

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="hidden w-52 shrink-0 border-r border-border-soft bg-white px-3 py-6 lg:block">
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`rounded-lg px-3 py-2 text-left font-['Inter:Regular',sans-serif] text-sm transition-colors ${
                section === s.id ? "bg-ink/5 font-medium text-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile section picker — the sidebar above is lg-only. */}
        <div className="flex shrink-0 gap-1 overflow-x-auto px-6 pt-6 lg:hidden">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`shrink-0 rounded-pill px-3 py-1.5 font-['Inter:Regular',sans-serif] text-xs ${
                section === s.id ? "bg-brand-hover text-white" : "bg-white text-ink-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {section === "curriculum" && <CvView roadmap={roadmap} getStatus={getStatus} getCompletedAt={getCompletedAt} />}
        {section === "portfolio" && (
          <PortfolioView
            roadmap={roadmap}
            getStatus={getStatus}
            project={project}
            setProject={setProject}
            behanceProjects={behanceProjects}
            setBehanceProjects={setBehanceProjects}
            disponible={disponible}
            setDisponible={setDisponible}
            contacto={contacto}
            setContacto={setContacto}
          />
        )}
        {section === "oferta" && <OfertaLaboralView />}
      </div>
    </div>
  );
}
