import { describe, expect, it } from "vitest";
import { nextStatus } from "../roadmapProgress";

describe("nextStatus", () => {
  it("advances no-iniciado -> en-progreso -> completado", () => {
    expect(nextStatus("no-iniciado")).toBe("en-progreso");
    expect(nextStatus("en-progreso")).toBe("completado");
  });

  it("stays at completado — there's no step after it", () => {
    expect(nextStatus("completado")).toBe("completado");
  });
});
