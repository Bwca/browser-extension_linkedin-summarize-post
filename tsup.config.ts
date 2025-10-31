import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/background.ts', 'src/content.ts'],
  outDir: 'dist',
  format: ['cjs'],
  target: 'esnext',
  splitting: false,
  sourcemap: false,
  minify: true,
  clean: true,
  outExtension: () => ({ js: '.js' }),
});

