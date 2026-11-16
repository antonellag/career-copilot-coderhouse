import { describe, expect, it } from "vitest";
import { parseCv } from "../cvParser";

describe("parseCv", () => {
  it("extracts name, email, links and sections from real CV text", () => {
    const cvText = `Ana Pérez
ana@example.com
https://github.com/anaperez

Experiencia
Diseñadora UX en Acme (2021-2023)

Educación
Licenciatura en Diseño, UBA (2015-2019)

Herramientas: Figma, Notion, Slack`;

    const result = parseCv({ cvText, userAnswers: [] }, null);

    expect(result.nombre).toBe("Ana Pérez");
    expect(result.email).toBe("ana@example.com");
    expect(result.links).toContain("https://github.com/anaperez");
    expect(result.experiencia).toEqual([{ puesto: "Diseñadora UX", empresa: "Acme", fechas: "2021-2023" }]);
    expect(result.educacion).toEqual(["Licenciatura en Diseño, UBA (2015-2019)"]);
    expect(result.herramientas).toEqual(["Figma", "Notion", "Slack"]);
  });

  it("keeps the 'puesto en empresa (fechas)' shape out of educación", () => {
    const cvText = `Experiencia
Product Designer en RetryPay (2022-2023)

Educación
Diseñadora en UBA (2015-2019)`;

    const result = parseCv({ cvText, userAnswers: [] }, null);

    // Both lines match EXPERIENCE_ENTRY_RE, but only the one under
    // "Experiencia" should land in `experiencia` — the one under
    // "Educación" must stay there as plain text, not get reclassified.
    expect(result.experiencia).toEqual([{ puesto: "Product Designer", empresa: "RetryPay", fechas: "2022-2023" }]);
    expect(result.educacion).toEqual(["Diseñadora en UBA (2015-2019)"]);
  });

  it("falls back to guessing a name from chat answers when there's no CV", () => {
    const result = parseCv({ cvText: null, userAnswers: ["Hola, soy Martina Gómez y trabajo en marketing"] }, "resumen de respaldo");

    expect(result.nombre).toBe("Martina Gómez");
    expect(result.email).toBeNull();
    expect(result.resumen).toBe("resumen de respaldo");
    expect(result.experiencia).toEqual([]);
  });

  it("returns an empty profile when there's neither a CV nor a profile input", () => {
    const result = parseCv(null, null);

    expect(result.nombre).toBeNull();
    expect(result.resumen).toBeNull();
    expect(result.links).toEqual([]);
  });

  it("puts unrecognized lines into extra instead of dropping them", () => {
    const cvText = `Experiencia
Algo que no matchea el patrón esperado`;

    const result = parseCv({ cvText, userAnswers: [] }, null);

    expect(result.experiencia).toEqual([]);
    expect(result.extra).toContain("Algo que no matchea el patrón esperado");
  });
});
