import { defineConfig } from "vitest/config";
import path from "node:path";

// Deliberately separate from vite.config.ts — that file wires up Figma
// Make's dev-server plugins (site config, error overlay replay, HMR
// fallback), none of which this project's tests need or want running.
// Pure unit tests over src/lib and api/_lib don't touch React/JSX at all,
// so this only needs the "@" alias the rest of the app uses.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
