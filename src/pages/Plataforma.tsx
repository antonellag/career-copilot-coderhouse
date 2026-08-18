import { Background, Controls, Position, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CoderhouseLogo } from "@/components/CoderhouseLogo";
import { LimboSidebar } from "@/components/limbo/LimboSidebar";
import { loadRoadmap } from "@/lib/ai/roadmapClient";

/**
 * Fase 4's result screen — a career roadmap rendered as a connected node
 * map (n8n-style), replacing the old "pick one of 2-3 paths" Career
 * Profile. Self-contained on purpose (per the brief: the real student
 * platform isn't designed yet) — this is only the map, reached from
 * /limbo's "Procesar resultado" button (src/pages/Limbo.tsx), which
 * generates the roadmap via /api/roadmap and hands it off through
 * sessionStorage (src/lib/ai/roadmapClient.ts) before navigating here.
 *
 * "Limbo" is this session's internal codename only — it never appears in
 * user-facing copy.
 */
export default function Plataforma() {
  const roadmap = useMemo(() => loadRoadmap(), []);

  if (!roadmap || roadmap.nodos.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-cream-soft px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5 text-ink-muted">
          <AlertCircle className="h-6 w-6" />
        </span>
        <h1 className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-xl text-ink">
          No encontramos tu recorrido
        </h1>
        <p className="max-w-sm font-['Inter:Regular',sans-serif] text-sm text-ink-muted">
          Puede que hayas llegado acá directo, sin pasar por la conversación. Volvé a empezar para
          armar tu recorrido.
        </p>
        <Link
          to="/limbo"
          className="rounded-pill bg-brand-hover px-6 py-3 font-['Plus_Jakarta_Sans:Medium',sans-serif] text-sm text-white transition-transform hover:scale-105"
        >
          Volver a empezar
        </Link>
      </div>
    );
  }

  const { nodes, edges } = useMemo(() => buildFlow(roadmap), [roadmap]);

  return (
    <div className="bg-grid relative h-screen">
      <div className="absolute left-4 top-4 z-10 hidden lg:block">
        <LimboSidebar currentPhase="resultado" resultadoComplete />
      </div>

      <div className="grid h-full grid-rows-[auto_1fr] overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2 text-ink-muted transition-colors hover:text-ink lg:hidden">
            <CoderhouseLogo className="h-4 w-auto" />
          </Link>
          <div className="ml-auto">
            <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink sm:text-base">
              Tu recorrido de cursos
            </p>
          </div>
        </header>

        <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.3 }} proOptions={{ hideAttribution: true }}>
          <Background gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

const BASE_NODE_STYLE: React.CSSProperties = {
  background: "var(--color-ink, #1a1a1a)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: "10px 16px",
  fontSize: 13,
  fontFamily: "Inter, sans-serif",
  width: 180,
};

const COURSE_NODE_STYLE: React.CSSProperties = {
  background: "white",
  border: "1.5px solid var(--color-brand-hover, #ff5a36)",
  borderRadius: 16,
  padding: "12px 16px",
  fontFamily: "Inter, sans-serif",
  width: 220,
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

function buildFlow(roadmap: NonNullable<ReturnType<typeof loadRoadmap>>): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const courseGapX = 280;
  const startX = roadmap.base.length > 0 ? 260 : 0;

  // Fase 1/2 skills the person already brings — stacked vertically before
  // the course track, so the map doesn't start from zero.
  roadmap.base.forEach((item, i) => {
    const id = `base-${i}`;
    nodes.push({
      id,
      position: { x: 0, y: i * 90 - ((roadmap.base.length - 1) * 90) / 2 + 120 },
      data: { label: item.label },
      style: BASE_NODE_STYLE,
      sourcePosition: Position.Right,
    });
  });

  roadmap.nodos.forEach((node, i) => {
    const id = node.id;
    nodes.push({
      id,
      position: { x: startX + i * courseGapX, y: 120 },
      data: {
        label: (
          <div>
            <span className="mb-1 block font-['Plus_Jakarta_Sans:SemiBold',sans-serif] text-sm text-ink">
              {node.curso.nombre}
            </span>
            <span className="block font-['Inter:Regular',sans-serif] text-[11px] uppercase tracking-wide text-brand-hover">
              {node.curso.tipo === "carrera" ? "Carrera" : "Curso"} · {node.curso.categoria}
            </span>
          </div>
        ),
      },
      style: COURSE_NODE_STYLE,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    if (i === 0) {
      // Every base node feeds into the first course.
      roadmap.base.forEach((_, bi) => {
        edges.push({
          id: `e-base-${bi}-${id}`,
          source: `base-${bi}`,
          target: id,
          animated: false,
          style: { stroke: "var(--color-border-soft, #ddd)" },
        });
      });
    } else {
      const prev = roadmap.nodos[i - 1];
      edges.push({
        id: `e-${prev.id}-${id}`,
        source: prev.id,
        target: id,
        label: truncate(node.justificacion, 60),
        labelStyle: { fill: "var(--color-ink-muted, #666)", fontSize: 11, fontFamily: "Inter, sans-serif" },
        labelBgStyle: { fill: "var(--color-cream-soft, #fff)" },
        style: { stroke: "var(--color-brand-hover, #ff5a36)" },
      });
    }
  });

  return { nodes, edges };
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
