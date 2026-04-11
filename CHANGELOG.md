# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.9.0] – 2026-04-11

### Added

- **Three new components — `glk-popover`, `glk-list`, `glk-list-item`** — tracking GlassKit CSS v1.4.0:
  - **`<glk-popover>`** — anchored dropdown / menu container with fade + scale animation, `placement` attribute (`top` / `bottom` / `start` / `end`), `.show()` / `.close()` / `.toggle()` methods, automatic outside-click and <kbd>Escape</kbd>-key dismiss. Uses a `slot="trigger"` pattern; toggling is handled internally. Method is deliberately named `.toggle()` instead of `.togglePopover()` to avoid collision with the native `HTMLElement.togglePopover()` API.
  - **`<glk-list>`** — iOS-style grouped settings container with `flush` and `bare` modifiers.
  - **`<glk-list-item>`** — list row with `title`, `subtitle`, `interactive`, `center` attributes and `leading` / `trailing` slots for icons and values. Emits `glk-click` when `interactive`.
- **`SKILL.md` AI reference** — tag-based companion to the class-based SKILL.md in `@jungherz-de/glasskit`. Structured frontmatter + sections for setup, element catalog (27 elements), composition patterns, rules & common mistakes, quick reference.
- **Component count** bumped from **24 → 27** across README, landing pages, showcase, and docs.

### Changed

- **Peer dependency** `@jungherz-de/glasskit` raised from `>=1.3.0` to `>=1.4.0`. The new List and Popover components ship their CSS in 1.4.0 only.
- **CDN version pin** updated from `@1.3` to `@1.4` in `showcase.html`, `docs.html`, and their German counterparts.

### Design Decisions

- **Pure Shadow DOM + sentinel-sibling trick for `<glk-list-item>`** — the GlassKit-CSS auto-divider rule relies on `:not(:last-child)::after`, which cannot cross Shadow DOM boundaries. Rather than cloning children into a parent shadow (which would break lit-html, HybridsJS, React, Vue, and Svelte template bindings), each list-item renders its own `<li class="glass-list__item">` inside its own shadow root with a hidden sibling so `:last-child` never matches internally. `<glk-list>` then marks the actual last child in the light DOM with a `data-last` attribute, and the item's shadow adopts a one-line override sheet `:host([data-last]) .glass-list__item::after { content: none; }` to hide the divider on the real last row. Zero CSS duplication, zero DOM cloning, framework-safe.
- **Why not data-carrier pattern** — `<glk-select>` reads `<option>` children and clones them into its shadow. That works for static child data, but with reactive frameworks like lit-html or HybridsJS, the original templates re-render independently of our clones, losing bindings and event listeners. For list-items we kept slot projection pure.

---

## [0.8.3] – 2026-03-27

### Changed

- **package.json metadata**: Added `homepage`, `repository`, and `bugs` fields so npm registry displays the correct website and GitHub links

---

## [0.8.2] – 2026-03-22

### Fixed

- **CDN/npm references**: All documentation, landing pages, and README now correctly reference `@jungherz-de/glasskit-elements` scope

---

## [0.8.1] – 2026-03-22

### Fixed

- **glk-select**: Options not rendering — deferred option copying to next frame (`requestAnimationFrame`) to ensure light DOM children are parsed
- **glk-modal**: Footer buttons not visible — deferred footer population to next frame for same timing reason
- **glk-tab-item**: Badge positioned incorrectly — moved badge element inside `.glass-tab-bar__icon` container (which has `position: relative`)
- **glk-tab-item**: Icons not styled correctly — SVGs are now cloned from light DOM into shadow DOM so GlassKit CSS rules apply; inline attributes (`stroke`, `width`, `fill`) stripped during clone

### Added

- **glk-tab-bar `static` attribute**: Sets `position: relative` instead of `fixed` for embedding in documentation previews
- **Showcase navbar**: Added `glk-nav` with pill buttons (back, theme toggle) and `glk-tab-bar` at bottom
- **Docs live previews**: Added interactive previews for `glk-nav`, `glk-pill`, `glk-tab-bar`, `glk-modal`, and `glk-toast`
- **npm scope**: Package published as `@jungherz-de/glasskit-elements`
- **GitHub Pages**: Switched from import maps to built IIFE bundle (`dist/glasskit-elements.min.js`)
- **Phone frame**: Matched GlassKit original styling with multi-layer bezel box-shadow
- **SEO meta tags**: Open Graph, Twitter Cards, hreflang, canonical on all 6 pages
- **German translations**: `de/index.html`, `de/docs.html`, `de/showcase.html` with language switcher
- **Language switcher**: `🇩🇪 DE` / `🇬🇧 EN` pills in header (index) and fixed button (docs)
- **README.md, CHANGELOG.md, LICENSE**: Project documentation

### Changed

- **GitHub links**: Point to `JUNGHERZ/GlassKit-Elements` instead of `JUNGHERZ/GlassKit`
- **dist/ tracked in git**: Required for GitHub Pages deployment

---

## [0.8.0] – 2026-03-21

### Added 🎉

- **Initial public release** of GlassKit Elements
- **24 Web Components** wrapping the full GlassKit CSS component library
- **Base classes** (`GlkElement`, `GlkFormElement`) with Shadow DOM + `adoptedStyleSheets`
- **Shadow DOM architecture** using GlassKit's exported `glassSheet` constructable stylesheet
- **Theme sync** via global `MutationObserver` on `data-theme` attribute
- **Form participation** for all form components via `ElementInternals` (`formAssociated`)
- **Components:**
  - Navigation: `glk-nav`, `glk-pill`, `glk-tab-bar`, `glk-tab-item`
  - Content: `glk-card`, `glk-badge`, `glk-avatar`, `glk-title`, `glk-divider`, `glk-status`
  - Buttons: `glk-button` (primary, secondary, tertiary; sm, md, lg, auto)
  - Forms: `glk-input`, `glk-textarea`, `glk-select`, `glk-search`, `glk-toggle`, `glk-checkbox`, `glk-radio`, `glk-range`
  - Feedback: `glk-progress`, `glk-modal`, `glk-toast`
  - Containers: `glk-accordion`, `glk-accordion-item`
- **Three build formats:** IIFE (CDN), ESM (bundlers), ESM per-component (tree-shaking)
- **Landing page** (`index.html`) with phone mockup and before/after comparison
- **Documentation** (`docs.html`) with live previews, attribute tables, and scroll spy
- **Showcase** (`showcase.html`) with all components in a mobile frame
- **German translations** for all pages (`de/`)
- **SEO meta tags** (Open Graph, Twitter Cards, hreflang, canonical)
- **Language switcher** matching GlassKit's design (🇩🇪 DE / 🇬🇧 EN)

### Design Decisions

- **Shadow DOM + `adoptedStyleSheets`** over Light DOM — proper encapsulation while sharing the GlassKit `CSSStyleSheet` object across all instances
- **`display: contents`** on the theme wrapper div — layout-transparent node for `data-theme` CSS selectors without affecting component layout
- **Two base classes** — `GlkElement` for general components, `GlkFormElement` (with `formAssociated = true`) for form elements only
- **Peer dependency** on `@jungherz-de/glasskit` — CSS is not bundled, users load it separately

---

[0.9.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.9.0
[0.8.3]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.3
[0.8.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.2
[0.8.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.1
[0.8.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.0
