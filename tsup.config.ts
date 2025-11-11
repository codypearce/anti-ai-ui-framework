import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'vanilla/index': 'src/vanilla/index.ts',
    'utils/index': 'src/utils/index.ts',
    'types/index': 'src/types/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  treeshake: true,
  minify: true,
  splitting: false,
  sourcemap: true,
  metafile: true,
  clean: true,
  external: ['react', 'react-dom'],
});
