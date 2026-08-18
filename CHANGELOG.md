# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.12.0] – 2026-08-18

### Fixed

- **`<glk-select>` copied its options exactly once.** `render()` cloned the
  `<option>` children into the shadow tree on the next frame and nothing watched
  them afterwards — no observer, no `slotchange`, and `observedAttributes` cannot
  cover children. Replacing the list after that first frame left the rendered
  select on the first state for good. Measured: with light-DOM options `['c']`
  the shadow select still reported `['a', 'b']`.

  It fails quietly. Nothing errors, the element looks right, and
  `querySelectorAll('option')` on the host returns the correct values — the
  difference only exists inside the shadow root, which is why it typically
  surfaces as a failing end-to-end test rather than a bug report.

  A `MutationObserver` now keeps the copy in step. Adding, removing or replacing
  options is picked up, including a changed option label.

- **The selection no longer jumps to the first entry on every update.** Rebuilding
  starts with `innerHTML = ''`, which drops the selection. It is now restored: a
  selected value that is still in the new list stays selected, otherwise the
  `value` attribute decides, otherwise the browser picks the first option.

- **The empty string is a valid selection.** `render()` guarded the initial value
  with `if (value)`, so `value=""` was discarded and the field fell back to the
  first option. `""` is a real choice in plenty of forms ("detect automatically",
  "enter your own below"). Measured with the `""` option placed second: before,
  the field showed the first option; now it shows the `""` one.

  As a consequence, a `value` naming no existing option now leaves the current
  selection alone instead of clearing it — when the matching option arrives with
  a later update, it is selected then. This makes a controlled select self-heal
  when value and options arrive in separate renders.

- **`<glk-tab-item>` and `<glk-modal>` had the same defect** and were fixed with
  it. Both cloned from the light DOM once per `requestAnimationFrame`: a swapped
  `<svg>` never reached the tab item, and replaced `[slot="actions"]` buttons never
  reached the modal footer. The modal also forwarded clicks to the button object it
  had captured at clone time, so after a framework re-render the footer buttons
  drove nodes that were no longer in the document. The original is now looked up at
  click time.

- **A moved element stopped reacting.** `disconnectedCallback` calls
  `teardownEvents()`, but `setupEvents()` only ever ran on the first connect, and
  the element was dropped from the theme-sync registry for good. Moving a
  `<glk-*>` element in the DOM — routine for any framework — left it looking
  correct while its events were dead. Both now re-arm on every connect. Measured:
  after `otherParent.appendChild(el)`, `glk-change` fired 0 times before and 1
  time after, with no double-firing.

### Added

- `GlkElement.observesLightDom` / `projectLightDom()` — the hook the three
  components above share, so a component that copies light-DOM children into its
  shadow tree gets an observer without repeating the wiring.
- `element.refresh()` — public escape hatch that re-runs the copy immediately,
  for the cases an observer cannot see. Nobody needs to reach into
  `element.shadowRoot` any more.

### Compatibility

No tag, attribute or event changed. Three behaviour changes worth knowing:
`value=""` is now honoured, a `value` matching no option no longer clears the
selection, and a moved element keeps working instead of going quiet.

---

## [1.11.0] – 2026-08-17

### Fixed

- **`<glk-radio>` did not group: two radios with the same `name` could both be
  checked.** Every `<glk-radio>` keeps its `<input type="radio">` in its own shadow
  root, and native radio grouping works per tree — it does not reach across shadow
  boundaries. The `name` attribute was passed through and so *looked* like a
  grouping that did not exist. Measured before the fix with two
  `<glk-radio name="skr">`: right after clicking the second one, **both** inputs
  reported `checked === true`, and a `FormData` of the surrounding form carried
  **three** `skr` entries for three radios.

  The group is now kept by the component, following the HTML definition as closely
  as it can: same `name`, same containing tree, same form owner. Selecting one
  clears the others — by click, by arrow key, by the `checked` property and by the
  `checked` attribute — so `FormData` carries exactly one entry. Two `<glk-radio>`
  in two different `<form>`s stay two groups, a radio without `name` is not grouped,
  and when several carry `checked` in the markup the last one wins, as with native
  radios.

- **A radio group had no keyboard navigation.** Arrow keys did nothing and every
  radio was its own tab stop. The group is now a single tab stop with a roving
  `tabindex`; <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> move through it,
  wrap around, skip disabled entries and select as they go, firing `glk-change` and
  `change` exactly as a click does. <kbd>Tab</kbd> and modified arrow presses are
  left alone.

### Changed

- Requires **GlassKit CSS >= 1.11.0**, which brands the focus ring, the warm rim and
  the primary glow from `--gl-color-primary`, and aligns checkbox, radio and toggle
  on the *first* line of a multi-line label instead of the middle of the text block.
  Both reach into the shadow roots without any change here.
- The CDN snippets on the site and in the docs pinned `glasskit@1.6` — below the peer
  requirement since 1.10.0. Now `@1.11` everywhere.

### Why no `<glk-radio-group>`

It was the report's second proposal, and it is the only way to get `role="radiogroup"`
announced. It is not carried here: new components are out of scope for this round, and
a container holding the selection would be a second, competing source of truth next to
the `checked` attribute. Grouping and keyboard navigation are the parts that could be
fixed without one, and they are. For the screen-reader announcement, wrap the radios in
your own `<div role="radiogroup" aria-label="…">` — documented in SKILL.md.

### Compatibility

The grouping is a **behaviour change** for code that relied on two same-named radios
staying independent: they now clear each other. That was the defect, but it is worth
checking before upgrading. Tab order changes too — a group is one tab stop now, not
one per radio.

---

## [1.10.0] – 2026-08-17

### Fixed

- **Icons passed into an element were not styled by GlassKit.** The icon rules are
  descendant selectors (`.glass-btn svg`, `.glass-list__leading svg`, …), but a slotted
  icon stays in the light DOM and is no descendant of the shadow tree, so they never
  matched. Nothing errored — the component just rendered with an unusable icon.

  | | before | after |
  |---|---|---|
  | `<glk-button>` | 1210×1210 | 20×20 |
  | `<glk-tab-accessory>` | 54×54 | 22×22 |
  | `<glk-list-item slot="leading">` | 28×28 | 24×24 |
  | `<glk-list-item leading-lg>` | 28×28 | 32×32 |
  | `<glk-list-item slot="trailing">` | 0×0 | 18×18 |
  | `<glk-status slot="icon">` | 0×0 | 20×20 |
  | `<glk-pill>` | 32×32 | 20×20 |

  Fixed in GlassKit CSS 1.10.0, which gives every icon rule sitting above a slot a
  `::slotted()` twin. This release only raises the peer dependency and documents the
  behavior; no element changed.

  `<glk-tab-item>` was never affected — it clones the SVG into its shadow root, where it
  is a real descendant.

### Why this is not fixed inside the elements

The finding proposed adding `::slotted()` rules to the element stylesheets. That was not
the right place, and it would not have been complete:

1. **`::slotted()` matches only the assigned node, never inside it.** An icon wrapped in a
   container — `<span slot="leading"><svg …></span>` — cannot be styled from the shadow
   root at all. That is a limit of the platform. Wrapped icons still measure 0×0 after
   this release; pass the `<svg>` directly, as the docs show, or size it yourself.
2. **The rules belong to the stylesheet that owns them.** `.glass-btn--primary`,
   `--secondary` and `--tertiary` each carry their own icon rule, as do the four
   accessory variants. Restating them here would duplicate GlassKit's cascade in a second
   project and let the two drift apart. Written as twin selectors next to the originals,
   they cannot.

The proposed rule also omitted `stroke: currentColor`; combined with `fill: none` that
renders an icon invisible unless it carries its own presentation attributes.

### Changed

- Peer dependency raised to `@jungherz-de/glasskit >= 1.10.0`.
- **Documented how to pass icons** in README and SKILL.md, including the wrapped-icon
  limitation and the fact that a project's own rules keep precedence over `::slotted()`.

---

## [1.9.0] – 2026-08-17

Version numbers of GlassKit and GlassKit Elements are realigned with this release.

### Fixed

- **`--gl-*` overrides from the document had no effect inside any `<glk-*>` element.**
  Every element adopted the full GlassKit stylesheet, which contains
  `:root, [data-theme="dark"] { … }`. Inside the shadow root that selector matches the
  element's own `.glk-wrapper`, so all tokens were re-declared locally — and a matching
  rule always beats an inherited value. A project's brand file reached plain `.glass-*`
  markup but never the components, so projects came out half-branded.

  Measured before the fix, same page, same button:

  | | document | inside `.glk-wrapper` |
  |---|---|---|
  | `--gl-color-primary` | `#2e9e8f` (brand) | `#e8852d` |
  | `--gl-color-text` | `#12242f` (brand) | `#1a2a36` |
  | rendered | teal | orange |

  Elements now adopt `componentsSheet` — the component rules without the token
  declarations — so the document's values are inherited normally. Both the CSS class and
  the web component render the brand color.

  `!important` never helped here, and neither did `theme-override.css`: both operate at
  document level, while the problem was a competing declaration inside the shadow root.

### Added

- **Token defaults are placed on the document**, once, wrapped in
  `@layer glasskit-defaults`. Since the tokens no longer live in the shadow roots, this
  keeps the advertised standalone case working — a page that loads only the elements
  bundle and no `glasskit.css` still renders styled components. The cascade layer means
  an ordinary brand stylesheet wins regardless of load order, and so does a linked
  `glasskit.css`, at identical values.

  The sheet is *appended* to `document.adoptedStyleSheets`, never assigned, and a global
  guard prevents a second injection when more than one copy of the bundle is loaded
  (verified: full bundle plus a per-component entry still yields exactly one sheet).

- **Branding is now documented** in README and SKILL.md. It was not mentioned in the
  README at all, and SKILL.md claimed the opposite of the actual behavior.

### Changed

- Peer dependency raised to `@jungherz-de/glasskit >= 1.9.0`, the release that exports
  the split stylesheet this depends on.

### Upgrading

Projects **without** `--gl-*` overrides see no change — verified against Voice-Office-Hub
across all 117 tokens in both themes: zero differences.

Projects **with** overrides will see their components change to the branded values. That
is the fix working, but it is visible. Anything your brand file sets that differs from
GlassKit's default will now also apply inside components. Tokens that only feed
`.glass-bg` (`--gl-color-bg-*`, `--gl-bg-aurora-*`) were already applied at document
level and do not change.

---

## [1.8.0] – 2026-08-16

### Added

- **`<glk-card fill>` stretches the card to its grid or flex cell.** A card in a
  `repeat(auto-fit, minmax(…, 1fr))` grid left the visible `.glass-card` at its natural
  height even though the host stretched correctly, so tiles ended up ragged and footer
  buttons sat at different heights. Measured with four tiles: hosts all 248 px, cards
  184/200/248/184, footers 83/99/147/83 px from the top of their tile. With `fill`, all
  four cards are 248 px and all footers sit at 147 px.

  ```html
  <glk-card fill>…</glk-card>
  ```

  The host becomes a grid when `fill` is set, and the card becomes a flex column so a
  footer can be pushed down with `margin-top: auto`. Making the *host* a grid is the
  point: it is stretched by the outer layout but keeps `height: auto`, so the host alone
  is not enough — a child needs either a grid stretch or a definite height to resolve
  against.

- **`part` on the structural elements of `glk-card`, `glk-list` and `glk-modal`**, so
  their internals can be styled from outside the shadow root:

  | Element | Parts |
  |---|---|
  | `<glk-card>` | `card` |
  | `<glk-list>` | `header`, `list` |
  | `<glk-modal>` | `overlay`, `modal`, `header`, `body`, `footer` |

  ```css
  glk-card::part(card) { border-radius: 8px; }
  ```

  `::part(card) { height: 100% }` also solves the stretch problem on its own — it is the
  general escape hatch, `fill` is the ergonomic shortcut for the common case. `fill` is
  deliberately **not** offered on `glk-modal`: an overlay is not a grid item, so it has
  no such problem.

- **`GlkElement.hostStyles`** — an optional static returning a `CSSStyleSheet`, adopted
  after the shared sheets. It keeps per-component selectors like `:host([fill])` out of
  the shared stylesheet, so an attribute only means something where it is documented.

### Changed

- Peer dependency raised to `@jungherz-de/glasskit >= 1.7.1`, which declares
  `color-scheme`. Because that rule is keyed on `[data-theme]`, it applies to the
  `.glk-wrapper` inside every shadow root — so `<glk-input type="date">` and friends now
  get browser widgets in the right scheme.

---

## [1.7.0] – 2026-08-16

### Fixed

- **`/components/*` imports resolved to nothing.** The export map advertised
  `"./components/*": "./dist/components/*.js"`, but Rollup only ever produced the three
  full bundles — `dist/components/` did not exist. The subpath was also malformed: `*`
  captures the whole remainder including the extension, so the documented specifier
  `…/components/glk-button.js` expanded to `dist/components/glk-button.js.js`. Every
  per-component import in README.md and SKILL.md therefore failed with a resolution
  error.

  Both halves are fixed rather than removed, because the smaller import is worth having:

  - Rollup now emits one ES module per element to `dist/components/glk-{name}.js`
    (29 entries, discovered from `src/components/{category}/`), with `base.js` and the
    GlassKit stylesheet split into a single shared chunk under
    `dist/components/shared/` instead of being copied into each file.
  - The export map entry is now `"./components/*.js": "./dist/components/*.js"`, which
    matches the documented specifier. `"./package.json"` was added alongside it.

  Importing a single element pulls ~50 KB (shared chunk + component) instead of the
  112 KB full ESM bundle.

### Changed

- **Peer dependency raised to `@jungherz-de/glasskit >= 1.7.0`.** The elements bundle
  the GlassKit stylesheet into their shadow roots, so they carry the 1.7.0 WCAG AA
  contrast fixes for badges, the primary button, and filled state surfaces.

  > **Release order matters:** `dist/` embeds whatever GlassKit version is installed at
  > build time. Publish `@jungherz-de/glasskit@1.7.0` first, then `npm install` here and
  > rebuild before tagging.

- **npm publishing switched to Trusted Publishing (OIDC).** `release.yml` requests
  `id-token: write` and publishes without `NODE_AUTH_TOKEN`; provenance is generated
  automatically. Requires a trusted publisher registered on npm for
  `JUNGHERZ/glasskit-elements` with workflow `release.yml`, so the filename must stay.
- **Release workflow** now fails when the committed `dist/` differs from a fresh build,
  and the checkout/setup-node/release actions were bumped to the majors already used by
  the GlassKit repo. `prepublishOnly` runs `npm run build`.
- **`prebuild` clears `dist/components/`** before each build. The shared chunk carries a
  content hash in its filename, so a rebuild against a new GlassKit version writes a new
  file instead of replacing the old one. Without the clean step the stale chunk would be
  committed and published forever.

---

## [1.6.2] – 2026-07-19

Site / docs / README only — no component or API changes.

### Fixed

- **Stale component counts aligned to 29** across all pages:
  - Docs hero (EN + DE) still said "all 24 web components" — the only place left from the 24-component era.
  - Meta / Open Graph / Twitter descriptions on the landing pages (EN + DE) and docs (EN + DE) still said 27.
  - SKILL.md project-structure table still said "registers all 27 elements".
- **German landing page wording**:
  - Hero headline gradient said "for GlassKit CSS" — now "für GlassKit CSS", matching the page's own `<title>` and meta tags.
  - Hero badge said "29 Components" — now "29 Komponenten", matching the German docs badge and feature card.

---

## [1.6.1] – 2026-07-19

Site / docs / README only — no component or API changes.

### Added

- **GlassKit family cross-linking** — landing pages, docs, and README now interlink the three-layer family (GlassKit CSS → GlassKit Elements → GlassKit Web), mirroring the family section on the [GlassKit Web](https://glasskit-web.jungherz.com) site:
  - **Landing pages (EN + DE)** — new "The GlassKit family" / "Die GlassKit-Familie" section ("Three layers, one design language") with three cards; the own card is marked "you are here" / "du bist hier". Footer gained links to [GlassKit](https://glasskit.jungherz.com) and [GlassKit Web](https://glasskit-web.jungherz.com).
  - **Docs (EN + DE)** — new closing section "Building a complete website?" / "Eine komplette Website bauen?" pointing to GlassKit Web as the intended path for full marketing websites; sidebar footer links to both sister projects.
  - **README** — GlassKit Web added to the header link row and a family / layering paragraph added to the intro.

### Changed

- **README header link** for GlassKit CSS now points to the landing page (glasskit.jungherz.com) instead of the GitHub repo, consistent with the new GlassKit Web link.

---

## [1.6.0] – 2026-04-28

### Added

- **Two new components — `glk-tab-dock`, `glk-tab-accessory`** — tracking GlassKit CSS v1.6.0 floating Tab-Bar variant (iOS 26 Liquid Glass):
  - **`<glk-tab-dock>`** — wrapper that holds a floating tab bar plus an optional accessory capsule, with `accessory-left` modifier (maps to `.glass-tab-bar-dock` + `.glass-tab-bar-dock--accessory-left`).
  - **`<glk-tab-accessory>`** — standalone 56×56 px glass capsule (search, compose…) sitting next to the bar. Supports `variant="accent" / "success" / "error"` for filled colored capsules with white icons (maps to `.glass-tab-bar__accessory` + variants), plus `label` (aria-label) and `disabled`. Emits `glk-click`.
- **`<glk-tab-bar>` — `floating` attribute** — pill-shaped Liquid Glass variant (maps to `.glass-tab-bar--floating`). Active item gets a soft radial Spotlight halo instead of the underline dot. Use inside `<glk-tab-dock>`.
- **Component count** bumped from **27 → 29** across README, SKILL.md, landing pages, showcase, and docs.

### Changed

- **Peer dependency** `@jungherz-de/glasskit` raised from `>=1.5.0` to `>=1.6.0`. The new floating Tab-Bar variant + Accessory ship their CSS in 1.6.0 only.
- **CDN version pin** updated from `@1.5` to `@1.6` across all HTML pages.
- **Showcase** (EN + DE) — bottom navigation switched from the standard tab bar to the new floating variant with an accent accessory capsule, matching the sister GlassKit CSS showcase.

---

## [1.5.0] – 2026-04-12

### Version alignment

Starting with this release, GlassKit Elements version numbers are aligned with GlassKit CSS. The jump from 0.9.0 to 1.5.0 reflects this alignment — both projects now share the same version number. Future releases will maintain this parity.

### Added

- **`<glk-list>` — `header` attribute** — renders an uppercase section header label above the list (maps to `.glass-list__section-header`)
- **`<glk-list-item>` — 4 new attributes** tracking GlassKit CSS v1.5.0:
  - **`leading-lg`** — large 40×40 icon slot with rounded corners for app icons (maps to `.glass-list__leading--lg`)
  - **`wrap`** — multi-line subtitle (up to 3 lines with ellipsis, maps to `.glass-list__subtitle--wrap`)
  - **`detail`** — muted trailing value text for metadata like file sizes or version numbers (maps to `.glass-list__value`)
  - **`variant`** — semantic color: `"danger"` (red destructive) or `"accent"` (primary color), consistent with `<glk-badge>`, `<glk-button>`, `<glk-toast>` (maps to `.glass-list__item--danger` / `--accent`)

### Changed

- **Peer dependency** `@jungherz-de/glasskit` raised from `>=1.4.0` to `>=1.5.0`. The new List sub-features ship their CSS in 1.5.0.
- **CDN version pin** updated from `@1.4` to `@1.5` across all HTML pages.

### Fixed

- **Range slider** — thumb centering fix on Chrome / Safari inherited from GlassKit CSS v1.5.0 (pure CSS, no JS change).

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

[1.6.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.6.2
[1.6.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.6.1
[1.6.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.6.0
[1.5.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.5.0
[0.9.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.9.0
[0.8.3]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.3
[0.8.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.2
[0.8.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.1
[0.8.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.0
