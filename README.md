<h1 align="center">🧊 GlassKit Elements</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/glasskit-elements"><img src="https://img.shields.io/badge/version-0.8.3-f5a623?style=flat-square" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/vanilla_JS-no_dependencies-44cc11?style=flat-square" alt="Vanilla JS"></a>
  <a href="#"><img src="https://img.shields.io/badge/components-24-7ec8e3?style=flat-square" alt="24 Components"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-v0.8.3-lightgrey?style=flat-square" alt="Changelog"></a>
  <a href="https://www.npmjs.com/package/glasskit-elements"><img src="https://img.shields.io/badge/npm-glasskit--elements-cb3837?style=flat-square&logo=npm" alt="npm"></a>
</p>

<p align="center">
  <strong>Drop-in Web Components for <a href="https://github.com/JUNGHERZ/GlassKit">GlassKit CSS</a></strong><br>
  24 vanilla JavaScript custom elements wrapping GlassKit's glassmorphism components.<br>
  Shadow DOM &middot; Native form participation &middot; Zero dependencies.
</p>

<p align="center">
  <a href="https://glasskit-elements.jungherz.com/">🌐 Live Demo</a> &nbsp;&middot;&nbsp;
  <a href="https://glasskit-elements.jungherz.com/docs.html">📖 Documentation</a> &nbsp;&middot;&nbsp;
  <a href="https://github.com/JUNGHERZ/GlassKit">🧊 GlassKit CSS</a>
</p>

---

## ✨ What is GlassKit Elements?

GlassKit Elements is a companion library to [GlassKit CSS](https://github.com/JUNGHERZ/GlassKit). It provides **24 Web Components** that encapsulate the verbose HTML markup required by GlassKit into simple, declarative custom elements.

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
| 🧩 **24 Components** | Buttons, cards, toggles, modals, accordions, tab bars, and more |
| 🪶 **Zero Dependencies** | Pure vanilla JavaScript, works with React, Vue, Svelte, or plain HTML |
| 🎛️ **Form Participation** | Input, toggle, checkbox, radio, select — all work natively with `<form>` via `ElementInternals` |
| 🌗 **Theme Sync** | Automatic dark/light mode sync via `data-theme` on `<html>` |
| 📱 **Mobile-first** | Inherits GlassKit's mobile-optimized design with `safe-area-inset` support |

---

## 📥 Installation

### CDN (quickest)

```html
<!-- 1. GlassKit CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/glasskit@1.3/glasskit.min.css">

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
```

---

## 🚀 Quick Start

```html
<!DOCTYPE html>
<html data-theme="dark">
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/glasskit@1.3/glasskit.min.css">
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
| `<glk-tab-bar>` | Bottom tab bar navigation | — |
| `<glk-tab-item>` | Tab bar item | `label`, `active`, `badge` |

### Content

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-card>` | Glass-effect content card | `glow` |
| `<glk-badge>` | Inline status badge | `variant` (primary, success, error) |
| `<glk-avatar>` | Circular avatar | `size` (sm, lg), `src` |
| `<glk-title>` | Styled heading | — |
| `<glk-divider>` | Horizontal divider | — |
| `<glk-status>` | Status notice | `message` |

### Buttons

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-button>` | Glass-styled button | `variant` (primary, secondary, tertiary), `size` (sm, md, lg, auto), `disabled`, `type` |

### Form Elements

All form components support `name`, `value`, `disabled` and participate in native `<form>` submission via `ElementInternals`.

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-input>` | Text input with label & hint | `label`, `type`, `placeholder`, `hint`, `error`, `required` |
| `<glk-textarea>` | Multi-line text input | `label`, `rows`, `placeholder` |
| `<glk-select>` | Dropdown select | `label` (children: `<option>`) |
| `<glk-search>` | Search input with icon | `placeholder` |
| `<glk-toggle>` | Switch toggle | `label`, `checked`, `disabled` |
| `<glk-checkbox>` | Checkbox | `label`, `checked`, `disabled` |
| `<glk-radio>` | Radio button | `label`, `name`, `value`, `checked` |
| `<glk-range>` | Range slider | `label`, `min`, `max`, `value`, `step` |

### Feedback & Notifications

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-progress>` | Progress bar | `value`, `label`, `variant` (success, error), `size` (sm, lg) |
| `<glk-modal>` | Modal dialog | `open`, `title` |
| `<glk-toast>` | Auto-dismissing notification | `message`, `variant` (success, error, warning), `duration` |

### Containers

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-accordion>` | Accordion container | — |
| `<glk-accordion-item>` | Collapsible section | `title`, `open` |

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

---

## 🛠️ Architecture

- **Shadow DOM** with `adoptedStyleSheets` — GlassKit's `glassSheet` is shared across all component instances
- **Theme wrapper** with `display: contents` — layout-transparent `<div>` for `data-theme` CSS selectors
- **Global `MutationObserver`** — single observer watches `data-theme` changes and syncs all instances
- **`GlkElement`** base class — handles Shadow DOM setup, theme sync, attribute reflection
- **`GlkFormElement`** extends `GlkElement` — adds `ElementInternals` for native form participation

---

## 📁 Project Structure

```
glasskit-elements/
  src/
    index.js              # Registers all components
    base.js               # GlkElement + GlkFormElement
    components/
      navigation/         # glk-nav, glk-pill, glk-tab-bar, glk-tab-item
      content/            # glk-card, glk-badge, glk-avatar, glk-title, ...
      buttons/            # glk-button
      forms/              # glk-input, glk-toggle, glk-checkbox, ...
      feedback/           # glk-progress, glk-modal, glk-toast
      containers/         # glk-accordion, glk-accordion-item
  dist/
    glasskit-elements.js      # IIFE bundle
    glasskit-elements.min.js  # IIFE minified (~71 KB)
    glasskit-elements.esm.js  # ES module bundle
  index.html                  # Landing page
  docs.html                   # Documentation
  showcase.html               # Interactive showcase
  de/                         # German translations
```

---

## 🌐 Browser Compatibility

| Browser | Support |
|---|---|
| Chrome | 90+ |
| Edge | 90+ |
| Safari | 16.4+ |
| Firefox | 103+ |

Requires `adoptedStyleSheets`, `ElementInternals`, and `customElements` v1.

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
