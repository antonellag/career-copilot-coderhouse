import { describe, expect, it } from "vitest";
import { categoryColor, categoryIcon, formatMapPrice, statusLabel, tipoLabel } from "../roadmapCardHelpers";

describe("categoryColor / categoryIcon", () => {
  it("returns the known palette for a recognized category", () => {
    expect(categoryColor("Programación")).toEqual({ bg: "#dcfce7", text: "#16a34a" });
  });

  it("falls back to the neutral palette for an unrecognized category", () => {
    expect(categoryColor("Categoría inexistente")).toEqual({ bg: "#f3f4f6", text: "#374151" });
  });

  it("categoryIcon never throws for an unrecognized category", () => {
    expect(() => categoryIcon("Categoría inexistente")).not.toThrow();
  });
});

describe("tipoLabel", () => {
  it.each([
    ["carrera", "Carrera"],
    ["diplomatura", "Diplomatura"],
    ["on-demand", "On-demand"],
    ["curso", "Curso"],
    ["algo-no-reconocido", "Curso"],
  ])("tipoLabel(%s) -> %s", (tipo, expected) => {
    expect(tipoLabel(tipo)).toBe(expected);
  });
});

describe("statusLabel", () => {
  it.each([
    ["completado", "Completado"],
    ["en-progreso", "En progreso"],
    ["no-iniciado", "No iniciado"],
  ] as const)("statusLabel(%s) -> %s", (status, expected) => {
    expect(statusLabel(status)).toBe(expected);
  });
});

describe("formatMapPrice", () => {
  it("formats with es-AR thousands separators and no decimals", () => {
    expect(formatMapPrice(150000)).toBe("$150.000");
    expect(formatMapPrice(0)).toBe("$0");
  });
});
