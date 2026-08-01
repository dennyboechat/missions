import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "."),
    },
  },
  test: {
    // Utility tests need no DOM. The component tests opt into jsdom with a
    // `@vitest-environment jsdom` docblock, so the fast default stays fast.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
  },
});
