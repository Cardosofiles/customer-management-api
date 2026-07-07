import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  dts: false,
  esbuildOptions(options) {
    options.alias = { '@': './src' };
  },
});
