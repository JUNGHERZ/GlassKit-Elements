<h1 align="center">🧊 GlassKit Elements</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@jungherz-de/glasskit-elements"><img src="https://img.shields.io/npm/v/@jungherz-de/glasskit-elements?style=flat-square&color=f5a623&label=version" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/vanilla_JS-no_dependencies-44cc11?style=flat-square" alt="Vanilla JS"></a>
  <a href="#"><img src="https://img.shields.io/badge/components-36-7ec8e3?style=flat-square" alt="36 Components"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-v1.22.3-lightgrey?style=flat-square" alt="Changelog"></a>
  <a href="https://www.npmjs.com/package/@jungherz-de/glasskit-elements"><img src="https://img.shields.io/badge/npm-%40jungherz--de%2Fglasskit--elements-cb3837?style=flat-square&logo=npm" alt="npm"></a>
</p>

<p align="center">
  <strong>Drop-in Web Components for <a href="https://github.com/JUNGHERZ/GlassKit">GlassKit CSS</a></strong><br>
  36 vanilla JavaScript custom elements wrapping GlassKit's glassmorphism components.<br>
  Shadow DOM &middot; Native form participation &middot; Zero dependencies.
</p>

<p align="center">
  <a href="https://glasskit-elements.jungherz.com/">🌐 Live Demo</a> &nbsp;&middot;&nbsp;
  <a href="https://glasskit-elements.jungherz.com/docs.html">📖 Documentation</a> &nbsp;&middot;&nbsp;
  <a href="https://glasskit.jungherz.com/">🧊 GlassKit CSS</a> &nbsp;&middot;&nbsp;
  <a href="https://glasskit-web.jungherz.com/">🚀 GlassKit Web</a>
</p>

---

## ✨ What is GlassKit Elements?

GlassKit Elements is a companion library to [GlassKit CSS](https://github.com/JUNGHERZ/GlassKit). It provides **36 Web Components** (incl. the iOS 26-style floating Tab-Bar + Accessory) that encapsulate the verbose HTML markup required by GlassKit into simple, declarative custom elements.

It is the **app layer** of the GlassKit family — three layers, one design language: [GlassKit](https://glasskit.jungherz.com) is the pure-CSS foundation, GlassKit Elements wraps it into web components for application UIs, and [GlassKit Web](https://glasskit-web.jungherz.com) is the official Astro template for complete websites on top of the same foundation.

```html
<!-- Before: 5 elements, 6 classes -->
<label class="glass-toggle">
  <input class="glass-toggle__input" type="checkbox">
  <span class="glass-toggle__track">
    <span class="glass-toggle__thumb"></span>
  </span>
  <span class="glass-toggle__label">Dark Mode</span>
</label>

<!-- After: 1 element, 0 classes -->
<glk-toggle label="Dark Mode" checked></glk-toggle>
```

---

## 🎯 Why GlassKit Elements?

| Feature | Details |
|---|---|
| 🔌 **Shadow DOM** | Style encapsulation via `adoptedStyleSheets` — no CSS leaking |
| 🧩 **36 Components** | Buttons, cards, toggles, modals, accordions, lists, popovers, tab bars (incl. floating + accessory), and more |
| 🪶 **Lightweight** | 156 KB minified / 28 KB gzipped (IIFE bundle, GlassKit's component rules included), no external dependencies |
| 📦 **Three bundle formats** | IIFE for `<script>`, minified IIFE for production, ESM for bundlers & tree-shaking |
| 🎛️ **Form Participation** | Input, toggle, checkbox, radio, select — all work natively with `<form>` via `ElementInternals`: value, reset and, since 1.20.0, validity; `<glk-button type="submit">` submits |
| 🌗 **Theme Sync** | Automatic dark/light mode sync via `data-theme` on `<html>`, compact controls via `data-density` |
| 📱 **Mobile-first** | Inherits GlassKit's mobile-optimized design with `safe-area-inset` support |

---

## 📥 Installation

### CDN (quickest)

```html
<!-- 1. GlassKit CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/glasskit@1.22/glasskit.min.css">

<!-- 2. GlassKit Elements -->
<script src="https://cdn.jsdelivr.net/npm/@jungherz-de/glasskit-elements/dist/glasskit-elements.min.js"></script>
```

### npm

```bash
npm install @jungherz-de/glasskit-elements @jungherz-de/glasskit
```

```js
import '@jungherz-de/glasskit/glasskit.css';
import '@jungherz-de/glasskit-elements';
```

### Selective Import

```js
// Only import what you need
import '@jungherz-de/glasskit-elements/components/glk-button.js';
import '@jungherz-de/glasskit-elements/components/glk-toggle.js';

// The base classes, for elements of your own (same module the components use)
import { GlkElement, GlkFormElement } from '@jungherz-de/glasskit-elements/base.js';
```

The per-component files leave `@jungherz-de/glasskit/glasskit-styles.js` as an external import, so the GlassKit stylesheet exists once — a bundler resolves it from `node_modules`; a build-free project adds it to its import map next to the elements entries. Do not mix the `<script>` bundle with `base.js`: the bundle carries its own copy of the classes, so `instanceof` would fail across the two. With the bundle, take the class from it — `GlassKitElements.GlkElement`, or `import { GlkElement } from '@jungherz-de/glasskit-elements'` for the ESM bundle.

---

## 🚀 Quick Start

```html
<!DOCTYPE html>
<html data-theme="dark">
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/glasskit@1.22/glasskit.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@jungherz-de/glasskit-elements/dist/glasskit-elements.min.js"></script>
</head>
<body>
  <glk-button variant="primary">Click me</glk-button>
  <glk-toggle label="Notifications" checked></glk-toggle>
  <glk-card glow>Hello GlassKit!</glk-card>
</body>
</html>
```

---

## 🧩 Components

### Navigation & Layout

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-nav>` | Horizontal navigation bar | — |
| `<glk-pill>` | Circular icon button (46×46px) | `label`, `disabled` |
| `<glk-tab-bar>` | Bottom tab bar navigation | `static`, `floating` |
| `<glk-tab-item>` | Tab bar item | `label`, `active`, `badge` |
| `<glk-tab-dock>` | Wrapper for floating tab bar + optional accessory | `accessory-left` |
| `<glk-tab-accessory>` | Standalone glass capsule (search, compose…) | `label`, `variant` (accent, success, error), `disabled` |
| `<glk-steps>` | Progress through a short flow | `steps`, `current`, `label` |
| `<glk-date-strip>` | Scrolling row of day chips with tone dots; arrow keys, chosen chip centred | `start`, `days`, `value`, `today`, `marks`, `locale`, `label` |

### Content

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-card>` | Glass-effect content card | `glow`, `fill` |
| `<glk-badge>` | Inline status badge, or a filter chip with `interactive` | `variant` (primary, success, warning, error), `interactive`, `selected` |
| `<glk-avatar>` | Circular avatar | `size` (sm, lg), `src` |
| `<glk-title>` | Styled heading | — |
| `<glk-divider>` | Horizontal divider | — |
| `<glk-status>` | Status notice | `message` |
| `<glk-empty>` | Empty state: icon, title, text, one action | `title`, `text` |

### Buttons

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-button>` | Glass-styled button; `type="submit"` / `"reset"` act on its form | `variant` (primary, secondary, tertiary), `size` (sm, md, lg, auto), `disabled`, `type` (button, submit, reset) |

### Form Elements

All form components support `name`, `value`, `disabled` and participate in native `<form>` submission via `ElementInternals` — except `<glk-image-picker>`, which hands its result to `glk-change` instead: a data URL is no form value. Since 1.20.0 they also report their validity to the form (`required`, `pattern`, `min`, `type="email"` … stop a submit with the browser's own message), their `label` names the field for screen readers, and a click on it, `element.focus()` or a `<label for>` lands in the field. Since 1.22.3 a `<fieldset disabled>` around them disables them, as it does native controls.

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-input>` | Text input with label & hint; slots `prefix` / `suffix` for an icon, unit or button in the field | `label`, `type`, `placeholder`, `hint`, `error`, `required`, `readonly`, `min`, `max`, `step`, `maxlength`, `pattern`, `autocomplete`, `inputmode` |
| `<glk-textarea>` | Multi-line text input | `label`, `rows`, `placeholder`, `required`, `readonly` |
| `<glk-select>` | Dropdown select | `label`, `required` (children: `<option>`) |
| `<glk-search>` | Search input with icon | `placeholder`, `label` (accessible name) |
| `<glk-toggle>` | Switch toggle (`role="switch"` on its native checkbox) | `label`, `checked`, `disabled`, `required` |
| `<glk-checkbox>` | Checkbox | `label`, `checked`, `disabled`, `required` |
| `<glk-radio>` | Radio button | `label`, `name`, `value`, `checked`, `required` (per group) |
| `<glk-range>` | Range slider | `label`, `min`, `max`, `value`, `step` |
| `<glk-segmented>` | Small exclusive choice as one control; form-associated | `options` (JSON), `value`, `full`, `overflow` (scroll, wrap), `label`, `name` |
| `<glk-calendar>` | One month with a day to pick; keyboard navigation, `Intl` names; form-associated | `month`, `value`, `today`, `min`, `max`, `marks`, `locale`, `week-start`, `label`, `name` |
| `<glk-image-picker>` | One image with preview, resized on the client, EXIF rotation applied; not form-associated | `src`, `label`, `hint`, `round`, `max`, `type`, `quality`, `accept` |

### Feedback & Notifications

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-progress>` | Progress bar | `value`, `label`, `variant` (success, error), `size` (sm, lg) |
| `<glk-modal>` | Modal dialog — a native `<dialog>`: page behind inert, focus in and back | `open`, `title` |
| `<glk-toast>` | Notification that hides itself, or an offer with one action and an × | `message`, `variant` (success, error, warning), `duration`, `action-label`, `action-value`, `dismissible` |
| `<glk-popover>` | Anchored dropdown / menu | `open`, `placement` (top, bottom, start, end) |
| `<glk-sheet>` | Bottom sheet, the mobile sibling of the modal | `open`, `inline`, `title` |

### Containers

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-accordion>` | Accordion container | — |
| `<glk-accordion-item>` | Collapsible section | `title`, `open` |
| `<glk-list>` | iOS-style grouped list | `flush`, `bare` |
| `<glk-list-item>` | List row (icon + title + subtitle + trailing) | `title`, `subtitle`, `interactive`, `center` |

---

## 🌗 Theming

Set `data-theme` on the `<html>` element — all components sync automatically:

```html
<html data-theme="dark">  <!-- or "light" -->
```

```js
// Toggle theme
const html = document.documentElement;
const current = html.getAttribute('data-theme');
html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
```

### Density

Admin screens, desktop layouts and narrow forms want denser controls. Set `data-density="compact"` on `<html>`, next to `data-theme`:

```html
<html data-theme="dark" data-density="compact">
```

Fields and buttons become 40px high instead of 52 and 56, toggles, checkboxes and radios smaller, list rows and modal actions denser; `removeAttribute('data-density')` switches back at runtime. Without the attribute nothing changes.

> **Requires GlassKit CSS >= 1.21.0.** The sizes are GlassKit's density tokens, so they reach every shadow root by inheritance, like the brand colors below — and so do your own: `[data-density='compact'] { --gl-btn-height: 36px; }`. With `data-glk-defaults="off"` the preset comes from `glasskit.css` on the page, like every other token. The global observer mirrors `data-density` onto each element's theme wrapper as well, so a rule keyed on the attribute matches inside the shadow root too.

### Printing

Print dialogs leave out background graphics by default. With GlassKit 1.21.1 the parts that carry a state keep their colours on paper — checkbox, radio, toggle, progress, the current step, the chosen day, the slider thumb, the tone dots — inside the elements as well. A dark page prints light text and surfaces on white paper; a page meant for printing switches to the light theme for it, and the elements follow:

```js
let printTheme = null;
addEventListener('beforeprint', () => {
  printTheme = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', 'light');
});
addEventListener('afterprint', () => {
  if (printTheme) document.documentElement.setAttribute('data-theme', printTheme);
  else document.documentElement.removeAttribute('data-theme');
});
```

### Icons

Pass an icon as a **direct child**, not wrapped:

```html
<glk-button><svg viewBox="0 0 24 24">…</svg>Save</glk-button>
<glk-list-item title="Download"><svg slot="leading" viewBox="0 0 24 24">…</svg></glk-list-item>
```

> **Requires GlassKit CSS >= 1.10.0.** The icon rules are descendant selectors, and a
> slotted icon stays in the light DOM — before 1.10.0 they never matched it, so button
> icons filled their container and list icons collapsed to 0×0. Wrapping the icon in a
> `<span slot="…">` still does not work: `::slotted()` cannot reach inside an assigned
> node. Size it yourself if you must wrap it.

### Branding

Override GlassKit's `--gl-*` tokens anywhere in the document. Every `<glk-*>` element
inherits them — no JavaScript, no per-element setup:

```css
/* brand.css, loaded after glasskit.css */
:root, [data-theme='dark'] { --gl-color-primary: #2e9e8f; }
[data-theme='light']       { --gl-color-primary: #21786d; }
```

> **Requires 1.9.0.** Before that, every element re-declared the tokens inside its own
> shadow root, so document-level overrides were silently ignored in components while
> still applying to plain `.glass-*` markup — projects came out half-branded. If you are
> upgrading from ≤1.8.0 and already ship a brand stylesheet, expect your components to
> change to the colors you intended all along.

Token defaults are placed on the document once, inside `@layer glasskit-defaults`, so
pages that never load `glasskit.css` still work and your brand file always wins.

Since 1.20.0 that layer carries the `--gl-*` tokens only — GlassKit's `color-scheme` stays off the page. Each element sets it on its own theme wrapper, so a select's list or a date picker inside matches the element while the page keeps its scheme. (Before, importing the elements turned the whole page to `color-scheme: dark`: unstyled text white, links light blue, native controls dark.) The token names are still global, so a component of yours that reads `var(--gl-…, fallback)` gets GlassKit's value. A page that declares the tokens itself, or wants them on part of the page only, switches the defaults off:

```html
<html data-glk-defaults="off">   <!-- watched: may be set or removed later -->
```

---

## 🛠️ Architecture

- **Shadow DOM** with `adoptedStyleSheets` — GlassKit's `componentsSheet` is shared across all component instances; token declarations stay on the document so branding can be inherited
- **Theme wrapper** with `display: contents` — layout-transparent `<div>` for `data-theme` and `data-density` CSS selectors
- **Global `MutationObserver`** — single observer watches `data-theme` and `data-density` changes and syncs all instances
- **`GlkElement`** base class — handles Shadow DOM setup, theme sync, attribute reflection
- **`GlkFormElement`** extends `GlkElement` — adds `ElementInternals` for native form participation, delegates focus to its field and reports the field's validity
- **Native semantics** — labels tied to their fields, the toggle's `role="switch"` on its native checkbox, `<glk-modal>` a native `<dialog>`, `aria-expanded` on accordion and popover triggers

### Build your own element

Since 1.14.0 both base classes are exported, so a project element inherits the whole setup — open shadow root with GlassKit's stylesheet adopted (`.glass-*` classes work inside), theme wrapper following `data-theme` and `data-density`, listeners re-armed when the element moves, `emit()` for bubbling, composed events:

```js
import { GlkElement } from '@jungherz-de/glasskit-elements';   // or '…/base.js', or GlassKitElements.GlkElement from the CDN bundle

class DemoCounter extends GlkElement {
  static get observedAttributes() { return ['count']; }
  render() {
    this._btn = this.createElement('button', ['glass-btn', 'glass-btn--secondary', 'glass-btn--sm', 'glass-btn--auto']);
    this._wrapper.appendChild(this._btn);
  }
  setupEvents() {
    this._onClick = () => { this.count += 1; this.emit('demo-count', { count: this.count }); };
    this._btn.addEventListener('click', this._onClick);
  }
  teardownEvents() { this._btn?.removeEventListener('click', this._onClick); }
  onAttributeChanged() { this._btn.textContent = `Clicked ${this.count}×`; }
  get count() { return Number(this.getAttribute('count')) || 0; }
  set count(v) { this.setAttribute('count', v); }
}
customElements.define('demo-counter', DemoCounter);
```

Hooks: `render()` builds into `this._wrapper`, `setupEvents()` / `teardownEvents()` run on every connect / disconnect, `onAttributeChanged(name, old, value)` after the first render. `static get displayInline()` → `true` for inline elements; `static get observesLightDom()` → `true` re-runs `projectLightDom()` whenever light-DOM children change. `GlkFormElement` adds `setFormValue()`, `setValidity()`, `resetValue()` / `restoreValue()`; since 1.20.0 it delegates focus (`static get delegatesFocus()`) and, when `get _validityField()` returns your native field, reports that field's validity on the host after every `setFormValue()` and attribute change.

---

## 📁 Project Structure

```
glasskit-elements/
  src/
    index.js              # Registers all components
    base.js               # GlkElement + GlkFormElement
    components/
      navigation/         # glk-nav, glk-pill, glk-tab-bar, glk-tab-item, glk-tab-dock, glk-tab-accessory
      content/            # glk-card, glk-badge, glk-avatar, glk-title, ...
      buttons/            # glk-button
      forms/              # glk-input, glk-toggle, glk-checkbox, ...
      feedback/           # glk-progress, glk-modal, glk-toast, glk-popover
      containers/         # glk-accordion, glk-accordion-item, glk-list, glk-list-item
  dist/
    glasskit-elements.js      # IIFE bundle (229 KB raw / 46 KB gzipped)
    glasskit-elements.min.js  # IIFE minified (156 KB raw / 28 KB gzipped)
    glasskit-elements.esm.js  # ES module bundle (221 KB raw / 45 KB gzipped)
    components/               # one ESM file per element + base.js (GlkElement, GlkFormElement)
  index.html                  # Landing page
  docs.html                   # Documentation
  showcase.html               # Interactive showcase
  de/                         # German translations
```

---

## 🌐 Browser Compatibility

| Browser | Support |
|---|---|
| Chrome | 111+ |
| Edge | 111+ |
| Safari | 16.4+ |
| Firefox | 113+ |

The floor is GlassKit's: its tokens are derived with `color-mix()`. The elements also need constructable stylesheets, `ElementInternals`, `delegatesFocus`, `<dialog>` and `inert` — all inside that floor. A few refinements come later and fall back quietly: first-line alignment of toggle, checkbox and radio (`lh`, Firefox 120), the divider of list rows without icon (`:has()`, Firefox 121), right-to-left mirroring of select chevron, toggle thumb and progress fill (`:dir()`, Chrome 120).

---

## 🤖 AI / LLM Reference

[`SKILL.md`](SKILL.md) is a tag-based, machine-readable reference for LLMs and AI copilots. It contains copy-paste-ready HTML for all 36 elements, attribute / slot / event tables, composition patterns, and a common-mistakes section. It is the companion to the class-based `SKILL.md` in [GlassKit CSS](https://github.com/JUNGHERZ/GlassKit) — use both together for complete coverage of the glass stack.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-component`)
3. Commit your changes (`git commit -m 'Add new component'`)
4. Push to the branch (`git push origin feature/new-component`)
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE) — Copyright (c) 2026 Jungherz GmbH

---

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes.

---

<p align="center">
  <sub>Built on <a href="https://github.com/JUNGHERZ/GlassKit">🧊 GlassKit CSS</a> by <a href="https://www.jungherz.com">Jungherz GmbH</a> with lots of ❤️ for detail.</sub>
</p>
