<h1 align="center">🧊 GlassKit Elements</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@jungherz-de/glasskit-elements"><img src="https://img.shields.io/npm/v/@jungherz-de/glasskit-elements?style=flat-square&color=f5a623&label=version" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/vanilla_JS-no_dependencies-44cc11?style=flat-square" alt="Vanilla JS"></a>
  <a href="#"><img src="https://img.shields.io/badge/components-46-7ec8e3?style=flat-square" alt="46 Components"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License"></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/changelog-v1.33.0-lightgrey?style=flat-square" alt="Changelog"></a>
  <a href="https://www.npmjs.com/package/@jungherz-de/glasskit-elements"><img src="https://img.shields.io/badge/npm-%40jungherz--de%2Fglasskit--elements-cb3837?style=flat-square&logo=npm" alt="npm"></a>
</p>

<p align="center">
  <strong>Drop-in Web Components for <a href="https://github.com/JUNGHERZ/GlassKit">GlassKit CSS</a></strong><br>
  46 vanilla JavaScript custom elements wrapping GlassKit's glassmorphism components.<br>
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

GlassKit Elements is a companion library to [GlassKit CSS](https://github.com/JUNGHERZ/GlassKit). It provides **46 Web Components** (incl. the iOS 26-style floating Tab-Bar + Accessory) that encapsulate the verbose HTML markup required by GlassKit into simple, declarative custom elements.

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
| 🧩 **46 Components** | Buttons, cards, toggles, modals, accordions, lists, popovers, tab bars (incl. floating + accessory), tooltips, menus, trees, breadcrumbs, tables, and more |
| 🪶 **Lightweight** | 273 KB minified / 52 KB gzipped (IIFE bundle, GlassKit's component rules included), no external dependencies |
| 📦 **Three bundle formats** | IIFE for `<script>`, minified IIFE for production, ESM for bundlers & tree-shaking |
| 🎛️ **Form Participation** | Input, toggle, checkbox, radio, select — all work natively with `<form>` via `ElementInternals`: value, reset and, since 1.20.0, validity; `<glk-button type="submit">` submits |
| 🌗 **Theme Sync** | Automatic dark/light mode sync via `data-theme` on `<html>`, compact controls via `data-density`, opaque surfaces via `data-surface` |
| 💧 **Fluid selection** | `droplet` on `<glk-tab-bar>` and `<glk-segmented>`: the chosen item rides a drop of glass that glides to the next one and can be dragged (since 1.27.0) |
| 🧭 **Navigation at every edge** | One `<glk-tab-bar>` as bottom bar, top bar, sidebar or icon rail, or docked at a side where the thumb rests on a phone held open (since 1.32.0); a rail that names its items, with a mark, the accessory and the account (since 1.33.0) |
| ↕️ **Drag and drop** | `sortable` lists and trees, by mouse, touch and keyboard, with breadcrumbs as drop targets (since 1.32.0) |
| 📱 **Mobile-first** | Inherits GlassKit's mobile-optimized design with `safe-area-inset` support |

---

## 📥 Installation

### CDN (quickest)

```html
<!-- 1. GlassKit CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/glasskit@1.33/glasskit.min.css">

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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@jungherz-de/glasskit@1.33/glasskit.min.css">
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
| `<glk-tab-bar>` | Tab bar navigation: at the bottom, at the top, as a sidebar or an icon rail — with its labels under the icons since 1.33.0 —, docked at a side; slots `leading` and `trailing` for a mark, the accessory and the account | `static`, `floating`, `droplet`, `orientation`, `rail` (or `rail="labels"`), `dock`, `placement`, `label` |
| `<glk-tab-item>` | Tab bar item; any icon in `slot="icon"`, a cancelable `glk-tab-select`, a link with `href`, `aria-current` on the open view | `label`, `active`, `badge`, `badge-label`, `href` |
| `<glk-tab-dock>` | Wrapper for floating tab bar + optional accessory, upright at a side with `orientation="vertical"` | `accessory-left`, `orientation`, `dock` |
| `<glk-tab-accessory>` | Standalone glass capsule (search, compose…), its label under it with `show-label` | `label`, `variant` (accent, success, error), `disabled`, `show-label` |
| `<glk-steps>` | Progress through a short flow | `steps`, `current`, `label` |
| `<glk-date-strip>` | Scrolling row of day chips with tone dots; arrow keys, chosen chip centred | `start`, `days`, `value`, `today`, `marks`, `locale`, `label` |
| `<glk-breadcrumbs>` | The path through nested levels; folds the middle into a "…" menu, crumbs as drop targets, a cancelable `glk-navigate` | `label`, `collapse`, `drop-target`, `group`, `more-label` |
| `<glk-breadcrumb>` | One level of the path | `href`, `value`, `current` |

### Content

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-card>` | Glass-effect content card | `glow`, `fill` |
| `<glk-badge>` | Inline status badge, or a filter chip with `interactive`; a 36px chip to choose with in a form with `size="md"` | `variant` (primary, success, warning, error), `interactive`, `selected`, `size` (sm, md) |
| `<glk-avatar>` | Circular avatar | `size` (sm, lg), `src` |
| `<glk-title>` | Styled heading | — |
| `<glk-divider>` | Horizontal divider | — |
| `<glk-status>` | Status notice | `message` |
| `<glk-empty>` | Empty state: icon, title, text, one action | `title`, `text` |

### Buttons

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-button>` | Glass-styled button; `type="submit"` / `"reset"` act on its form | `variant` (primary, secondary, tertiary), `size` (sm, md, lg, auto; `sm auto` since 1.31.0), `disabled`, `type` (button, submit, reset) |

### Form Elements

All form components support `name`, `value`, `disabled` and participate in native `<form>` submission via `ElementInternals` — except `<glk-image-picker>`, which hands its result to `glk-change` instead: a data URL is no form value. Since 1.20.0 they also report their validity to the form (`required`, `pattern`, `min`, `type="email"` … stop a submit with the browser's own message), their `label` names the field for screen readers, and a click on it, `element.focus()` or a `<label for>` lands in the field. Since 1.22.3 a `<fieldset disabled>` around them disables them, as it does native controls.

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-input>` | Text input with label & hint; slots `prefix` / `suffix` for an icon, unit or button in the field, `label-end` for a link such as "Forgot password?" in the label row | `label`, `type`, `placeholder`, `hint`, `error`, `required`, `readonly`, `min`, `max`, `step`, `maxlength`, `pattern`, `autocomplete`, `inputmode` |
| `<glk-textarea>` | Multi-line text input; slot `label-end` | `label`, `rows`, `placeholder`, `required`, `readonly` |
| `<glk-select>` | Dropdown select; slot `label-end` | `label`, `required` (children: `<option>`) |
| `<glk-search>` | Search input with icon | `placeholder`, `label` (accessible name) |
| `<glk-toggle>` | Switch toggle (`role="switch"` on its native checkbox) | `label`, `checked`, `disabled`, `required` |
| `<glk-checkbox>` | Checkbox | `label`, `checked`, `disabled`, `required` |
| `<glk-radio>` | Radio button | `label`, `name`, `value`, `checked`, `required` (per group) |
| `<glk-range>` | Range slider | `label`, `min`, `max`, `value`, `step` |
| `<glk-segmented>` | Small exclusive choice as one control, icons per option in `slot="icon-<value>"`, a count per option (`badge`, its own colour with `badgeTone`); form-associated | `options` (JSON), `value`, `full`, `overflow` (scroll, wrap), `droplet`, `icon-only`, `label`, `name` |
| `<glk-calendar>` | One month with a day to pick; keyboard navigation, `Intl` names; form-associated | `month`, `value`, `today`, `min`, `max`, `marks`, `locale`, `week-start`, `label`, `name` |
| `<glk-image-picker>` | One image with preview, resized on the client, EXIF rotation applied; not form-associated | `src`, `label`, `hint`, `round`, `max`, `type`, `quality`, `accept` |

### Feedback & Notifications

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-progress>` | Progress bar | `value`, `label`, `variant` (success, error), `size` (sm, lg) |
| `<glk-modal>` | Modal dialog — a native `<dialog>`: page behind inert and still, focus in and back; `glk-closed` once it has faded out | `open`, `title` |
| `<glk-toast>` | Notification that hides itself, or an offer with one action and an × | `message`, `variant` (success, error, warning), `duration`, `action-label`, `action-value`, `dismissible` |
| `<glk-popover>` | Anchored dropdown / menu, in the top layer since 1.32.0: flipped and shifted at the viewport's edges | `open`, `placement` (top, bottom, start, end) |
| `<glk-tooltip>` | A short name or hint on hover, focus and a long press; the pointer may rest on it | `for`, `placement`, `show-delay`, `as-label` |
| `<glk-menu>` | A menu button: menu roles, arrows, typeahead, Escape back to the button; `glk-select` | `open`, `placement` |
| `<glk-menu-item>` | An action in a menu, checkable, destructive or disabled; `<glk-menu-separator>` and `<glk-menu-group>` part them | `value`, `type` (checkbox, radio), `checked`, `disabled`, `variant` (danger) |
| `<glk-sheet>` | Bottom sheet, the mobile sibling of the modal — a native `<dialog>` in the top layer since 1.30.0; `glk-closed` once it has slid out | `open`, `inline`, `title` |

### Containers

| Component | Description | Key Attributes |
|---|---|---|
| `<glk-accordion>` | Accordion container | — |
| `<glk-accordion-item>` | Collapsible section | `title`, `open` |
| `<glk-list>` | iOS-style grouped list; `sortable` by mouse, touch and keyboard | `flush`, `bare`, `sortable`, `group` |
| `<glk-list-item>` | List row (icon + title + subtitle + trailing); an `interactive` row is a button for the keyboard | `title`, `subtitle`, `interactive`, `center`, `container`, `no-drag` |
| `<glk-tree>` | Levels that open and close, the WAI-ARIA tree view; children that load on opening, with an error state and a retry; `sortable` | `label`, `selection`, `sortable`, `group` |
| `<glk-tree-item>` | One level of a tree, with its children nested | `label`, `value`, `expanded`, `selected`, `disabled`, `has-children` |
| `<glk-table>` | Around a native `<table>`: sortable headers, a sticky header, row actions, an empty state, cards below a width | `sort`, `direction`, `sticky-header`, `list-below` |

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

### Droplet: a fluid selection

Since 1.27.0 one attribute makes the selection of a tab bar or a segmented control fluid, as in iOS 26:

```html
<glk-tab-dock>
  <glk-tab-bar floating droplet>
    <glk-tab-item label="Home" active>…</glk-tab-item>
    <glk-tab-item label="Search">…</glk-tab-item>
  </glk-tab-bar>
</glk-tab-dock>

<glk-segmented droplet overflow="scroll" value="general" options='[…]'></glk-segmented>
```

The chosen item sits on a drop of glass that floats a little above the row. A tap sends it to the new item like water on a pane: the leading edge goes first, the trailing one follows, it runs flatter on the way and settles with a small wobble, and what it passes grows or lights up as under a lens. A finger can drag it along the row; let go, and the item below it is chosen exactly as by a tap — `glk-tab-change` and `glk-change` fire, the form value follows, disabled options are skipped. With `overflow="scroll"` a swipe still scrolls the row: only the drop itself is dragged, and the row scrolls along at its edges. `droplet` is also a property and may be switched at runtime.

**Already using the elements?** Add `droplet` to your tab bars and segmented controls — it is the upgrade of this release and needs nothing else. It is GlassKit's `--droplet` and its module `glasskit-droplet.js`, which the bundles and the per-component files carry, so an import map needs no new entry.

> **Requires GlassKit CSS >= 1.27.0.** The tokens for a capsule behind the active tab (`--gl-tab-bar-active-bg`, `--gl-tab-bar-active-shadow`, `--gl-tab-bar-spotlight-opacity`, `--gl-tab-bar-active-glow`) reach `<glk-tab-item>` by inheritance; the drop takes the same surface. Since 1.27.0 the items of `<glk-tab-bar floating>` also take the floating look — spotlight and pill instead of the fixed bar's dot.

### Icons of any kind, and a tab that keeps the current one

Since 1.28.0 a tab item and each segmented option take icons that are not inline SVG — Material Icons, an `<img>`, an element of your own — and they follow every state, the drop's lens and the drag:

```html
<glk-tab-item label="Home" active>
  <span slot="icon" class="material-icons" aria-hidden="true">home</span>
</glk-tab-item>

<glk-segmented droplet icon-only label="Theme" value="dark"
  options='[{"value":"light","label":"Light"},{"value":"dark","label":"Dark"},{"value":"auto","label":"Auto"}]'>
  <svg slot="icon-light" viewBox="0 0 24 24">…</svg>
  <span slot="icon-dark" class="material-icons">dark_mode</span>
  <svg slot="icon-auto" viewBox="0 0 24 24">…</svg>
</glk-segmented>
```

`glk-tab-select` is cancelable and comes before `active` changes: `event.preventDefault()` keeps the current tab — for an item that opens a drawer or a link — and the bar, its drop and `glk-tab-change` stay put. `droplet` and `floating` are properties of `<glk-tab-bar>` as well. The action buttons of `<glk-modal>` follow attribute changes of their originals, so a confirm button that starts `disabled` unlocks when the page or a framework enables it.

Since 1.29.0 a segmented option also takes a count, `badge`, shown as a pill after its label or at the icon's corner, with `badgeLabel` for the words a screen reader says — `"Tickets, 1 open"`. Since 1.31.0 `badgeTone` (`primary`, `success`, `warning`, `error`) colours the count alone, without the dot a `tone` adds. New options with the same values fill the buttons in place, so a live count keeps the focus and the drop:

```html
<glk-segmented droplet overflow="scroll" label="Customer" value="invoices"
  options='[{"value":"invoices","label":"Invoices","badge":2},{"value":"tickets","label":"Tickets","tone":"warning","badge":1,"badgeLabel":"1 open"}]'></glk-segmented>
```

> **Requires GlassKit CSS >= 1.28.0** (1.29.0 for the counts, 1.31.0 for `badgeTone`). The icon colours come from GlassKit's icon boxes; its new tokens reach the elements by inheritance: `--gl-tab-bar-color`, `--gl-tab-bar-hover-color`, `--gl-tab-bar-label-size`, `--gl-tab-bar-z-index` for the tab bar, `--gl-segmented-active-bg`, `-shadow` and `-color` for the chosen option and its drop.

### One navigation, every edge

Since 1.32.0 one `<glk-tab-bar>` serves every layout: the same items as a bottom bar on phones, a top bar on the desktop, a sidebar that collapses to an icon rail, or a column docked at a side — where the thumb rests when a phone is held open, or a foldable has moved its own controls to a side. The page switches by setting attributes, without rendering the items again:

```html
<glk-tab-bar orientation="vertical" droplet label="Main">            <!-- a sidebar in the page's grid -->
  <glk-tab-item label="Dashboard" href="/dashboard" active>…</glk-tab-item>
  <glk-tab-item label="Customers" href="/customers" badge="3" badge-label="3 new">…</glk-tab-item>
</glk-tab-bar>

<glk-tab-bar orientation="vertical" dock="end" rail droplet label="Main">…</glk-tab-bar>   <!-- fixed to the end edge, icons alone -->
<glk-tab-bar placement="top" droplet label="Main">…</glk-tab-bar>                         <!-- for a sticky header -->

<glk-tab-dock orientation="vertical" dock="start">                    <!-- the floating bar upright -->
  <glk-tab-bar floating droplet orientation="vertical" label="Main">…</glk-tab-bar>
  <glk-tab-accessory variant="accent" label="Compose">…</glk-tab-accessory>
</glk-tab-dock>
```

In a rail the labels are hidden from view, stay the items' names, and show as tooltips beside the rail on hover, focus and a long press. The drop runs along y in a column, and its timing is GlassKit's `--gl-droplet-*` tokens — for a product whose motion stays within 240ms ease-out, GlassKit's README has the recipe, `--gl-droplet-lift-duration: 0ms` included, without which the lift's shadow fades until about 600ms. The open view carries `aria-current="page"`, `label` names each navigation, `badge-label` words a count ("Customers, 3 new"), and `href` makes an item a link.

**A rail that names its items (since 1.33.0).** `rail="labels"` keeps each label under its icon, `slot="leading"` takes a mark and the accessory above the items, `slot="trailing"` the account at the foot, and with `floating` and `dock` the rail is a full-height pane of its own glass, 16px from the edges:

```html
<glk-tab-bar floating orientation="vertical" rail="labels" dock="start" droplet label="Main"
             style="--gl-tab-bar-rail-width: 96px; --gl-tab-bar-label-size: 12px">
  <img slot="leading" src="/mark.svg" alt="" width="40" height="40">
  <glk-tab-accessory slot="leading" variant="accent" label="Assistant" show-label>…</glk-tab-accessory>
  <glk-tab-item label="App" active>…</glk-tab-item>
  <glk-tab-item label="Report">…</glk-tab-item>
  <glk-button slot="trailing" variant="tertiary" size="sm auto" aria-label="Account">MK</glk-button>
</glk-tab-bar>
```

`<glk-tab-accessory show-label>` names itself under the capsule. GlassKit 1.33.0's `--gl-tab-bar-icon-size`, `--gl-tab-bar-item-radius` and `--gl-tab-bar-active-weight` size the icons, round the items and the drop, and set the active label's weight, and a bar that switches its layout no longer glides into it.

> **Requires GlassKit CSS >= 1.32.0** — the sidebar, rail, top and side-dock layouts, the drop's y axis and its timing tokens; **1.33.0** for a rail with labels, its leading and trailing places, the floating rail at an edge and the items' tokens.

### Tooltips, menus, trees, breadcrumbs, tables

Since 1.32.0, ten elements for the screens behind an app — a back office, an editor, a settings area:

```html
<glk-breadcrumbs>
  <glk-breadcrumb href="/app">My app</glk-breadcrumb>
  <glk-breadcrumb href="/app/menu">Main menu</glk-breadcrumb>
  <glk-breadcrumb current>Services</glk-breadcrumb>
</glk-breadcrumbs>

<glk-tree label="App structure" sortable>
  <glk-tree-item label="Main menu" expanded>
    <glk-tree-item label="Services" selected></glk-tree-item>
    <glk-tree-item label="Pricing" has-children></glk-tree-item>
  </glk-tree-item>
</glk-tree>

<glk-table sort="date" direction="descending" sticky-header list-below="640px">
  <table>…<td class="glass-table__actions">
    <glk-menu placement="end">
      <glk-button slot="trigger" variant="tertiary" size="sm auto">Actions</glk-button>
      <glk-menu-item value="send">Send again</glk-menu-item>
      <glk-menu-item value="cancel" variant="danger">Cancel invoice</glk-menu-item>
    </glk-menu>
  </td>…</table>
</glk-table>

<glk-tooltip as-label>
  <glk-pill slot="trigger"><svg viewBox="0 0 24 24">…</svg></glk-pill>
  Archive
</glk-tooltip>
```

- `<glk-tooltip>` names or describes a control, on hover, keyboard focus and a long press; `<glk-menu>` is a menu button with menu roles, arrows, typeahead and Escape back to the button.
- `<glk-tree>` is the WAI-ARIA tree view, with children that load once when their item opens — `load-error` shows a failure and opening again retries; `<glk-breadcrumbs>` folds the middle levels into a "…" menu where the path does not fit.
- `<glk-table>` wraps a native table in the page — sortable headers, a sticky header, row actions, an empty state, cards below a width; load `glasskit.css` for it.
- `sortable` on `<glk-list>` and `<glk-tree>` reorders by mouse, touch (a long press) and keyboard (Space, arrows, Space), into submenus and onto breadcrumbs of the same `group`, with announcements a page can translate. Lists and trees change single items in place — DOM methods instead of a new render, the focus kept — and `highlight()` flashes an item that changed elsewhere.
- Panels open in the top layer — `<glk-popover>` too since 1.32.0 — so no `overflow: hidden` cuts them off; `<glk-modal>` and `<glk-sheet>` emit `glk-closed` once they are gone, for pages that render them from state.

> **Requires GlassKit CSS >= 1.32.0** for the classes behind them: `.glass-tooltip`, `.glass-menu`, `.glass-tree`, `.glass-breadcrumbs`, the table's additions and the sorting states.

### Solid and tint surfaces

Not every screen wants glass. Set `data-surface="solid"` on `<html>`, next to `data-theme` (since 1.24.0):

```html
<html data-theme="dark" data-surface="solid">
```

Every surface becomes opaque, in the colour the glass shows over the theme's middle background, and blur and gloss are off; `removeAttribute('data-surface')` switches back at runtime. Without the attribute nothing changes.

> **Requires GlassKit CSS >= 1.24.0.** The preset is tokens only, so it reaches every shadow root by inheritance, and so do your own values: `[data-surface='solid'] { --gl-surface-2: #17313d; }`. With `data-glk-defaults="off"` it comes from `glasskit.css` on the page. The observer mirrors `data-surface` onto each element's theme wrapper, like `data-theme` and `data-density`.

On a page with a background of its own — a brand colour, a photo — use `data-surface="tint"` (GlassKit 1.25.0): the surfaces in the flow become see-through tints of the text colour, while modal, sheet, popover, toast, the tab bars and the secondary button keep the solid values, inside the shadow roots too.

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

**Primary as text (GlassKit 1.26.0).** The active `<glk-tab-item>`, `<glk-list-item variant="accent">`, the value of `<glk-range>`, the primary action of `<glk-modal>` and `<glk-accordion-item>` draw text and line icons in `--gl-color-primary-text`, which is the primary unless you set it. A brand that darkens its primary for white button text lightens the text in its dark theme, and the buttons keep their colour — the light rule after the dark one, because `:root` matches a page in the light theme too:

```css
:root, [data-theme='dark'] { --gl-color-primary-text: color-mix(in srgb, var(--gl-color-primary) 18%, #ffffff); }
[data-theme='light']       { --gl-color-primary-text: var(--gl-color-primary); }
```

`--gl-tab-bar-active-color` colours the icon and label of the active tab alone; unset, they take `--gl-color-primary-text`.

**Accent fills with white text (GlassKit 1.32.0).** `--gl-btn-primary-bg` (the background of `<glk-button variant="primary">`) and `--gl-color-primary-fill` (the chosen day of `<glk-date-strip>` and `<glk-calendar>`, the current step of `<glk-steps>`) darken the fills alone, so white text reaches AA without a darker brand colour; the dot of `<glk-radio>` follows `--gl-color-on-primary` like the checkbox tick. The recipe with the measured ratios is in GlassKit's README.

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
- **Native semantics** — labels tied to their fields, the toggle's `role="switch"` on its native checkbox, `<glk-modal>` a native `<dialog>`, `aria-expanded` on accordion and popover triggers, `aria-current` on the open tab; menu and tree roles on the elements themselves through `ElementInternals` (since 1.32.0)
- **Top layer** — popover, tooltip, menu and the breadcrumbs' "…" open with the popover API and are placed by script, flipped and shifted at the viewport's edges (since 1.32.0)

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
    overlay.js            # Panels in the top layer: placement, the tooltip's behaviour
    sortable.js           # Drag and drop for lists, trees and breadcrumbs
    components/
      navigation/         # glk-nav, glk-pill, glk-tab-bar, glk-tab-item, glk-tab-dock, glk-tab-accessory, glk-breadcrumbs, ...
      content/            # glk-card, glk-badge, glk-avatar, glk-title, ...
      buttons/            # glk-button
      forms/              # glk-input, glk-toggle, glk-checkbox, ...
      feedback/           # glk-progress, glk-modal, glk-toast, glk-popover, glk-tooltip, glk-menu, ...
      containers/         # glk-accordion, glk-list, glk-tree, glk-table, ...
  dist/
    glasskit-elements.js      # IIFE bundle (428 KB raw / 93 KB gzipped)
    glasskit-elements.min.js  # IIFE minified (273 KB raw / 52 KB gzipped)
    glasskit-elements.esm.js  # ES module bundle (413 KB raw / 91 KB gzipped)
    components/               # one ESM file per element + base.js (GlkElement, GlkFormElement); shared/ holds the modules several of them import
  index.html                  # Landing page
  docs.html                   # Documentation
  showcase.html               # Interactive showcase
  de/                         # German translations
```

---

## 🌐 Browser Compatibility

| Browser | Support | Popover, tooltip, menu, the breadcrumbs' "…" (since 1.32.0) |
|---|---|---|
| Chrome | 111+ | 114+ |
| Edge | 111+ | 114+ |
| Safari | 16.4+ | 17+ |
| Firefox | 113+ | 125+ |

The floor is GlassKit's: its tokens are derived with `color-mix()`. The elements also need constructable stylesheets, `ElementInternals`, `delegatesFocus`, `<dialog>` and `inert` — all inside that floor. A few refinements come later and fall back quietly: first-line alignment of toggle, checkbox and radio (`lh`, Firefox 120), the divider of list rows without icon (`:has()`, Firefox 121), right-to-left mirroring of select chevron, toggle thumb and progress fill (`:dir()`, Chrome 120).

Since 1.32.0 the panels that open over the page — `<glk-popover>`, `<glk-tooltip>`, `<glk-menu>`, the "…" of `<glk-breadcrumbs>`, the labels of a rail and the dragged copy of a sortable item — open with the popover API, so these need Chrome and Edge 114, Safari 17 and Firefox 125. A side bar and the upright `<glk-tab-dock>` find their edge everywhere; only the padding for the safe area of the physical side waits for `:dir()` (Chrome 120).

---

## 🤖 AI / LLM Reference

[`SKILL.md`](SKILL.md) is a tag-based, machine-readable reference for LLMs and AI copilots. It contains copy-paste-ready HTML for all 46 elements, attribute / slot / event tables, composition patterns, and a common-mistakes section. It is the companion to the class-based `SKILL.md` in [GlassKit CSS](https://github.com/JUNGHERZ/GlassKit) — use both together for complete coverage of the glass stack.

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
