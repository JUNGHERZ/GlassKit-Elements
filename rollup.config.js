import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  // Full bundle (IIFE) — for CDN <script> usage
  {
    input: 'src/index.js',
    output: {
      file: 'dist/glasskit-elements.js',
      format: 'iife',
      name: 'GlassKitElements'
    },
    plugins: [nodeResolve()]
  },
  // Full bundle (IIFE, minified)
  {
    input: 'src/index.js',
    output: {
      file: 'dist/glasskit-elements.min.js',
      format: 'iife',
      name: 'GlassKitElements'
    },
    plugins: [nodeResolve(), terser()]
  },
  // ES module bundle
  {
    input: 'src/index.js',
    output: {
      file: 'dist/glasskit-elements.esm.js',
      format: 'es'
    },
    plugins: [nodeResolve()]
  }
];
