// ============================================================
// GlassKit Elements – Version Consistency Check
//
// The version is written out by hand in the README badge, in the SKILL.md
// front matter and on six HTML pages (three plus their German counterparts).
// Every release so far has left some of them behind — the landing pages sat
// six versions back before anyone noticed, because nothing renders wrong
// when they are stale.
//
// Two different versions are in play here, so they are checked separately:
// this package's own version, and the GlassKit CSS release the pages pin and
// the docs name, which follows the peer dependency.
//
// Usage:  npm run check:versions
// ============================================================

import { readFileSync, existsSync, readdirSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const VERSION = pkg.version;

// ">=1.11.0" → the GlassKit release the docs should be pointing at.
const peerRange = pkg.peerDependencies?.['@jungherz-de/glasskit'] ?? '';
const peerMatch = peerRange.match(/(\d+\.\d+\.\d+)/);
if (!peerMatch) {
  console.error('::error::cannot read the @jungherz-de/glasskit peer dependency from package.json');
  process.exit(1);
}
const PEER = peerMatch[1];
const PEER_PIN = PEER.split('.').slice(0, 2).join('.');   // CDN URLs pin major.minor

const html = f => existsSync(f) ? readdirSync(f).filter(n => n.endsWith('.html')).map(n => `${f}/${n}`) : [];
const FILES = ['README.md', 'SKILL.md', ...html('.'), ...html('de')];

// Each pattern anchors on the surrounding markup rather than on a bare number,
// so prose like "since 1.10.0" stays untouched — those references are history
// and must not be rewritten.
const LABELS = [
  ['shields badge',        /badge\/(?:version|changelog)-v?(\d+\.\d+\.\d+)/g],
  ['version label',        /class="version">v(\d+\.\d+\.\d+)/g],
  ['docs sidebar',         /class="docs-sidebar__version">v(\d+\.\d+\.\d+)/g],
  ['docs hero badge',      /class="docs-hero__badge">v(\d+\.\d+\.\d+)/g],
  ['showcase heading',     /Showcase v(\d+\.\d+\.\d+)/g],
  ['SKILL.md description', /library \(v(\d+\.\d+\.\d+)\)/g],
];

// These name GlassKit CSS, not this package.
const PEER_LABELS = [
  ['GlassKit CDN pin',      /@jungherz-de\/glasskit@(\d+\.\d+)\//g, PEER_PIN],
  ['GlassKit peer version', /wrapping GlassKit CSS v(\d+\.\d+\.\d+)/g, PEER],
];

const problems = [];
let found = 0;

for (const file of FILES) {
  const lines = readFileSync(file, 'utf-8').split('\n');

  const check = (name, pattern, expected) => {
    for (const [i, line] of lines.entries()) {
      for (const match of line.matchAll(pattern)) {
        found++;
        if (match[1] !== expected) {
          problems.push(`${file}:${i + 1} – ${name} says ${match[1]}, expected ${expected}`);
        }
      }
    }
  };

  for (const [name, pattern] of LABELS) check(name, pattern, VERSION);
  for (const [name, pattern, expected] of PEER_LABELS) check(name, pattern, expected);
}

// A renamed class would make every pattern above match nothing and the check
// would pass while saying nothing. Refuse to be that useless.
if (found === 0) {
  problems.push('no version label matched at all – the patterns in this script are out of date');
}

// The newest changelog entry belongs to the version being shipped, and its
// heading is reference syntax: without the matching link definition at the
// bottom GitHub renders a literal "[1.12.0]" instead of a link.
if (existsSync('CHANGELOG.md')) {
  const changelog = readFileSync('CHANGELOG.md', 'utf-8');
  const newest = changelog.match(/^## \[(\d+\.\d+\.\d+)\]/m);
  if (!newest) {
    problems.push('CHANGELOG.md – no "## [x.y.z]" entry found');
  } else if (newest[1] !== VERSION) {
    problems.push(`CHANGELOG.md – newest entry is ${newest[1]}, expected ${VERSION}`);
  } else if (!new RegExp(`^\\[${VERSION.replace(/\./g, '\\.')}\\]:`, 'm').test(changelog)) {
    problems.push(`CHANGELOG.md – entry ${VERSION} has no "[${VERSION}]: …" link definition`);
  }
}

if (problems.length) {
  for (const problem of problems) console.error(`::error::${problem}`);
  console.error(`\n✗ ${problems.length} version reference(s) out of step (package ${VERSION}, GlassKit peer ${PEER})`);
  process.exit(1);
}

console.log(`✅ ${found} version references agree (package v${VERSION}, GlassKit peer v${PEER})`);
