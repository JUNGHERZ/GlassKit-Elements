import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

// Every element lives at src/components/{category}/glk-{name}.js. The per-component
// entries below flatten that into dist/components/glk-{name}.js so that
// `@jungherz-de/glasskit-elements/components/glk-button.js` resolves — the import
// form documented in README.md and SKILL.md. Shared code (base.js, the GlassKit
// stylesheet) is split into dist/components/shared/ instead of being copied into
// each file.
const COMPONENT_ROOT = 'src/components';
const componentEntries = Object.fromEntries(
  readdirSync(COMPONENT_ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .flatMap(d => readdirSync(join(COMPONENT_ROOT, d.name))
      .filter(f => f.startsWith('glk-') && f.endsWith('.js'))
      .map(f => [basename(f, '.js'), join(COMPONENT_ROOT, d.name, f)]))
);
// base.js is an entry of its own, not only a shared chunk: an entry keeps a
// stable file name (dist/components/base.js — the `./base.js` export), and
// Rollup never duplicates an entry module, so every component imports that
// one file and a project's subclass shares the same GlkElement identity.
componentEntries.base = 'src/base.js';

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
  },
  // Per-component ES modules — one entry per element, shared chunks extracted.
  // GlassKit's stylesheet module stays an external import here: these files
  // are consumed through a bundler or an import map, and both resolve
  // '@jungherz-de/glasskit/glasskit-styles.js' to the one copy the project
  // already has. Inlined, base.js carried the whole sheet (61 KB) a second
  // time next to the project's own glasskit-styles import, and two sheets
  // meant two adopted copies in every shadow root. The full bundles above keep
  // inlining it — a <script> tag has nothing to resolve against.
  {
    input: componentEntries,
    external: ['@jungherz-de/glasskit/glasskit-styles.js'],
    output: {
      dir: 'dist/components',
      format: 'es',
      entryFileNames: '[name].js',
      chunkFileNames: 'shared/[name]-[hash].js'
    },
    plugins: [nodeResolve()]
  }
];
