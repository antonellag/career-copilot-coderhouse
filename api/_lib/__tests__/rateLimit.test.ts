import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientKey, isRateLimited } from "../rateLimit";
import type { VercelRequest } from "@vercel/node";

function requestFrom(xForwardedFor: string | string[] | undefined): VercelRequest {
  return { headers: { "x-forwarded-for": xForwardedFor } } as unknown as VercelRequest;
}

describe("clientKey", () => {
  it("takes the first IP in a comma-separated x-forwarded-for chain", () => {
    expect(clientKey(requestFrom("1.2.3.4, 10.0.0.1, 10.0.0.2"))).toBe("1.2.3.4");
  });

  it("trims whitespace around the first IP", () => {
    expect(clientKey(requestFrom(" 1.2.3.4 ,10.0.0.1"))).toBe("1.2.3.4");
  });

  it("handles x-forwarded-for arriving as an array", () => {
    expect(clientKey(requestFrom(["1.2.3.4", "10.0.0.1"]))).toBe("1.2.3.4");
  });

  it("falls back to 'unknown' when the header is missing", () => {
    expect(clientKey(requestFrom(undefined))).toBe("unknown");
  });
});

describe("isRateLimited", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first 8 requests in a window and blocks the 9th", () => {
    const key = `test-key-${Math.random()}`;
    for (let i = 0; i < 8; i++) {
      expect(isRateLimited(key)).toBe(false);
    }
    expect(isRateLimited(key)).toBe(true);
  });

  it("resets the count once the window passes", () => {
    const key = `test-key-${Math.random()}`;
    for (let i = 0; i < 8; i++) isRateLimited(key);
    expect(isRateLimited(key)).toBe(true);

    vi.advanceTimersByTime(60_001);

    expect(isRateLimited(key)).toBe(false);
  });

  it("tracks separate keys independently", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    for (let i = 0; i < 8; i++) isRateLimited(keyA);
    expect(isRateLimited(keyA)).toBe(true);
    expect(isRateLimited(keyB)).toBe(false);
  });
});
