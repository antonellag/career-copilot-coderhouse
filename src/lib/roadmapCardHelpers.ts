import { Book, Briefcase, Code2, Database, Megaphone, Package, Palette, Sparkles, Users } from "lucide-react";
import type { CourseStatus } from "@/lib/roadmapProgress";

/**
 * Pure presentational helpers shared by RoadmapCourseCard and
 * PanelInicioView — split out of RoadmapCourseCard.tsx so that file only
 * exports components (keeps React Fast Refresh working for it).
 */

export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
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

export function tipoLabel(tipo: string): string {
  if (tipo === "carrera") return "Carrera";
  if (tipo === "diplomatura") return "Diplomatura";
  if (tipo === "on-demand") return "On-demand";
  return "Curso";
}

export function formatMapPrice(n: number): string {
  return `$${n.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

export function statusLabel(status: CourseStatus): string {
  if (status === "completado") return "Completado";
  if (status === "en-progreso") return "En progreso";
  return "No iniciado";
}
