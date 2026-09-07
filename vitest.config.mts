import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    // Every store test gets its own DATA_DIR; keep files from racing on disk.
    fileParallelism: false,
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts", "app/admin/**/*.ts"],
    },
  },
});
