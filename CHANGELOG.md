# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.8.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.2
[0.8.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.1
[0.8.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.0
