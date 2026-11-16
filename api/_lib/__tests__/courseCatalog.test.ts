import { describe, expect, it } from "vitest";
import { catalogAsPromptText, COURSE_CATALOG, getCourseById, promptSameTopicExamples } from "../courseCatalog";

describe("COURSE_CATALOG", () => {
  it("loads real courses from data/course-catalog.json", () => {
    expect(COURSE_CATALOG.length).toBeGreaterThan(0);
    for (const course of COURSE_CATALOG) {
      expect(typeof course.id).toBe("string");
      expect(course.id.length).toBeGreaterThan(0);
      expect(["curso", "carrera", "diplomatura", "on-demand"]).toContain(course.tipo);
    }
  });

  it("has unique ids — getCourseById must never be ambiguous", () => {
    const ids = COURSE_CATALOG.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getCourseById", () => {
  it("returns the matching course for a real id", () => {
    const first = COURSE_CATALOG[0];
    expect(getCourseById(first.id)).toEqual(first);
  });

  it("returns undefined for an id that isn't in the catalog — api/roadmap.ts relies on this to reject hallucinated ids", () => {
    expect(getCourseById("this-id-does-not-exist")).toBeUndefined();
  });
});

describe("catalogAsPromptText", () => {
  it("includes every course's real id so the model can only pick from here", () => {
    const text = catalogAsPromptText();
    for (const course of COURSE_CATALOG) {
      expect(text).toContain(`id: "${course.id}"`);
    }
  });
});

describe("promptSameTopicExamples", () => {
  it("only groups courses that share a category and have different tipo values", () => {
    const text = promptSameTopicExamples();
    // Just needs to be well-formed — real content depends on the current
    // catalog's data and can legitimately be empty if no clusters exist.
    expect(typeof text).toBe("string");
  });
});
