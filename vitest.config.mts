import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // Module mit `import "server-only"` (Datenzugriff) in Unit-Tests laden: der Marker ist nur für den Next-Bundler
      "server-only": fileURLToPath(new URL("./lib/test/server-only.ts", import.meta.url)),
    },
  },
  test: { include: ["lib/**/*.test.ts"], environment: "node" },
});
