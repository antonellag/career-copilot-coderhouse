import { Book, Briefcase, Check, Circle, CheckCircle2, Code2, Database, Megaphone, Package, Palette, Sparkles, Users } from "lucide-react";
import type { RoadmapNode, RoadmapNodeTipo } from "@/lib/ai/roadmapClient";
import type { CourseStatus } from "@/lib/roadmapProgress";

/**
 * A self-contained, real course card — same visual content as the Plan
 * carrera map's own node card (src/pages/Plataforma.tsx's courseNodeLabel/
 * courseNodeStyle) and CatalogoView's CourseCard: real photo when the
 * catalog has one, category-tinted placeholder otherwise, real price/
 * fecha/horario when present, decorative "Comprar" (no real payments
 * anywhere in this app).
 *
 * Deliberately a MIRRORED copy, not an import from src/pages/Plataforma.tsx
 * — that file's version renders as `data.label` inside a React Flow node
 * (no self-wrapping border, ReactFlow's own node `style` supplies that),
 * while this one self-wraps with its own bordered container so it can drop
 * into a plain flex row (Panel inicio's condensed path) with no React Flow
 * involved. Reusing the map's non-self-wrapping version here would mean
 * either double-bordering it or reaching into React Flow internals for no
 * reason; duplicating the ~small presentational layer is the pragmatic
 * tradeoff, same as src/lib/catalogClient.ts / api/_lib/courseCatalog.ts's
 * own documented mirrored-helper pattern for the same kind of module
 * boundary. Keep both in sync by hand if the card's content changes.
 */

const BRANCH_ACCENT: Record<RoadmapNodeTipo, string> = {
  principal: "var(--color-brand-hover, #ff5a36)",
  repaso: "#0ea5e9",
  complementaria: "#8b5cf6",
};

function branchBadgeStyle(tipo: RoadmapNodeTipo): React.CSSProperties {
  if (tipo === "repaso") return { background: "#e0f2fe", color: "#0369a1" };
  return { background: "#ede9fe", color: "#7c3aed" };
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Inteligencia Artificial": { bg: "#ffedd5", text: "#ff7d2a" },
  "Programación": { bg: "#dcfce7", text: "#16a34a" },
  "Diseño": { bg: "#fce7f3", text: "#be185d" },
  Data: { bg: "#dbeafe", text: "#2563eb" },
  "Marketing Digital": { bg: "#fef3c7", text: "#b45309" },
  Negocios: { bg: "#e0e7ff", text: "#4338ca" },
  Producto: { bg: "#ffe4e6", text: "#be123c" },
  "Softs Skills": { bg: "#f3f4f6", text: "#374151" },
};

export function categoryColor(categoria: string): { bg: string; text: string } {
  return CATEGORY_COLORS[categoria] ?? { bg: "#f3f4f6", text: "#374151" };
}

const CATEGORY_ICONS: Record<string, typeof Book> = {
  "Inteligencia Artificial": Sparkles,
  "Programación": Code2,
  "Diseño": Palette,
  Data: Database,
  "Marketing Digital": Megaphone,
  Negocios: Briefcase,
  Producto: Package,
  "Softs Skills": Users,
};

export function categoryIcon(categoria: string): typeof Book {
  return CATEGORY_ICONS[categoria] ?? Book;
}

function PlaceholderHeader({ categoria }: { categoria: string }) {
  const catColor = categoryColor(categoria);
  const Icon = categoryIcon(categoria);
  return (
    <div className="absolute inset-0" style={{ background: catColor.bg }}>
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: `radial-gradient(${catColor.text}33 1px, transparent 1px)`, backgroundSize: "14px 14px" }}
      />
      <div className="relative flex h-full items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
          <Icon className="h-5 w-5" style={{ color: catColor.text }} />
        </span>
      </div>
    </div>
  );
}

export function tipoLabel(tipo: string): string {
  if (tipo === "carrera") return "Carrera";
  if (tipo === "diplomatura") return "Diplomatura";
  if (tipo === "on-demand") return "On-demand";
  return "Curso";
}

export function formatMapPrice(n: number): string {
  return `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

function StatusIcon({ status }: { status: CourseStatus }) {
  if (status === "completado") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === "en-progreso") return <Circle className="h-4 w-4 fill-brand-hover text-brand-hover" />;
  return <Circle className="h-4 w-4 text-ink-muted" />;
}

export function statusLabel(status: CourseStatus): string {
  if (status === "completado") return "Completado";
  if (status === "en-progreso") return "En progreso";
  return "No iniciado";
}

export function RoadmapCourseCard({ node, status }: { node: RoadmapNode; status: CourseStatus }) {
  const curso = node.curso;
  const catColor = categoryColor(curso.categoria);
  const accent = BRANCH_ACCENT[node.tipo];

  return (
    <div
      // No h-full here on purpose — mixing an explicit height:100% with the
      // parent row's `items-stretch` fights it (100% of an indefinite/auto
      // parent height resolves as if unset, so every card fell back to its
      // own content height instead of matching its tallest sibling). Plain
      // `items-stretch` on the row already stretches every direct flex
      // child to the same height with no explicit height needed here.
      className="flex w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl bg-white text-left"
      style={{
        border: `1.5px solid ${status === "completado" ? "#22c55e" : accent}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      <div className="relative flex aspect-[16/7] items-center justify-center overflow-hidden">
        {curso.imagen ? (
          <img src={curso.imagen} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <PlaceholderHeader categoria={curso.categoria} />
        )}
        <span
          className="absolute left-2 top-2 rounded-pill bg-white px-2 py-0.5 font-['Inter:SemiBold',sans-serif] text-[10px] font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
          style={{ color: catColor.text }}
        >
          {curso.categoria}
        </span>
        {status === "en-progreso" ? (
          <span className="absolute right-2 top-2 rounded-pill bg-brand-hover px-2 py-0.5 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-[10px] text-white">
            Ingresar
          </span>
        ) : status === "completado" ? (
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : (
          curso.descuento && (
            <span className="absolute right-2 top-2 rounded-pill bg-brand-hover px-2 py-0.5 font-['Inter:Bold',sans-serif] text-[10px] font-bold text-white">
              {curso.descuento}
            </span>
          )
        )}
      </div>

      {/* flex-1 + the price/tipo block's mt-auto below keep every card the
          same height in a row (Panel inicio's Plan de carrera) regardless
          of how much text a course's name/price/branch badge takes up —
          Comprar + the status line always sit flush at the bottom. */}
      <div className="flex flex-1 flex-col px-3.5 py-3">
        <p className="mb-1.5 line-clamp-2 font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm font-bold leading-tight text-ink">
          {curso.nombre}
        </p>
        {node.tipo !== "principal" && (
          <span
            className="mb-1.5 inline-block rounded-pill px-2 py-0.5 font-['Inter:Regular',sans-serif] text-[10px]"
            style={branchBadgeStyle(node.tipo)}
          >
            {node.rama}
          </span>
        )}

        {curso.precioFinal !== undefined ? (
          <div className="mb-2.5 mt-auto flex flex-col gap-0.5 leading-tight">
            {curso.cuotas !== undefined && (
              <span className="font-['Inter:Regular',sans-serif] text-[11px] font-medium text-ink-muted">
                Hasta {curso.cuotas} cuotas sin interés de
              </span>
            )}
            {curso.precioCuota !== undefined && (
              <span className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-base font-extrabold tracking-tight text-ink">
                {formatMapPrice(curso.precioCuota)} <span className="text-[11px] font-extrabold text-ink">ARS</span>
              </span>
            )}
            <span className="font-['Inter:Regular',sans-serif] text-[11px] text-ink-muted">
              {curso.precioOriginal !== undefined && (
                <span className="mr-1.5 line-through">{formatMapPrice(curso.precioOriginal)} ARS</span>
              )}
              Precio final: {formatMapPrice(curso.precioFinal)} ARS
            </span>
          </div>
        ) : (
          <span className="mb-2.5 mt-auto block font-['Inter:Regular',sans-serif] text-xs text-ink-muted">{tipoLabel(curso.tipo)}</span>
        )}

        <button
          type="button"
          className="mb-2 w-full rounded-[10px] border border-border-soft bg-white px-3 py-2 font-['Inter:SemiBold',sans-serif] text-xs font-semibold text-ink transition-colors hover:bg-cream-soft"
        >
          Comprar
        </button>

        <span className="flex items-center gap-1 font-['Inter:Regular',sans-serif] text-[11px] text-ink-muted">
          <StatusIcon status={status} />
          {tipoLabel(curso.tipo)} · {statusLabel(status)}
        </span>
      </div>
    </div>
  );
}
