import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Mirror the "@/" -> "src/" path alias used across the codebase so tests
    // import modules exactly as the source does (ESM ".js" specifiers included).
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    // Populate a valid, hermetic env before any module (notably src/config/env.ts,
    // which validates process.env at import time) is loaded.
    setupFiles: ['src/test/setup-env.ts'],
    // Fail the run when coverage drops below the thresholds — the CI "test"
    // job relies on this instead of a separate gate.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      // Scoped to the modules that currently have tests. Broaden this list
      // (and raise the thresholds) as suites are added for plugins/hooks/services.
      include: ['src/utils/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});
