# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.36.0] – 2026-10-29

Versions stay aligned with GlassKit at 1.36.0, which this release is built against (peer dependency `>=1.36.0`).

### Added

- **A name without a visible label for fields: `label-hidden`, `aria-label` and `aria-labelledby` on `<glk-input>`, `<glk-select>` and `<glk-textarea>`.** Opening hours with the columns From, To, Break from and Break to for every day of the week make 28 time fields. Each needs its label as its name, but showing it in every cell repeats the header 28 times. A field either showed its label or had no name, and an `aria-label` on the element did not reach the field inside.
  - `label-hidden` keeps the label the field's name and takes it out of sight, with the rule of the switches.
  - `aria-label` and `aria-labelledby` on the element name the field instead of its label, as on the switches since 1.33.1.

  ([#51](https://github.com/JUNGHERZ/GlassKit-Elements/issues/51))
- **`glk-change` on `<glk-range>`.** It fires once a value is set: when the pointer lets go of the thumb, and on every key, as the native slider's `change`. A native `change` goes out with it. A project saved on every step, half a dozen requests for one drag, or used a number field instead of a slider. ([#52](https://github.com/JUNGHERZ/GlassKit-Elements/issues/52))
- **A name and a description for `<glk-button>`: `aria-label`, `aria-labelledby` and `aria-describedby`.** They stayed on the element, which has no role. So an icon-only button had no name, and "Restore" in every row of a list could not say "Restore Info page 55". They name and describe the native button now, `aria-labelledby` and `aria-describedby` through element reflection, as on the switches. ([#54](https://github.com/JUNGHERZ/GlassKit-Elements/issues/54))
- **Below the sheet title, and its close glyph: `slot="subtitle"` and the part `close-icon` on `<glk-sheet>`.** A badge in `trailing` stood beside the title and squeezed it, to 92px in a 390px sheet with a German badge; `subtitle` puts it below the title. `::part(close)` reached the close button but not its glyph. GlassKit 1.36.0's `--gl-sheet-close-size`, `--gl-sheet-close-icon-size` and `--gl-sheet-close-icon-stroke` size both, and `close-icon` reaches the glyph. ([#56](https://github.com/JUNGHERZ/GlassKit-Elements/issues/56))
- **Parts `leading` and `trailing` on `<glk-list-item>`**, with GlassKit 1.36.0's `--gl-list-leading-width` for a time and a chip before the text. ([GlassKit #28](https://github.com/JUNGHERZ/GlassKit/issues/28))

### Changed

- **The browser's `input` reaches `<glk-input>`, `<glk-textarea>`, `<glk-search>` and `<glk-range>` once.** The native event is composed and reached the element by itself. Each element sent one of its own on top, so a listener for `input` on it got every key or step twice. Only an `input` that is not composed is still handed on. `change` stays the element's own, since the native one does not leave the shadow root. A listener that counted two events per key gets one now. ([#53](https://github.com/JUNGHERZ/GlassKit-Elements/issues/53))
- **Escape closes an open `<glk-menu>` wherever the focus is,** and marks the key as handled. Opened by a click, the focus may lie outside the menu, since Safari does not focus a clicked button, and Escape did nothing then. In a modeless sheet the next point needs it: the sheet leaves the key to the open menu.

### Fixed

- **Escape in a modeless sheet closed the sheet before an open popover in it.** The sheet heard the key on its dialog, the popover only at the document. So the first Escape closed the sheet and left the popover open in the top layer.
  - A modeless sheet leaves Escape to a popover or menu still open in it, wherever the focus is: in the popover, on its trigger, on another field.
  - The first Escape closes the popover, the second the sheet, as in a modal sheet.

  ([#55](https://github.com/JUNGHERZ/GlassKit-Elements/issues/55))
- **From GlassKit 1.36.0:**
  - The status message has no paragraph margins, and the notice is 54px high instead of 82px ([#57](https://github.com/JUNGHERZ/GlassKit-Elements/issues/57)).
  - The head of a sheet without title, places and close button takes no room. The content started 8px lower than in 1.34.0 ([GlassKit #27](https://github.com/JUNGHERZ/GlassKit/issues/27)).
  - The title of a chosen list row takes the row's colour, so `--gl-list-item-selected-color` reaches it ([GlassKit #28](https://github.com/JUNGHERZ/GlassKit/issues/28)).
  - `--gl-sheet-side-inset-block-start` and `-block-end` set a side sheet's top and bottom on their own ([GlassKit #27](https://github.com/JUNGHERZ/GlassKit/issues/27)).

Measured in Chromium 153, WebKit 26.6 and Firefox 151, 1.35.0 against 1.36.0:
- **Fields:**
  - With `label-hidden` the label box is 1 × 1px, and the field starts at the element's top instead of 24px below it (23px in Firefox). The label stays the field's name.
  - `aria-label="Break to"` names the field "Break to", and `aria-labelledby` pointing at "Break from" names it "Break from", in Chromium's accessibility tree. In WebKit and Firefox the name and the reflected element are on the inner field.
- **Button:** in Chromium's accessibility tree an icon-only button with `aria-label="Close"` is named "Close" (before: no name). One with `aria-label="Restore Info page 55"` and the content "Restore" is named "Restore Info page 55" (before: "Restore"), and one with `aria-labelledby` and `aria-describedby` is named "Delete the draft" and described "This cannot be undone.". All three engines carry the references on the inner button.
- **Range:** ArrowRight three times gives three `glk-input`, three `glk-change` and three `input` on the element (before: 3, 0 and 6). A drag in six moves gives six `glk-input`, one `glk-change` and six `input` (before: 6, 0 and 12).
- **`input` once:** "ab" typed gives two `input` on `<glk-input>`, `<glk-textarea>` and `<glk-search>` (before: four), and "75" in a number field two (before: four).
- **Modeless sheet:**
  - With a popover open in it, and the focus in the popover, on its trigger or on another field, the first Escape closes the popover and the sheet stays open. The second closes the sheet. Before, the first closed the sheet and left the popover open.
  - With a menu opened by a click and the focus on the panel, the first Escape closes the menu, the second the sheet.
  - A modal sheet behaves as before.
- **Sheet head:**
  - A badge in `subtitle` stands below the title, which keeps 180px in a 390px sheet with a chip and a close button. Beside it, in `trailing`, the title kept 0px.
  - With the close tokens at 44px, 20px and 1.8, the button is 44px, the glyph 20px with a 1.8px stroke, and `::part(close-icon)` colours it.
  - A sheet named only by `label` starts its content 29px below the panel's top instead of 37px.
- **List:** `--gl-list-leading-width: 84px` widens a `leading-lg` box from 40 to 84px, the divider starts at 116px instead of 72px, and the parts are there. The chosen row's title is rgb(15, 31, 42) instead of rgb(26, 42, 54), and red with the token set to red.
- **Status:** a notice with `message` or with content is 54px high instead of 82px.
- **Pages:** the two status notices of the docs and the one of the showcase are 28px lower each, and the phone of the landing page shows the same showcase. With their margin set back for the comparison, docs and showcase render as in 1.35.0, apart from the title of the chosen list row in light mode.

---

## [1.35.0] – 2026-10-29

Versions stay aligned with GlassKit at 1.35.0, which this release is built against (peer dependency `>=1.35.0`).

### Added

- **A sheet at a side, and a modeless one: `placement` and `modeless` on `<glk-sheet>`, part `grip`.** On a desktop a sheet is a panel at the right edge, for restoring a version, or a side sheet beside a list that stays usable, for editing an entry while its row stays marked. The sheet only came from the bottom. A project placed it through a stylesheet in the shadow root and built the modeless one from `inline`, a fixed host and its own Escape handling.
  - `placement="end"` or `"start"` puts the panel at that side, through GlassKit 1.35.0's `--start` / `--end`. It is full height less 16px at both ends, 440px wide, slides in from the side (mirrored right to left), and has no grip and its actions side by side.
  - `modeless` opens it with `show()` instead of `showModal()`. There is no scrim, the page stays usable, and a modal opened later lies above it.
  - Escape inside a modeless sheet closes it; a click outside does not. The focus moves into the panel, or to what carries `autofocus`, and goes back where it came from on closing.

  ([#44](https://github.com/JUNGHERZ/GlassKit-Elements/issues/44))
- **A head with a close button, and a name without a title: `dismissible`, `close-label`, slots `eyebrow`, `leading`, `trailing`, and `label` on `<glk-sheet>`.** A history sheet shows a 56px icon chip, a line "RESTORE" above the title, a badge after it, and a × at the end. The sheet rendered its title only, and without a title the dialog had no name at all, so a project kept a hidden title just for that.
  - Each place of the head shows while it holds something.
  - The close button closes the sheet like a click outside, with `glk-close`.
  - `label` names the dialog where there is no visible title.
  - The parts are `head`, `eyebrow`, `leading`, `trailing` and `close`.

  ([#43](https://github.com/JUNGHERZ/GlassKit-Elements/issues/43))
- **Room beside the title and below the subtitle: slots `title-trailing` and `extra` on `<glk-list-item>`, parts `title` and `subtitle`.** History rows show a badge "AI" beside the title and an "Undo" link below the subtitle, at 64px with a 13px subtitle, and the chosen row should be a flat tint. A project drew the rows itself or adopted stylesheets.
  - `title-trailing` moves under the title where the row is too narrow, and the title keeps its ellipsis.
  - GlassKit 1.35.0's `--gl-list-title-size`, `-weight` and `--gl-list-subtitle-size` set the type.
  - `--gl-list-item-selected-inset`, `-radius`, `-shadow`, `-color` and `-weight` shape the chosen row; `0`, `0` and `none` make a flat tint.

  The issue suggested a slot `content`. That name is already GlassKit's for the row's middle column, so the slot is `extra`. ([#42](https://github.com/JUNGHERZ/GlassKit-Elements/issues/42))
- **A message with markup: the default slot of `<glk-status>`.** "Included in your package **Premium**" could not be built, because `message` went in as text. The content is the message now, and `message` stays the short form while the content is empty, whitespace aside. GlassKit 1.35.0's `--gl-status-color` sets its colour. The parts are `status` and `message`. ([#45](https://github.com/JUNGHERZ/GlassKit-Elements/issues/45))
- **`glk-change` on `<glk-textarea>`.** It fires once a value is done: on leaving the field with a changed value, as on `<glk-input>`, and on Ctrl+Enter or Cmd+Enter. It fires once per value, and a native `change` goes out with it. A project saved its text areas on `focusout`. ([#46](https://github.com/JUNGHERZ/GlassKit-Elements/issues/46))
- **Coloured logos as segmented icons: `icon-style="color"`, or `"iconStyle": "color"` per option.** A logo's shapes inherited the line icon's stroke and came out outlined in the text colour. A project set `stroke="none"` on every shape; an attribute on the `<svg>` itself loses to the slotted rule in all three engines. The attribute gives the icon GlassKit 1.35.0's `.glass-segmented__icon--color`. ([#47](https://github.com/JUNGHERZ/GlassKit-Elements/issues/47))
- **A state per step: `steps` as JSON with `state`, and `done-label` on `<glk-steps>`.** In a publication flow the address may be approved before the app was ever tested.
  - Each step may say `done`, `current` or `todo`. `current` stays the short form for steps in order.
  - A done step also says so to screen readers (", done"), since out of order the position no longer tells.
  - JSON arrays of labels work too. Before, they were split at the commas, brackets and all.

  ([#49](https://github.com/JUNGHERZ/GlassKit-Elements/issues/49))

### Changed

- **The state events `glk-open`, `glk-close` and `glk-closed` stay at the element** (popover, menu, modal, sheet, toast). Every event bubbled, so a sheet's listener for `glk-close` also took the `glk-close` of a popover inside it. Picking a day in a date field's popover closed a project's sheet and threw away its draft.
  - The state events no longer bubble and are not composed, as the native `close` and `toggle` are not.
  - A listener on the element itself, and a capture listener in the same tree, still get them. A listener on an ancestor in the bubble phase does not.
  - `glk-action`, `glk-dismiss`, `glk-select` and the other `glk-*` events still bubble.

  ([#50](https://github.com/JUNGHERZ/GlassKit-Elements/issues/50))
- **From GlassKit 1.35.0, dark glass keeps its contrast.** In dark mode the glow of modal and sheet starts lower, and controls on them take darker values. A chosen badge says its label in the text colour, and accent text on cards and dialogs is lighter. ([#48](https://github.com/JUNGHERZ/GlassKit-Elements/issues/48))

### Fixed

- **Escape on an open popover inside a sheet or a modal closed both.** The popover closed on a keydown without marking it, and the dialog around took the same key as its cancel. The popover marks it as handled now (`preventDefault()`): the first Escape closes the popover and the second the sheet, and a container can check `defaultPrevented`. ([#50](https://github.com/JUNGHERZ/GlassKit-Elements/issues/50))

Measured in Chromium 153, WebKit 26.6 and Firefox 151:
- **Side and modeless:** the end panel is 440px wide and 16px from the right, top and bottom edges, the start panel mirrors it, and right to left `end` lies at the left. Both slide in from their side.
  - A modeless sheet is not `:modal`, and the button behind it takes the click.
  - A glk-modal opened over it lies on top.
  - Escape inside it closes it with `glk-close` and puts the focus back on the button that opened it.
- **Head:** the eyebrow stands above the title, the chip before it, the badge after it, and the 32px close button at the end, named by `close-label`. A click on it closes the sheet with `glk-close`. Without a title, `label` gives the dialog its `aria-label`.
- **Events:** a popover closed inside an open sheet sends `glk-close` to its own listener and to a document capture listener, not to the sheet's listener (before: also to the sheet). Escape closes the popover first and is `defaultPrevented`; a second Escape closes the sheet.
- **List:** `title-trailing` stands beside the title and moves under it in a 260px row; `extra` stands below the subtitle. `--gl-list-title-size: 13px` and `--gl-list-subtitle-size: 11px` give 13 and 11px, and the flat chosen row has no inset, radius or shadow.
- **Others:**
  - `<glk-status>` keeps `message` beside whitespace children and shows slotted markup bold.
  - Typing and Tab give one `glk-change` on `<glk-textarea>`. Ctrl/Cmd+Enter gives a second for the new value, and the next Tab none.
  - A logo's path keeps its own fill and has no stroke with `icon-style="color"`, while a line icon beside it still strokes.
  - Steps out of order carry the right classes, `aria-current="step"` and the spoken "done".
- **Dark glass**, at the top of a tall dark sheet: see GlassKit 1.35.0's table. Every text measured there now reaches 4.66:1 or more.
- Light docs and showcase pages render as in 1.34.0, apart from the new examples. On the landing page only the phone differs, which shows the showcase dark. In dark mode the chosen badges and the inline sheet differ, as GlassKit 1.35.0 intends.

---

## [1.34.0] – 2026-10-28

Versions stay aligned with GlassKit at 1.34.0, which this release is built against (peer dependency `>=1.34.0`).

### Added

- **Tiles that sort: `grid` on `<glk-list>`.** A grid of components needs the horizontal axis: before is the left half, after the right half, inside the centre of a submenu tile. The sorter decided from the vertical position only, and a project wrote a sorter of its own for its tiles.
  - `grid` lays the items out as tiles side by side, through GlassKit 1.34.0's `.glass-list--grid` and `.glass-list__item--tile`. Every tile is a pane of glass with the icon at the top, title and subtitle at its foot, and `trailing` in the top end corner.
  - Items that stand side by side sort on the horizontal axis: before on an item's start half, after on its end half, into a `container` in its middle. This is mirrored right to left, and the line stands upright in the gap.
  - The sorter reads the layout per container. A layout of the page's own sorts that way too, and the lone tile of a last row sorts like its neighbours.
  - The keyboard keeps the order of the items: Up and Down step from place to place, Right goes into a container, Left out.

  The issue suggested `sortable="grid"` or a `glk-grid`. The axis comes from the layout instead, and the tiles are a layout of the list, so they keep its items, groups, containers and crumbs. A tile grid made by the page with `::part()` would lose hover, focus ring and drag states to the page's own `background` and `box-shadow`, which win over the shadow tree. ([#40](https://github.com/JUNGHERZ/GlassKit-Elements/issues/40))
- **The crumbs for a sorter of the page's own: `dropTargetAt(x, y)` and `markDrop(target, { refused })` on `<glk-breadcrumbs>`.** The crumbs took drops only from `<glk-list>` and `<glk-tree>`, through internal hooks.
  - `dropTargetAt()` returns `{ item, index, current }` for the crumb at a point of the viewport, `{ overflow: true }` over "…", or `null`. `item` is the crumb's `<glk-breadcrumb>`, and a folded level counts while the "…" menu is open.
  - `markDrop()` lights the crumb up or shows a refusal. Over "…" it opens the menu after 600ms, however often it is called, and `markDrop(null)` clears.

  ([#40](https://github.com/JUNGHERZ/GlassKit-Elements/issues/40))
- **A chosen entry: `selected` on `<glk-list-item>`.** A compact list next to an editor marks the entry that is open. `selected` and `aria-current` on the element changed nothing, and a project painted the row through an adopted stylesheet. Now the row takes GlassKit 1.34.0's `.is-selected`, a pill of raised glass as the selected tree item has, and `aria-current="true"`. The page sets it; a click does not. The list's rows are buttons, not options of a listbox, so `aria-current` it is. ([#39](https://github.com/JUNGHERZ/GlassKit-Elements/issues/39))
- **The grip first, and parts on the row: `handle="start"` on `<glk-list-item>` and `<glk-list>`, parts `item` and `handle`.** The handle stood last in the row, after `trailing`, with no part on the row or the handle. A project adopted a stylesheet into every item to move it.
  - `handle="start"` puts the handle before the icon, on one item or on the list for all of them. An item's own attribute wins, and the `handle` property reads where it stands. The handle comes first in the Tab order too, so a button in it is reached before the row's other controls.
  - GlassKit 1.34.0's `--gl-list-item-divider-inset` sets where the dividers start. With the grip first they run from the row's padding until the token says where the text begins.

  ([#38](https://github.com/JUNGHERZ/GlassKit-Elements/issues/38))
- **Parts `icon` and `handle` on `<glk-tree-item>`.** With GlassKit 1.34.0's `--gl-tree-icon-size`, a 28px chip gets a field of its size. ([GlassKit #26](https://github.com/JUNGHERZ/GlassKit/issues/26))

### Fixed

- **Sorting by mouse and touch inside a shadow root.** The sorter found the row under the pointer with `document.elementsFromPoint()`, which stops at a shadow host. A sortable list or tree inside another element's shadow root never found a target, and a drag ended without `glk-sort`; only the keyboard sorted there. That is the usual case in an app built of web components. The sorter now asks the root of each list or tree taking part, so a group may also span several roots. ([#41](https://github.com/JUNGHERZ/GlassKit-Elements/issues/41))
- **The folded levels of `<glk-breadcrumbs>` take drops.** Hovering "…" during a drag opened the menu, but its levels were looked up in the document too, and never found. They now light up and take the item, also in a shadow root.
- **From GlassKit 1.34.0:** the tint of an item that takes the dragged one inside shows over the hover of an interactive row and over the chosen state. Before, only its ring showed.

Measured in Chromium 153, WebKit 26.6 and Firefox 151:
- **Shadow root:** the issue's repro with the first row dragged below the third gives one `glk-sort` in the document and now one in a shadow root (before: none). A drag across a group from the document into a shadow root gives one too. So does a drop on a folded crumb, after the menu opened under the pointer (before: none, and the option was not marked).
- **Tiles:** a 480px grid of 152 by 112px tiles. The start half of a tile marks before, the end half after, the middle of a container inside. The lone last tile marks on the horizontal axis, and the line stands 2px wide in the 12px gap. Right to left, the halves swap. The keyboard's Down marks the next place, upright.
- **Rows:** `handle="start"` gives the order handle, icon, content, trailing, with the divider from 20px. An item with `handle="end"` keeps its own, and Tab goes from the handle's button to the row's trailing button. A selected row carries `aria-current="true"` and the pill, and both go with `selected`.
- **Tree:** with `--gl-tree-icon-size: 28px` the `icon` part and the chip measure 28 by 28px.
- With GlassKit 1.34.0 the existing docs, showcase and landing pages render as in 1.33.2. The docs differ only where the new examples and paragraphs stand.

---

## [1.33.2] – 2026-10-28

GlassKit is unchanged; the peer dependency stays `>=1.33.0`.

### Added

- **A value of its own on `<glk-progress>`: `max`, `value-text`, the role `progressbar` and parts.** A quota row says "3 of 20 images this month". The element took `value` as a percentage, clamped it to 0–100 and always wrote it as one, so `value="3" max="20"` showed "3%" with a 3% fill. The bar had no role, and screen readers met its value as plain text. A project drew the row with GlassKit's own markup instead.
  - `max` (100 by default) is the value of a full bar, and the fill is `value / max`.
  - `value-text` is the text at the end of the label row ("3 of 20"). Without it, the percentage shows, as before.
  - The element is the progress bar: `role="progressbar"` with `aria-valuenow`, `aria-valuemin` (0), `aria-valuemax` and `aria-valuetext` (the value text), through `ElementInternals`, named by `label`. A bar without a visible label takes `aria-label` or `aria-labelledby` on the element.
  - Parts are `label`, `value`, `track` and `fill`. The properties are `max` and `valueText`.
  - `value` keeps its decimals; it was cut to a whole number before.

  ([#36](https://github.com/JUNGHERZ/GlassKit-Elements/issues/36))

### Fixed

- **`focus()` on `<glk-button>` focuses its button.** A tool moves the focus to "Apply" once a streamed suggestion is ready, so the keyboard can take it over. `focus()` on the element did nothing: its shadow root did not delegate the focus, which only the form fields did, and the focus stayed on the body. A project focused `shadowRoot.querySelector('button')` instead.
  - `<glk-button>`, `<glk-pill>`, `<glk-tab-item>` (button or link) and `<glk-tab-accessory>` delegate the focus now, `autofocus` included.
  - Elements with more than one control hand `focus()` to the one Tab reaches: `<glk-segmented>` to the chosen option, `<glk-calendar>` and `<glk-date-strip>` to the day that is the tab stop, `<glk-image-picker>` to its choose button, `<glk-accordion-item>` to its trigger. An interactive or sortable `<glk-list-item>` hands it to its row, and an interactive `<glk-badge>` to its button.
  - The elements' own paths had the same gap. `autofocus` on a `<glk-button>` in a `<glk-modal>` or `<glk-sheet>` left the focus on the dialog in WebKit and Firefox, and a `<glk-toast>` closed with Escape could not hand the focus back to a `<glk-button>`. Both work now.
  - A disabled button takes no focus, like a native one. A click on one inside a focusable container now leaves the focus on the body instead of moving it to that container in Chromium and WebKit, as for the form fields since 1.20.0.
  - `<glk-breadcrumbs>`, `<glk-tab-bar>` and `<glk-table>` hold several controls side by side, each reached by Tab, and keep `focus()` as it was.

  The issue asked for the button and suspected the same gap elsewhere; every element with a control in its shadow root was checked. ([#37](https://github.com/JUNGHERZ/GlassKit-Elements/issues/37))

Measured in Chromium 153, WebKit 26.6 and Firefox 151:
- **Progress:** `value="3" max="20" value-text="3 of 20"` shows "3 of 20" with a 15% fill, and without `value-text` "15%". Chromium's accessibility tree has a progressbar named "Images this month" with value 3, minimum 0 and maximum 20, the same as a `<div role="progressbar">` with those attributes, and leaves the texts inside out. In WebKit and Firefox the element's `ElementInternals` carry the same role and values. `aria-label` and `aria-labelledby` name a bar without a label.
- **Focus:** `focus()` lands in the control of each element named above in all three engines. The Tab order is the same as in 1.33.1. A click focuses what it focused before, except that the visible label of a `<glk-tab-accessory show-label>` now focuses its button, as a click on the button does. No focus ring shows after a click. `autofocus` on a `<glk-button>` in a modal and a sheet takes the focus, and the toast hands it back.
- The existing docs, showcase and landing pages render as in 1.33.1.

---

## [1.33.1] – 2026-10-28

GlassKit is unchanged; the peer dependency stays `>=1.33.0`.

### Added

- **A name without a visible label for `<glk-toggle>`, `<glk-checkbox>` and `<glk-radio>`.** A settings row puts its title on the left and the switch at the end. The switch's `label` showed the title a second time beside it, and `aria-label` on the element left the native switch inside without a name (`switch` with none, in both engines). A project shrank the label's text and gap to nothing through `--gl-font-size-base` and `--gl-space-sm`.
  - `aria-label` on the element now goes onto the native control.
  - `aria-labelledby` names it through element reflection, since an id from the light DOM does not reach into the shadow root, and the referenced text also goes on as `aria-label` for where reflection is missing.
  - `label-hidden` keeps `label` as the name and takes the text out of sight, without its gap.
  - `label-position="start"` puts the text before the control.
  - Properties are `labelHidden` and `labelPosition`. Parts are `label`, and `track`, `box` or `circle`.

  The issue asked for the toggle. The checkbox and the radio share its build and the same row at the end of a list, so they take the same attributes. ([#35](https://github.com/JUNGHERZ/GlassKit-Elements/issues/35))

Measured in Chromium 153, WebKit 26.6 and Firefox 151:
- Chromium's accessibility tree names every control:
  - a switch with `label-hidden` "Contact form", with `aria-label` "Orders", with `aria-labelledby` "Newsletter"
  - a checkbox "Remember me"
  - a radio by `aria-labelledby` "Monthly"
- In WebKit and Firefox the controls carry the same reflected elements and `aria-label`s, and Playwright's own name computation gives the same names in all three.
- With `label-hidden` the switch is as wide as its track (52px) and the checkbox as its box (24px). With `label-position="start"` the text stands before the switch.
- The existing docs, showcase and landing pages render as in 1.33.0.

---

## [1.33.0] – 2026-10-28

Versions stay aligned with GlassKit at 1.33.0, which this release is built against (peer dependency `>=1.33.0`).

### Added

- **A rail that names its items, as a pane at the edge, with a place for a mark, the accessory and a foot: `rail="labels"`, `floating` with `dock`, slots `leading` and `trailing` on `<glk-tab-bar>`.** A back office's rail at the start edge, 96px wide and 16px from the edges, with the brand mark and the accessory above the items and the label under each icon, had none of the three vertical forms of 1.32.0. A sidebar puts the label beside the icon, a rail hides it, and the upright floating bar hugs its items as a pill with no place above them. It took a wrapper that drew the glass, overrides of the items' size and the global `--gl-radius-full` on the bar.
  - `rail="labels"` keeps the label under the icon, through GlassKit 1.33.0's `--labels`. The items fill the rail's width (`--gl-tab-bar-rail-width`), and no tooltips are added, since the labels show. The `rail` property reads `true`, `false` or `"labels"`.
  - `floating` with `orientation="vertical"` and `dock="start"` or `"end"` makes the rail a pane of its own glass at that edge. It is full height and inset `--gl-tab-bar-floating-inset` (16px), with a card's corners. Without `dock`, a floating rail is such a pane in the page's layout, as high as its container.
  - `slot="leading"` holds a mark or the accessory before the items, above them in a column. `slot="trailing"` holds a foot such as the account at the far end. The parts are `leading` and `trailing`.
  - `--gl-tab-bar-item-radius` from GlassKit 1.33.0 rounds the items and the drop without touching a global token.

  ([#32](https://github.com/JUNGHERZ/GlassKit-Elements/issues/32))
- **`show-label` on `<glk-tab-accessory>`**: its label under it as well, for a rail that names its items. The name stays the button's, and the visible label is hidden from assistive technology so it is not read twice. A click on it presses the button. The property is `showLabel` and the part is `label`. ([#32](https://github.com/JUNGHERZ/GlassKit-Elements/issues/32))
- **A place at the end of the label row: slot `label-end` on `<glk-input>`, `<glk-textarea>` and `<glk-select>`**, for a link such as "Forgot password?" on the line of the label "Password". The label row had no slot and the label no part, so the link lay around the element from outside. The place comes after the field in the shadow tree, so the keyboard reaches it after the field, which reads best in a sign-in form. GlassKit 1.33.0's `.glass-input-group--label-end` draws it at the end of the label's line. Parts are `label` and `label-end`. ([#33](https://github.com/JUNGHERZ/GlassKit-Elements/issues/33))
- **`size="md"` and part `badge` on `<glk-badge>`.** An interactive badge was 25 to 26px high, so a row of choice chips in a sign-up form needed tokens bent on the host. `size="md"` makes a 36px chip in the small text of a form, GlassKit 1.33.0's `--md`. Interactive, it takes taps on 44px. The property is `size` (`"sm"`, the default, or `"md"`). Part `badge` is the inner span, or the button. ([#34](https://github.com/JUNGHERZ/GlassKit-Elements/issues/34))

### Changed

- **From GlassKit 1.33.0**, by inheritance ([GlassKit #25](https://github.com/JUNGHERZ/GlassKit/issues/25)):
  - The tab bar's `--gl-tab-bar-icon-size`, `--gl-tab-bar-item-radius` and `--gl-tab-bar-active-weight` reach `<glk-tab-bar>` and its items.
  - Items move only their colours, the press and the shadow, so a bar switched between its layouts has its new size at once instead of gliding for 250ms.

Measured in Chromium 153, WebKit 26.6 and Firefox 151:
- **Rail:** the issue's design as `floating orientation="vertical" rail="labels" dock="start"` with `--gl-tab-bar-rail-width: 96px` and the mark and accessory in `leading`.
  - The rail stands 16px from the start edge and the ends of a 760px viewport, with 24px corners.
  - Items are 78 by 62px with 16px corners, labels 12px under the icons, a long one cut with an ellipsis.
  - The accessory's label reads "Assistant", its button is named "Assistant", and a click on the label presses it.
  - The account in `trailing` sits at the bottom, and the drop runs along y with 16px corners.
  - Right to left the rail stands at the right edge.
- **Layout switch:** a bar switched to `orientation="vertical" rail="labels"` has its 62px items in the next frame.
- **`label-end`:**
  - In the input, the textarea and the select, the link sits on the label's line at the field's end.
  - Tab goes from the field to the link in Chromium and Firefox.
  - Safari reaches links with Tab only with its preference or Option+Tab.
- **Chips:** `size="md"` is 36px high with 14px text, and a tap 3.5px above or below its edge reaches it.

Docs (English and German), README and SKILL.md describe the rail, the accessory's label, the label row's end and the chip. The existing docs, showcase and landing pages render pixel-identical to 1.32.0 in all three engines, in Chromium section by section.

---

## [1.32.0] – 2026-10-27

Versions stay aligned with GlassKit at 1.32.0, which this release is built against (peer dependency `>=1.32.0`). Ten new elements bring the count to 46.

### Added

- **`<glk-tab-bar>` as a sidebar, an icon rail, a bar docked at a side and a top bar, with one set of items for every layout.** The bar was a bottom bar. A sidebar on the desktop or a rail in a narrower window was a second navigation in the page's own markup, kept in step with the bar's items by hand. On phones whose system moves its own controls to a side, an unfolded iPhone Duo for one, the thumb rests at that edge and a bottom bar is out of reach. Of the two ways the issue offered, this is the first, one bar with several layouts, so the badge, the accessory, the events and the drop exist once:
  - `orientation="vertical"` makes the bar a column, placed by the page's layout.
  - `rail` shows the icons alone. The label stays each item's name and shows as a tooltip beside the rail on hover, keyboard focus and a long press.
  - `dock="start"` or `"end"` fixes the column to that edge of the viewport, clear of the edge's safe area and mirrored right to left.
  - `placement="top"` lays a horizontal bar out for the top of a page: no room for the home indicator, the border at the bottom, the icon beside the label on wide screens.
  - `<glk-tab-dock orientation="vertical">` stands the floating bar and its accessory upright at the end edge, or at the start edge with `dock="start"`. `accessory-left` puts the accessory at the top.
  - In a column the drop runs along y, through GlassKit 1.32.0, without code of its own here.
  - `label` names the navigation, and part `nav` is the `<nav>`.

  The page switches layouts by setting the attributes, with `matchMedia` or when the window changes shape. The items stay: the same buttons, the active item and the drop. ([#25](https://github.com/JUNGHERZ/GlassKit-Elements/issues/25))
- **`aria-current`, `badge-label`, `href` and part `item` on `<glk-tab-item>`.**
  - The active item carries `aria-current="page"` in every layout, the bottom bar included, so a screen reader tells which view is open.
  - `badge-label` words the count for the item's name, "Customers, 3 new" instead of "3 Customers".
  - With `href` the item is a link, which can open its view in a new tab. A cancelled `glk-tab-select` stops the navigation as well. A click with Ctrl, Cmd, Shift or Alt opens the view elsewhere and leaves the current tab active.

  ([#25](https://github.com/JUNGHERZ/GlassKit-Elements/issues/25))
- **`<glk-tooltip>`**: a short name or hint for a control on hover and focus, GlassKit's `.glass-tooltip`. The control is the element in `slot="trigger"`, or the one `for` names by its id, such as an item rendered elsewhere.
  - It shows after `show-delay` (400ms) on hover and at once on keyboard focus.
  - By touch it shows during a long press of 500ms and lingers briefly after the finger lifts. A tap never shows it and is never held up.
  - It hides when the pointer leaves both the control and the tooltip (the pointer may move onto it), on blur, on a press and on Escape. Escape leaves the focus where it is and a dialog around it open (WCAG 1.4.13).
  - It sits in the top layer, `popover="hint"` where the browser knows it, at `placement` top (default), bottom, start or end, `--gl-tooltip-offset` (8px) from the control. It flips and shifts to stay in the viewport.
  - The text becomes the `aria-description` of the element inside the control that takes the focus, such as the native button of `<glk-button>`, `<glk-pill>` or `<glk-tab-item>`. With `as-label` it is the control's name instead, for an icon-only control.

  The issue proposed element references to the tooltip's text. That text has no element of its own: it sits beside the trigger in the tooltip's light DOM, so a reference to the tooltip would read the trigger's own text with it. A string is announced the same way, and the element gives back the value it replaced when it goes. It is placed by measurement rather than CSS anchor positioning, because an anchor name does not reach from a shadow root to a light-DOM trigger. ([#29](https://github.com/JUNGHERZ/GlassKit-Elements/issues/29))
- **`<glk-menu>` with `<glk-menu-item>`, `<glk-menu-separator>` and `<glk-menu-group>`**: a menu button, GlassKit's `.glass-menu`, for the overflow menu of a header or the actions of a table row. It follows the WAI-ARIA menu button pattern:
  - The button in `slot="trigger"` carries `aria-haspopup="menu"` and `aria-expanded`. The panel has `role="menu"` and is named by the button.
  - The items are `menuitem`, `menuitemcheckbox` or `menuitemradio`, through `ElementInternals`, with `aria-checked` and `aria-disabled`. A disabled item keeps its place and is announced but cannot be chosen.
  - On the button, Enter, Space and Down open at the first item and Up at the last. In the menu, the arrows move and wrap and Home and End go to the ends. Typed characters within half a second jump to the next matching label.
  - Enter and Space choose. Escape closes and returns the focus to the button, and Tab closes and moves on.
  - Hovering moves the focus, and a click outside closes.
  - `glk-select { item, value, checked }` is cancelable and comes before anything happens. A plain item closes the menu and returns the focus. A checkbox item toggles and a radio item checks within its group, and both leave the menu open.
  - `variant="danger"` takes the error colour, and the `icon` and `trailing` slots hold an icon and a hint such as a shortcut.
  - `glk-open` and `glk-close` fire as on `<glk-popover>`. The panel opens in the top layer below the button and aligned at its start; `placement` is top, start or end.

  There is no `aria-controls`: the panel lives in the element's shadow root, where a reference from the button in the light DOM does not reach. ([#30](https://github.com/JUNGHERZ/GlassKit-Elements/issues/30))
- **`<glk-tree>` with `<glk-tree-item>`**: levels that open and close, GlassKit's `.glass-tree`, with the role and states of each item on the element through `ElementInternals`. The browser cannot count through the slots, so the tree sets `aria-level`, `aria-setsize` and `aria-posinset` explicitly.
  - Keyboard (WAI-ARIA tree view, one tab stop): Down, Up, Right, Left (mirrored right to left), Home, End, Enter and Space to select, `*` to open every sibling, and a typed letter to jump.
  - Selection does not follow the focus. A click on the twisty toggles, a click on the row selects, and the `trailing` slot keeps its own clicks.
  - `glk-tree-toggle { item, expanded }` and `glk-tree-select { item, value }` are cancelable and come before anything changes.
  - **Loading on demand**, for structures of several hundred entries. `has-children` says that children are still to come, and the twisty shows before any of them exists.
    - Opening such an item emits `glk-tree-load { item, retry }` (cancelable). The item then shows a spinner, `aria-busy` and `loading` until child items arrive or `has-children` goes.
    - It loads once: closed and opened again, it keeps its children. Re-adding `has-children` allows another load.
    - An item that the page moves into an unloaded item does not count as its children: opening it still loads.
    - Children appended inside the handler count as loaded at once. A cancelled load shows no loading state.
  - **Load errors:** `load-error=message` (`loadError`) reports a failure. The item closes and shows GlassKit's `.is-error`, the message becomes its description, and the tree announces it in a polite live region. Opening the item again tries once more, with `retry: true`.
  - **Single items change in place.** The page appends, removes, moves and renames items with the DOM's own methods, without rendering the tree again. Expanded levels, the selection and the scroll position stay, and a moved item is the same element.
    - The focus stays on a moved item.
    - For a removed item it goes to the one that took its place, else the one before it, else the open item around it.
    - In a level that closes, it goes to the open item around it.
    - All of this applies only while the focus was in the tree.
    - `highlight()` flashes an item that changed elsewhere (GlassKit's `.is-flash`), without the flash under `prefers-reduced-motion`.
  - Attributes `label`, `selection` (single or none) and `value`. On items: `label`, `value`, `expanded`, `selected`, `disabled`, `has-children`, `load-error`, slots `icon`, `trailing` and `handle`, and parts `item`, `row`, `twisty`, `label` and `group`.

  ([#26](https://github.com/JUNGHERZ/GlassKit-Elements/issues/26))
- **`<glk-breadcrumbs>` with `<glk-breadcrumb>`**: the path through nested levels, GlassKit's `.glass-breadcrumbs`, drawn as `<nav aria-label><ol><li>`. Each crumb is a link (`href`) or a button (`value`), and the current level is plain text with `aria-current="page"`.
  - `glk-navigate { item, value, href, index }` is cancelable. Cancelled on a link, it stops the browser, so a single-page app routes by itself. A link without a listener just works, in a new tab too.
  - Where the path does not fit, measured on the element, the middle levels fold into a "…" crumb (`collapse="auto"`, the default). It is a `<glk-menu>` named "2 more levels", or `more-label`, that lists them. The first crumb and the last two stay.
  - A label cut by the ellipsis shows in full in a tooltip.
  - With `drop-target`, or the same `group` as a sortable list or tree, the crumbs take dragged items, and hovering "…" during a drag opens its menu.
  - `more-label-one` holds the singular of `more-label`, for languages that need a form of their own: `more-label="{count} weitere Ebenen" more-label-one="1 weitere Ebene"`.
  - Parts are `nav`, `list`, `crumb`, `current` and `overflow`. There is no `separator` part: the separators are drawn by CSS on the items.

  ([#27](https://github.com/JUNGHERZ/GlassKit-Elements/issues/27))
- **Sorting by drag and drop: `sortable` and `group` on `<glk-list>` and `<glk-tree>`.** Items move within a level, into a container item (`container`, or a tree item with children) and onto a crumb. Lists of the same `group` exchange items with each other, and so do trees. A list without a group keeps its items to itself; breadcrumbs with `drop-target` still take them. `no-drag` keeps an item in place, and `slot="handle"` makes the handle the only place a pointer starts a drag, so a tap on the item still chooses it.
  - **Mouse and pen** start after 6px.
  - **Touch** starts after a long press of 500ms, before which a swipe scrolls. A handle starts at once.
  - **Keyboard:** Space picks up and Up, Down, Home and End move within the level. Right moves into the container above and Left out of the container, at the list's top onto the breadcrumbs. Space drops, and Escape or Tab cancels.
  - A polite live region announces each step. The texts come from a `messages` property with English defaults, so a page can translate them.
  - Near the scroller's edges the list scrolls. A closed container opens after 600ms over it.
  - **Events,** all with `via`: `glk-sort-start { item, from }`, `glk-sort-over { item, target, position }` (cancelable: refused, the target shows the error colour and takes nothing), `glk-sort { item, from, to, target, position }` (cancelable, before anything moves) and `glk-sort-cancel { item }`.
  - **Who moves the DOM:** not cancelled, the element moves the node itself. Cancelled, it leaves the DOM to the page, which renders the new order from its state. A drop into a list item's container or onto a crumb moves nothing, because that level is not in the DOM. Either way the items glide into place once the new order is there (`--gl-sort-duration`, `--gl-sort-easing`), and not under `prefers-reduced-motion`. The focus stays on the dropped item, and a drag whose item the page removes is cancelled.
  - The current crumb takes no drop from a list, because it stands for the list's own level. `drop-target` and `group` on the breadcrumbs may change at any time.
  - In a `<glk-list>`, too, single items change in place with the DOM's own methods, with the focus kept as in the tree, and `highlight()` on `<glk-list-item>` flashes one.

  While dragging, a line marks where the item lands. The issue's items that make room as the pointer moves would shift the target under the pointer at every step. The instructions are a description string on each item, `aria-description`, since an id reference from the light DOM does not reach into the items' shadow roots. Space on an item picks it up and Enter selects or clicks it, also where a handle exists, so a handle that cannot take the focus, an `<svg>`, leaves the keyboard its way. `messages` applies at once, also to the items' description. Lists and trees do not exchange items with each other: a list item in a tree, or a tree item in a list, would be an element of the wrong kind. ([#28](https://github.com/JUNGHERZ/GlassKit-Elements/issues/28), [#26](https://github.com/JUNGHERZ/GlassKit-Elements/issues/26))
- **`<glk-table>`**: around a native `<table class="glass-table">` in its light DOM, so the table keeps its semantics, copy and paste, find in page and markup rendered on the server.
  - **Sorting:** a header cell with `data-sort="<key>"` gets a sort button and `aria-sort`. A click, Enter or Space cycles the direction and emits `glk-table-sort { key, direction }`, cancelable. The page sorts, often on the server, and `sort` and `direction` show the state.
  - **`sticky-header`:** the wrap scrolls both ways, as high as `--gl-table-max-height` (60vh), and the header sticks to its top. The edges shade where more columns wait.
  - **Row actions:** cells with `class="glass-table__actions"` stay at the row's end while the table scrolls sideways.
  - **Empty state:** while the body has no rows, the `empty` slot shows below the header.
  - **`list-below="640px"`:** narrower than that, measured on the element, each row becomes a card with the column's name before each value. The element copies each header's text into its cells as `data-label` and keeps the table's roles explicit, so assistive technology still meets a table.
  - Parts are `wrap` and `empty`.

  The sort event is named `glk-table-sort`, not the issue's `glk-sort`, which a sortable list emits when an item is dropped. A page that listens for one never hears the other. ([#31](https://github.com/JUNGHERZ/GlassKit-Elements/issues/31))
- **`glk-closed` on `<glk-sheet>` and `<glk-modal>`, and `close()` returns a promise.** Nothing told a page when a sheet had finished sliding out. `glk-close` fires only for the visitor's dismissal, and before the slide-out; `close()` and removing the attribute emitted nothing. A page that renders the sheet from state removed it in the same frame, and the slide-out never showed. `glk-closed` now fires once the dialog has closed after the slide-out (the fade for the modal), on every way of closing: attribute, property, `close()`, swipe, backdrop or Escape. Under `prefers-reduced-motion` it fires at once. `close()` returns a promise that settles at the same moment, and at once if nothing was shown. `glk-close` keeps its meaning. ([#24](https://github.com/JUNGHERZ/GlassKit-Elements/issues/24))

### Changed

- **`<glk-popover>` opens in the top layer.** It hung absolutely below its trigger. An `overflow: hidden` around it cut it off, it left the screen at the edges, and closed it still widened the page by its box. It now shares its placement with the tooltip and the menu: flipped to the other side where the viewport leaves no room, shifted to stay inside it, and following while the page scrolls. Escape returns the focus to the trigger when it was inside the panel. ([#29](https://github.com/JUNGHERZ/GlassKit-Elements/issues/29))
- **An interactive `<glk-list-item>` is a button for the keyboard and for assistive technology.** Before, only a pointer could reach it. Its row is now in the Tab order with `role="button"`. Enter clicks on keydown and Space on keyup, like a native button, and GlassKit 1.32.0 draws its focus ring. The items of a sortable list take the focus the same way. ([#28](https://github.com/JUNGHERZ/GlassKit-Elements/issues/28))
- **From GlassKit 1.32.0**, by inheritance:
  - The drop's motion tokens reach `<glk-tab-bar droplet>` and `<glk-segmented droplet>` ([GlassKit #23](https://github.com/JUNGHERZ/GlassKit/issues/23)).
  - `--gl-btn-primary-bg` and `--gl-color-primary-fill` reach the primary `<glk-button>`, `<glk-calendar>`, `<glk-date-strip>` and `<glk-steps>`. The dot of `<glk-radio>` follows `--gl-color-on-primary`, and the chosen date strip day's weekday is as strong as its number ([GlassKit #24](https://github.com/JUNGHERZ/GlassKit/issues/24)).
  - Tab bar items show a focus ring on keyboard focus.

### Compatibility

- An interactive list item is now a button. Put no other control inside it, because a button inside a button is lost to assistive technology. An item with actions of its own leaves `interactive` off and keeps the actions in its `trailing` slot.
- `<glk-popover>`'s panel is fixed in the top layer, no longer absolutely positioned in its parent.
- The panels of `<glk-popover>`, `<glk-tooltip>`, `<glk-menu>` and the breadcrumbs' overflow use the popover API: Chrome 114, Safari 17 and Firefox 125 or newer.

Measured in Chromium 153, WebKit 26.6 and Firefox 151 with the issues' pages and our own tests:
- **Tab bar:**
  - A sidebar of 240 by 420px with 44px rows, `aria-current="page"` on the active one, "Customers, 3 new" as a name and a link for `href`.
  - A rail 72px wide with 48px items and its tooltip beside the rail.
  - A rail docked at the end runs from top to bottom at the right edge, or at the left edge right to left.
  - Switching to the bottom bar in place keeps the same buttons, the active item and the drop.
- **`glk-closed`** fires 303 to 343ms after `close()`, the attribute, Escape or the backdrop, or within 5ms under reduced motion, together with the promise.
- **Tooltip:** not yet shown at 200ms, shown at 600ms, still open with the pointer on it, shown on keyboard focus, and gone after Escape with the focus in place.
- **Menu:** every key of the pattern, typeahead, checkbox and radio items, a click outside, and the panel shifted inside a 390px viewport. Its roles show in Chromium's accessibility tree.
- **Popover:** the panel lies in the top layer inside a 390px viewport, the closed page stays 390px wide, and Escape returns the focus to the trigger.
- **Tree:** all of its keys, lazy loading with `aria-busy`, and its levels, sizes, positions and states in Chromium's accessibility tree.
- **Loading and live changes:**
  - An item loads once and keeps its children when closed and opened again.
  - A failed load closes the item, describes and announces the message, and loads again on the next opening with `retry: true`.
  - A child moved into an unloaded item does not stop its load.
  - The focus stays on a moved item, goes to the item after a removed one, and goes to the open item around one in a level that closes. A focus outside the tree stays outside.
  - In a list the focus stays on a moved row, on the next row after a removal, and on the dropped item after a keyboard move.
  - `highlight()` flashes for 1.2s, and not at all under reduced motion.
- **Breadcrumbs:** fold at 390px into "1 more level", and a cancelled crumb does not navigate.
- **Sorting** by mouse, touch long press and keyboard, with the announcements word for word: within a list, into a container, onto a crumb, out of a tree level, cancelled by the page and by Escape. A swipe without a long press starts nothing.
- **Table:**
  - It sorts and cycles, and a cancelled sort keeps the state.
  - The sticky header stays at the wrap's top.
  - The empty state shows below the header.
  - Narrower than `list-below`, it becomes cards with the table's roles.
  - The edges shade and the action cells stay at the end while it scrolls sideways.
  - Nothing changes in the DOM at rest.

Docs (English and German), README and SKILL.md describe the new elements, the tab bar's layouts, sorting, loading on demand and changes in place. The showcases show the menu, the tooltip, the breadcrumbs, the tree, a sortable list, the table and a rail. The existing docs, showcase and landing pages render as in 1.31.0 in all three engines, in Chromium section by section, apart from the chosen date strip day's weekday.

---

## [1.31.0] – 2026-10-25

Versions stay aligned with GlassKit at 1.31.0, which this release is built against (peer dependency `>=1.31.0`).

### Added

- **`size` takes a height and `auto` together: `<glk-button size="sm auto">`.** `size` mapped to exactly one class, so a small button as wide as its text could not be written: `size="sm"` gave the small height without room beside the text, `size="auto"` the room at full height, and `size="sm auto"` no size class at all — a 56px button. Now one height (`sm`, `md` or `lg`; of two, the first counts) and `auto` combine, in either order. The issue offered a list or a boolean `fit`; the list keeps one attribute for the size and reads the way GlassKit's classes combine. ([#23](https://github.com/JUNGHERZ/GlassKit-Elements/issues/23))
- **Part `button` on `<glk-button>`**, the native button inside, for what the tokens do not reach. ([#23](https://github.com/JUNGHERZ/GlassKit-Elements/issues/23))
- **`badgeTone` on the options of `<glk-segmented>`.** The count took its colour only from the option's `tone`, which also puts a dot before the label. `badgeTone` — `primary`, `success`, `warning` or `error` — colours the count alone, through GlassKit 1.31.0's `.glass-segmented__badge--*`, without the dot; with both, the count keeps its own colour; an unknown value is ignored. Options filled in place update it, and the focus stays. ([#22](https://github.com/JUNGHERZ/GlassKit-Elements/issues/22))
- **Parts `item` and `badge` on `<glk-segmented>`**: each option's button and its count. Size and hairline of the count are GlassKit tokens (`--gl-segmented-badge-height`, `-font-size`, `-border`), which reach the element by inheritance. ([#22](https://github.com/JUNGHERZ/GlassKit-Elements/issues/22))

### Changed

- **Small buttons keep room beside their label.** A `size="sm"` button in a flex row, an empty state or a list's trailing slot took its width from its text and kept the browser's padding, 6px (Firefox 4px), so its edges touched the text. GlassKit 1.31.0 gives every button 24px, as `size="auto"` had: in the docs and the showcase "Small" grows from 51 to 87px and "Book" from 48 to 84px, and the showcase's row of three small buttons breaks into two lines in its narrow column. `--gl-btn-padding-x-sm` sets another value. `--gl-btn-radius` rounds the buttons alone, for pill-shaped ones. ([GlassKit #20](https://github.com/JUNGHERZ/GlassKit/issues/20), [#22](https://github.com/JUNGHERZ/GlassKit/issues/22))
- **GlassKit 1.31.0's contrast:** muted text, card text and icons reach WCAG AA by default, and the elements take the values by inheritance. ([GlassKit #19](https://github.com/JUNGHERZ/GlassKit/issues/19))

Measured in Chromium 153, WebKit 26.6 and Firefox 151 with the issues' pages: `size="sm"` in a flex row has 24px beside its text, which starts 25px from the edge (1.30.0: 6px and 7px, Firefox 4px and 5px); `size="sm auto"` and `"auto sm"` give `--sm --auto` and a 44px button (1.30.0: no size, 56px); `"sm lg"` gives `--sm`; the inner button carries `part="button"`. With `--gl-btn-radius: 9999px` on the page the button is round, the list and the segmented control stay at 16px. In `<glk-segmented>` `badgeTone: "error"` colours the count without a dot, `tone: "success"` with `badgeTone: "warning"` keeps the green dot and a warning count, an unknown tone gives a neutral count, options and counts carry their parts, and new options with the same values keep the buttons and the focus. With GlassKit's raised tokens set back to their 1.30.0 values, docs, showcase and landing pages render as in 1.30.0 in all three engines — in Chromium section by section — apart from the small buttons above, the showcase row that now breaks, and the new example of `badgeTone`.

---

## [1.30.0] – 2026-10-22

Versions stay aligned with GlassKit at 1.30.0, which this release is built against (peer dependency `>=1.30.0`).

### Changed

- **`<glk-sheet>` is a native `<dialog>` in the top layer.** Its overlay was a `div` with `position: fixed` and `z-index: 1000` in its shadow root, so whether it covered the page depended on stacking contexts and on how the browser composites: on an iPhone a fixed bottom tab bar with a backdrop filter and a transform now and then landed above an open sheet. Since 1.30.0 the overlay is a `<dialog>` opened with `showModal()`, as `<glk-modal>`'s has been since 1.20.0: it lies in the top layer, above every fixed or transformed element whatever its `z-index`, the page behind it is inert for pointer, keyboard and screen readers, focus moves in — an `autofocus` element takes it — and Escape arrives as the dialog's `cancel` event and slides it out. The slide and the fade stay as they were, on GlassKit 1.30.0's rules for `dialog.glass-sheet-overlay`; `inline` keeps the panel in the flow, and switching between the two works while open. The part `overlay` is the `<dialog>` now; the title names the dialog through `aria-labelledby`. ([#21](https://github.com/JUNGHERZ/GlassKit-Elements/issues/21))

### Added

- **`glk-open` on `<glk-sheet>` and `<glk-modal>`.** Nobody learned that a sheet had opened: only `glk-close` existed, and only for the visitor's close. Both now emit `glk-open` whenever they open — attribute, property or `show()`, also when they start open — so a page can hide its own fixed bars, for instance. `glk-close` keeps its meaning. ([#21](https://github.com/JUNGHERZ/GlassKit-Elements/issues/21))
- **The page behind an open sheet or modal does not scroll.** The top layer made the page inert for pointer and keyboard, but a wheel or a finger over the dimmed area still scrolled it, and on a phone touch scrolling moved the page and slid its bars. While either is open, the root scroller takes `overflow: hidden`, and a classic scrollbar keeps its room so the page does not shift; the lock is shared, so it ends only when the last open sheet or modal closes. Scripts of the page can still scroll it. ([#21](https://github.com/JUNGHERZ/GlassKit-Elements/issues/21))
- **Parts on `<glk-accordion-item>`:** `item`, `trigger`, `content`, `body`. Its shadow root had none, so a page could not reach the content at all. ([#20](https://github.com/JUNGHERZ/GlassKit-Elements/issues/20))

### Fixed

- **An open `<glk-accordion-item>` shows all of its content.** GlassKit capped the open content at `max-height: 500px` with `overflow: hidden`, so a section with 40 rows of 30px showed 500 of 1,220px and the rest, a "show more" row included, could not be reached. GlassKit 1.30.0 slides a grid row from `0fr` to `1fr` instead: the section takes the height of its content, however long, also when the content grows while open, and the slide stays. ([#20](https://github.com/JUNGHERZ/GlassKit-Elements/issues/20))
- **Escape pressed twice on `<glk-modal>` emitted `glk-close` twice.** The second press arrived while the modal faded out; it is ignored now, on the sheet as well.
- **A modal or sheet with nothing to focus no longer rings the screen.** `showModal()` then focuses the dialog itself, and Chromium and WebKit drew its focus ring along the edges of the viewport; GlassKit 1.30.0 gives both dialogs no outline. Tab still goes to the first control.

Measured in Chromium 153, WebKit 26.6 and Firefox 151, with the issues' pages: the accordion item shows 1,220 of 1,220px (1.29.1: 500) and has its four parts. The sheet matches `:modal` after `setAttribute('open', '')`, `glk-open` fires once, the `autofocus` field has the focus, the root takes `overflow: hidden` and a wheel over the scrim leaves the page where it was (1.29.1: no event, focus on the body, the page scrolled); Escape and a scrim click slide it out with one `glk-close`, `close()` with none; a modal and a sheet open together keep the lock until the second closes; a sheet moved while open stays modal; an inline sheet opens no dialog and locks nothing, and turned into an overlay while open it becomes modal with `glk-open`. The modal emits `glk-open` and locks the page as well, and two Escapes give one `glk-close` (1.29.1: two). An open sheet renders pixel-identical to the `div` of 1.29.1, light and dark, 390 and 800px wide.

---

## [1.29.1] – 2026-10-21

Rebuilt against GlassKit 1.29.1; the peer dependency moves to `>=1.29.1`.

### Fixed

- **`<glk-list flush>` reaches both edges of its container.** The inner list carries GlassKit's `.glass-list--flush`, which kept `width: 100%` and only moved to the start: in a `<glk-card>` it ended 4px from the left inner edge and 44px from the right. With GlassKit 1.29.1 it spans the card, the body of a `<glk-modal>` and a `<glk-sheet>` from edge to edge; the card and the modal body hand their padding to the list as `--gl-list-flush-inset`, which reaches its shadow root by inheritance. Measured in Chromium 153, WebKit 26.6 and Firefox 151: 0.0px from both inner edges in all three. ([GlassKit #18](https://github.com/JUNGHERZ/GlassKit/issues/18))

---

## [1.29.0] – 2026-10-21

Versions stay aligned with GlassKit at 1.29.0, which this release is built against (peer dependency `>=1.29.0`).

### Added

- **A count per option in `<glk-segmented>`: `badge` and `badgeLabel`.** In an admin area a customer record has a row of tabs — payments, subscriptions, invoices, tickets — and a tab should say that something waits there, and how much. `tone` puts a dot before the label, which says that, not how much, so the count went into the label ("Current (2)"), where it read as part of it and could be neither styled nor announced apart. An option is `{ value, label, tone?, disabled?, badge?, badgeLabel? }` now. `badge`, a number or a short text, shows as GlassKit 1.29.0's `.glass-segmented__badge` after the label, neutral or in the tone's colour; missing, empty or `0` shows none. The button's name says it with the label, "Tickets, 1", and `badgeLabel` words it, "Tickets, 1 open". With `icon-only` the badge sits at the icon's corner, as on `<glk-tab-item>`, and the button's `title` carries it as well. Measured in Chromium 153, WebKit 26.6 and Firefox 151: the badges stand after their labels, or 4px above and 8px beyond the icon in an icon-only row; the names read "Payments, 2", "Invoices, 12 open", "Alerts, 1 new", and "Mails" for a `0`; the drop covers the chosen option with its badge, and in a scrolling row the option stays centred; a tap on a badge chooses its option. ([#19](https://github.com/JUNGHERZ/GlassKit-Elements/issues/19))
- **New options with the same values in the same order fill the buttons in place.** Setting `options` rebuilt every button, so a keyboard user on the row lost the focus whenever a count changed, and the drop was handed a new element. Now the buttons stay and take their new label, tone, icon box and count; other values or another order rebuild the row as before. Measured in all three engines: after three counts changed, the six buttons are the same nodes, the focus stays on the focused option, the drop stays where it was, and no `glk-change` fires; in 1.28.1 the buttons were new and the focus was gone. ([#19](https://github.com/JUNGHERZ/GlassKit-Elements/issues/19))

---

## [1.28.1] – 2026-10-20

GlassKit is unchanged; the peer dependency stays `>=1.28.0`.

### Fixed

- **A tap on a slotted icon chooses the `<glk-segmented>` option.** The row found the option's button with `event.target.closest('button[data-value]')`. A click on an icon from `slot="icon-<value>"` has that icon as its target, in the light DOM, where `closest()` walks the light-DOM ancestors and never meets the button in the shadow root. In an `icon-only` row, where the 18px icon covers the middle of every 34px option, most taps chose nothing. The button now comes from the event's composed path. Slotted SVGs, font icons and custom elements were affected alike; text labels were not, they live in the shadow root. Measured in Chromium 153, WebKit 26.6 and Firefox 151: a tap on the centre of a slotted SVG, a font icon or a custom element chooses its option and emits `glk-change` once — in 1.28.0 it chose nothing; the icon of a disabled option chooses nothing; label text, the keyboard and a drag of the drop work as before, and so does an icon with `pointer-events: none`, a workaround that can go now. ([#18](https://github.com/JUNGHERZ/GlassKit-Elements/issues/18))

---

## [1.28.0] – 2026-10-20

Versions stay aligned with GlassKit at 1.28.0, which this release is built against (peer dependency `>=1.28.0`).

### Added

- **Icons that are not inline SVG in `<glk-tab-item>`: `slot="icon"`.** The item copied the first `<svg>` of its light DOM into its shadow root and showed nothing else, so an app whose tab icons come from Material Icons, a ligature font, or from an element of its own could not use them. Anything slotted as `icon` now sits in GlassKit's `.glass-tab-bar__icon`, before the badge, and takes the state colour from it (GlassKit 1.28.0): inactive, hover, active, the lens of the drop and the drag; on a bar without droplet the active icon carries the glow. An `<svg>` without `slot` is copied as before; with a slotted icon nothing is copied. ([#17](https://github.com/JUNGHERZ/GlassKit-Elements/issues/17))
- **Icons per option in `<glk-segmented>`: `slot="icon-<value>"`, and `icon-only`.** The options were text only. Each option now takes an icon from the slot named after its value — an `<svg>`, a font icon, an `<img>` — in GlassKit's `.glass-segmented__icon` before the label; an option without one has no icon box, and an icon added or removed later shows or hides it. The icon box is `aria-hidden`, so a font icon's text never joins the name. `icon-only` (property `iconOnly`) shows the icons alone, for a light / dark / auto switch: the row takes `.glass-segmented--icons`, and each label becomes the button's `aria-label` and `title`. ([#17](https://github.com/JUNGHERZ/GlassKit-Elements/issues/17))
- **`droplet` and `floating` are properties of `<glk-tab-bar>`.** The README called `droplet` "also a property", but `GlkTabBar` had no accessor, so `bar.droplet = true` set an own property and changed nothing; `floating` had the same gap. ([#17](https://github.com/JUNGHERZ/GlassKit-Elements/issues/17))
- **GlassKit 1.28.0's tokens reach the elements by inheritance:** `--gl-tab-bar-color`, `--gl-tab-bar-hover-color`, `--gl-tab-bar-label-size` and `--gl-tab-bar-z-index` for `<glk-tab-item>`, `<glk-tab-bar>` and `<glk-tab-dock>`; `--gl-segmented-active-bg`, `-shadow` and `-color` for the chosen option of `<glk-segmented>` and its drop. ([GlassKit #17](https://github.com/JUNGHERZ/GlassKit/issues/17), [GlassKit #14](https://github.com/JUNGHERZ/GlassKit/issues/14))

### Changed

- **`glk-tab-select` comes before `active` changes, and it is cancelable.** A bar item that opens a side drawer or an external link must not become active, but the item set `active` before it emitted `glk-tab-select`, and the bar, listening on its way up, removed `active` from the others and emitted `glk-tab-change` before a listener on the document had even seen the event: the page could only put `active` back, and on a droplet bar the drop ran to the item and back. Now `event.preventDefault()` keeps the current tab — no `active`, no `glk-tab-change`, and the drop stays. A drag that ends on such an item takes the same path, because the drop clicks the item, and the drop goes back. Uncancelled, the item becomes active and the bar emits `glk-tab-change` after `glk-tab-select`; in 1.27.0 a listener on the document received `glk-tab-change` first. ([#17](https://github.com/JUNGHERZ/GlassKit-Elements/issues/17))

### Fixed

- **The action buttons of `<glk-modal>` follow attribute changes.** The actions are copies of the buttons in `slot="actions"`, kept in step by the light-DOM observer — which watched content but not attributes. A confirm button that starts `disabled` stayed disabled in its copy after the page enabled it, a disabled copy forwards no click, and with a framework that binds only `disabled` (hybrids, lit, Vue) the dialog could never be confirmed. The observer of every element that copies light-DOM children now watches attributes too, so the copies of `<glk-select>`'s options and `<glk-tab-item>`'s SVG follow them as well. With as many actions as before, the copies change in place, so the one that has the focus keeps it while it is relabelled or disabled. Measured in Chromium 153, WebKit 26.6 and Firefox 151 with the issue's dialog: after typing DELETE the copy of Delete is enabled (in 1.27.0 it stayed disabled) and a click on it runs the original once; relabelled and marked `aria-busy` while focused, the copy stays the same node and keeps the focus; an option of `<glk-select>` disabled after connecting is disabled in the copy. ([#16](https://github.com/JUNGHERZ/GlassKit-Elements/issues/16))
- **An inline `onclick` on a modal action runs once.** The copy carried the original's `onclick` attribute and ran it, then handed the click to the original, which ran it again: the issue's `alert('deleted')` would have shown twice. The copies carry no inline handlers now. Found while fixing the above. ([#16](https://github.com/JUNGHERZ/GlassKit-Elements/issues/16))
- **From GlassKit 1.28.0:** under a scaled ancestor the drop of `<glk-tab-bar droplet>` and `<glk-segmented droplet>` lands on the chosen item, at rest, while the transform runs and during a drag ([GlassKit #16](https://github.com/JUNGHERZ/GlassKit/issues/16)); the items of the fixed `<glk-tab-bar>` sit in the middle without a home indicator ([GlassKit #17](https://github.com/JUNGHERZ/GlassKit/issues/17)); seven steps in `<glk-steps>` fit a narrow column, so a `::part(steps)` gap workaround can go ([GlassKit #15](https://github.com/JUNGHERZ/GlassKit/issues/15)).

### Compatibility

- A listener on `glk-tab-select` that read the item's `active` there sees the previous state now; `glk-tab-change` still comes after the change. The bar no longer listens for `glk-tab-select`: the item calls it once the event went through uncancelled, so a `glk-tab-select` dispatched by a page switches no tab.

Measured in Chromium 153, WebKit 26.6 and Firefox 151: a slotted text icon, a custom element and a slotted SVG take the inactive colour, the hover colour, the primary when active and while the dragged drop is over them, and no SVG is copied next to them; `glk-tab-select` cancelled from a listener on the document leaves `active`, the drop and `glk-tab-change` alone on a tap and on a drag, where the drop returns to the current tab; segmented icons are 18 × 18 px, icon-only options 34 × 34 px with `aria-label` and `title`, the icon under a dragged drop scales by 1.15; `bar.droplet = false` removes the attribute, the class and the drop, `true` brings them back; the new GlassKit tokens arrive in every shadow root. Docs, showcase and landing pages render pixel-identical to 1.27.0, except the fixed tab bar of the docs, whose items moved to the middle, and the narrow steps, whose lines reach 2px closer to their circles.

---

## [1.27.0] – 2026-10-18

Versions stay aligned with GlassKit at 1.27.0, which this release is built against (peer dependency `>=1.27.0`).

### Added

- **`droplet` on `<glk-tab-bar>` and `<glk-segmented>`: a fluid selection.** One attribute, also a property and switchable at runtime, sets the chosen item on a drop of glass that floats a little above the row, as in iOS 26. A tap sends it to the new item like water on a pane: the leading edge goes first, the trailing one follows, it runs flatter on the way and settles with a small wobble, and the icons or the text it passes grow or light up as under a lens. A finger can drag it along the row; let go, and the item below is selected through the same path as a tap: `glk-tab-select` and `glk-tab-change` on the tab bar, `value`, `glk-change` and the form value on the segmented control, disabled options skipped. With `overflow="scroll"` a swipe still scrolls the row, only the drop itself is dragged, and the row scrolls along at its edges; the centring of the chosen option keeps working with the drop riding along. It is GlassKit 1.27.0's `--droplet`, moved by its `glasskit-droplet.js`. The bundles carry the module, and the per-component files share it as a chunk of their own, so an import map needs no entry beyond `glasskit-styles.js`. Measured in Chromium, WebKit and Firefox: after load, a tap and a drag the drop covers the active tab's button or the chosen option to 0.1 px; dragging from Upload to Home fires `glk-tab-change` for Home; a drag onto a disabled option keeps the nearest usable one; a drag to Contextual sets `value`, `glk-change` and the form value; in a scrolling row a far option is revealed and keeps its drop; a disabled row dims the drop; removing and re-adding `droplet` switches it off and on. ([GlassKit #13](https://github.com/JUNGHERZ/GlassKit/issues/13))
- **GlassKit's tokens for the active tab reach `<glk-tab-item>`:** `--gl-tab-bar-active-bg` and `--gl-tab-bar-active-shadow` for a capsule behind it, `--gl-tab-bar-spotlight-opacity` and `--gl-tab-bar-active-glow`. A capsule no longer needs a sheet of its own through `hostStyles`. Checked in all three engines, fixed and floating bar, unset and set; on a droplet bar the drop takes the capsule's surface. ([GlassKit #13](https://github.com/JUNGHERZ/GlassKit/issues/13))

### Fixed

- **The items of `<glk-tab-bar floating>` take the floating look.** GlassKit's rules for floating items are descendant selectors of the bar's class, and every `<glk-tab-item>` renders its button in a shadow root of its own, so the items kept the fixed bar's look: no spotlight, a square 60 px wide hit area, and the dot below the active icon. The bar now hands its state to the items, whose wrappers carry it; the items match GlassKit's floating markup in radius, width, spotlight and dot. On the docs, showcase and landing pages as they were in 1.26.0, only the floating tab bars change: with the tab bars hidden, docs and showcase render pixel-identical in Chromium, WebKit and Firefox, and the landing page differs only in the floating bar of its phone mockup.

---

## [1.26.0] – 2026-10-18

Versions stay aligned with GlassKit at 1.26.0, which this release is built against (peer dependency `>=1.26.0`).

### Added

- **Primary-coloured text has a token of its own: `--gl-color-primary-text`.** GlassKit 1.26.0 separates the primary as text from the primary as fill. In the elements, the icon and label of the active `<glk-tab-item>`, `<glk-list-item variant="accent">`, the value of `<glk-range>`, the primary action of `<glk-modal>`, and the trigger on hover and the chevron of an open `<glk-accordion-item>` take it; buttons, toggles, steps and the chosen days of `<glk-date-strip>` and `<glk-calendar>` keep the primary. A brand that darkens its primary for white button text lightens the text in its dark theme without changing a button, and `--gl-tab-bar-active-color` colours the active tab alone. Both reach every shadow root by inheritance, also on a page that loads only these elements: the token blocks the bundle puts on the document declare `--gl-color-primary-text` in both themes. Measured in Chromium, WebKit and Firefox: set in the dark theme, both arrive in every element listed; in a nested `data-theme="light"` scope `--gl-color-primary-text` keeps the light primary; the fill of `<glk-button variant="primary">` stays as it was. ([GlassKit #12](https://github.com/JUNGHERZ/GlassKit/issues/12))

With the tokens unset, docs, showcase and landing pages render pixel-identical to 1.25.0 in Chromium, WebKit and Firefox.

---

## [1.25.0] – 2026-10-16

Versions stay aligned with GlassKit at 1.25.0, which this release is built against (peer dependency `>=1.25.0`).

### Added

- **Tint surfaces: `data-surface="tint"` on `<html>`.** GlassKit 1.25.0's preset for a page with a background of its own: the surfaces in the flow become see-through tints of the text colour, nothing blurred, while what lies over other content keeps the solid values. That holds inside the shadow roots as well — the panels of `<glk-modal>`, `<glk-sheet>`, `<glk-popover>`, `<glk-toast>`, `<glk-tab-bar>` and `<glk-tab-accessory>`, with the fields inside them — because GlassKit's panel rule matches on the theme wrapper, which mirrors `data-surface` with any value. Measured in Chromium, WebKit and Firefox: `<glk-card>` and `<glk-input>` show the page through, `<glk-button variant="secondary">` and the panel of an open `<glk-modal>` do not. ([GlassKit #11](https://github.com/JUNGHERZ/GlassKit/issues/11))
- **GlassKit's new tokens reach the elements by inheritance:** `--gl-blur-overlay` for the dimmer of `<glk-modal>` and `<glk-sheet>`, `--gl-toggle-track-bg` / `-checked` for `<glk-toggle>`, the `--gl-radio-*` tokens for `<glk-radio>`, `--gl-textarea-field-sizing` for `<glk-textarea>` and `--gl-input-picker-icon` for date and time fields in `<glk-input>`. Measured: set on `:root`, each arrives inside the shadow root. ([GlassKit #11](https://github.com/JUNGHERZ/GlassKit/issues/11))

### Fixed

- **A form element without a label keeps no gap above its field.** `<glk-input>`, `<glk-select>` and `<glk-textarea>` render their label element even when `label` is empty, and it kept the input group's 8px gap; GlassKit 1.25.0 hides an empty label. With it, a long value in `<glk-input>` ends in an ellipsis, and a read-only `<glk-textarea>` has no resize handle. ([GlassKit #11](https://github.com/JUNGHERZ/GlassKit/issues/11))

With the presets and tokens unset, docs, showcase and landing pages render pixel-identical to 1.24.0.

---

## [1.24.0] – 2026-10-14

Versions stay aligned with GlassKit at 1.24.0, which this release is built against (peer dependency `>=1.24.0`).

### Added

- **Solid surfaces: `data-surface="solid"` on `<html>`.** GlassKit 1.24.0's preset makes every surface opaque and turns blur and gloss off. Its tokens reach the shadow roots by inheritance, also on a page that loads only these elements, because the preset is part of the tokens the bundle puts on the document. The theme wrapper of each element mirrors the attribute, as it mirrors `data-theme` and `data-density`: set from the start, followed on every change, removed with the attribute, and caught up when a moved element comes back. Measured in Chromium, WebKit and Firefox: card, buttons, field, select, textarea, toggle, checkbox, radio, list, segmented control, search and accordion item each show the same pixels inside over a red and over a blue page, and blur computes to `0px` in every shadow root. ([GlassKit #9](https://github.com/JUNGHERZ/GlassKit/issues/9))

Without the attribute, docs, showcase and landing pages render pixel-identical to 1.23.0.

---

## [1.23.0] – 2026-10-14

Versions realign with GlassKit at 1.23.0, which this release is built against (peer dependency `>=1.23.0`).

### Added

- **List text in `<glk-list-item>` can wrap, decided once for a whole app.** Title and subtitle were cut on a phone — one line with an ellipsis, `wrap` clamped at three lines — and the rules sat in the shadow root, out of a project's reach. GlassKit 1.23.0's list tokens reach into the element by inheritance: `--gl-list-title-white-space` and `--gl-list-subtitle-white-space` (`normal` wraps) and `--gl-list-subtitle-lines` (the clamp of `wrap`, `none` shows every line), set on `:root`, one `<glk-list>` or one row. Unset, every row renders as before. A workaround through the `hostStyles` hook can go. ([GlassKit #10](https://github.com/JUNGHERZ/GlassKit/issues/10))

### Fixed

- **A long word in a `wrap` subtitle breaks instead of being clipped, and a `wrap` row without a subtitle keeps its title centred** — both from GlassKit 1.23.0. An e-mail address ran 310 px wide out of a 198 px column; an empty subtitle hidden with `hidden` still took a line's gap. ([GlassKit #10](https://github.com/JUNGHERZ/GlassKit/issues/10))

Measured in Chromium, WebKit and Firefox at a 360 px viewport: `<glk-list-item>` gives the same line counts and row heights as plain GlassKit markup, with and without the tokens. Docs, showcase and landing pages render pixel-identical to 1.22.3.

---

## [1.22.3] – 2026-10-08

GlassKit is unchanged; the peer dependency stays `>=1.22.2`.

### Fixed

- **A `<fieldset disabled>` disables the form elements inside it.** The browser already counted them as disabled — `:disabled`, left out of `FormData` — but their native controls live in the shadow root, where no fieldset reaches, and stayed enabled: every field was reachable with Tab, typing and clicks changed the values, and `<glk-button type="submit">` fired `glk-click` and sent the form, empty. The elements now take the state from `formDisabledCallback`, which the browser calls for the element's own `disabled` attribute and for a fieldset alike, also when an element moves into or out of one. Inside a disabled fieldset they look disabled, drop out of the tab order, take no input and send nothing; a required empty field is barred from validation and counts again once the fieldset is enabled. The `disabled` property still reflects the attribute only, as on a native control. Radios skip a fieldset-disabled member of their group with the arrow keys, and the tab stop moves off it. ([#15](https://github.com/JUNGHERZ/GlassKit-Elements/issues/15))
- **`<glk-segmented disabled>` and `<glk-calendar disabled>` work.** Neither handled the attribute: the browser counted them as disabled and left them out of the form data, but a click still changed the value. Now the segmented row and the calendar's arrows and days are disabled; an option's own `disabled` stays as it is. ([#15](https://github.com/JUNGHERZ/GlassKit-Elements/issues/15))

### Added

- **A `disabled` property on every form element.** `<glk-search>`, `<glk-range>`, `<glk-segmented>` and `<glk-calendar>` had none; it sits on `GlkFormElement` now. A subclass of `GlkFormElement` overrides `applyDisabled(disabled)` to hand the state to its native controls; it runs after the first render and on every change.

Measured in Chromium and WebKit with every form element inside `<form><fieldset disabled>`, 21 checks per engine: all native controls disabled with GlassKit's disabled look, Tab passes them, clicks and typing change nothing, no submit, no `glk-click`; enabled again, everything works and the button submits once; own attribute and fieldset combine in every order; an element moved in or created inside is disabled from the start; a calendar month shown while disabled stays disabled. Docs, showcase and landing pages render pixel-identical to 1.22.2.

---

## [1.22.2] – 2026-10-08

### Fixed

- **In a `<glk-input>` affix, only what can be used takes the click.** Since 1.22.0 `::slotted(*)` gave pointer events back to everything slotted into `prefix` and `suffix`. A unit or an icon caught the click instead of the field. A disabled button took it, and focus delegation then moved the focus into the field — also into a read-only field whose container locks it with `pointer-events: none`, because the explicit `auto` outweighed the inherited `none`. Now the slots follow GlassKit: enabled controls, `<glk-button>`, `<glk-select>` and the other form elements included, links and elements with `tabindex` take the click; text, icons and disabled controls let it through to the field. A control has to sit in the slot itself: one wrapped in a slotted element needs `pointer-events: auto` from the page. A control passed on through another component's `<slot>` counts as slotted. Measured in Chromium and WebKit on the issue's page and 21 more cases: the unit, the icon and the disabled button hand the click to the field; in the locked container nothing reacts and the focus stays out; an enabled button, a link, a `<glk-button>` and a `<glk-select>` take their own. Docs, showcase and landing pages render pixel-identical to 1.22.1. Rebuilt against GlassKit 1.22.2, which applies the same rule to plain markup; the peer dependency moves to `>=1.22.2`. ([#14](https://github.com/JUNGHERZ/GlassKit-Elements/issues/14))

---

## [1.22.1] – 2026-10-08

### Fixed

- **`<glk-input type="date">` and `type="time"` fit narrow columns again in Chrome and Edge.** Rebuilt against GlassKit 1.22.1. Since 1.22.0 the field sits in GlassKit's `.glass-input-wrap`, whose grid column held a Chromium date or time input at its whole intrinsic width: two date fields side by side in a phone-width card overlapped each other and ran past the card's edge (in a 300 px row the second ended at x = 339), time fields likewise; Safari was not affected. The column shrinks now, and every field ends at its column again — measured in Chromium and WebKit, with and without a suffix, which keeps its padding. The `glk-input::part(box) { grid-template-columns: minmax(0, 1fr) }` workaround can go. The peer dependency moves to `>=1.22.1`. ([GlassKit #8](https://github.com/JUNGHERZ/GlassKit/issues/8))

---

## [1.22.0] – 2026-10-07

Versions realign with GlassKit at 1.22.0, which this release needs (peer dependency `>=1.22.0`) for the input affixes.

### Added

- **`<glk-input>` has `prefix` and `suffix` slots.** It had no slot at all, so a currency, a unit, an icon or a button inside the field's box had to be laid over it from outside, with the field's padding changed through the shadow root to keep the text clear. Now `<span slot="suffix">EUR</span>` sits inside the box at the end, a `slot="prefix"` icon at the start — right to left they swap sides —, both centred on the field. An affix shows only while something is slotted into it, and its width is measured, so the text keeps clear of a unit of any length and the room is there from the first frame, without sliding. A click on slotted text or an icon focuses the field; a slotted button or link takes its own click. Their text is read with the field as its description. New parts: `box`, `prefix`, `suffix`. Built on GlassKit 1.22.0's `.glass-input-wrap`. Without slotted content a field renders exactly as before — the docs, showcase and landing pages are pixel-identical in Chromium and WebKit. Measured: "EUR" 16 px from the end with the field's padding at 16 + 29 + 8 px, "https://" as prefix 48 px with the text after it, an 18 px icon giving 42 px; an affix added later shows and makes room, removed, the field is back to 16 px. ([#12](https://github.com/JUNGHERZ/GlassKit-Elements/issues/12))
- **`readonly` on `<glk-input>` and `<glk-textarea>`,** with a `readOnly` property. The attribute did not reach the field: a record shown before an edit mode was switched on stayed editable, and typing emitted `glk-input` and `glk-change`. The inner field is read-only now — focusable, selectable and submitted with the form, not editable, and barred from validation like a native read-only field. Measured in Chromium and WebKit: typing into `<glk-input readonly value="Ada">` leaves "Ada", the field takes the focus, the form submits "Ada"; `readOnly = false` makes it editable again. ([#11](https://github.com/JUNGHERZ/GlassKit-Elements/issues/11))

### Fixed

- **A value set as a property survives, whatever the moment.** Frameworks bind values as properties right after creating an element — hybrids whenever the name is a property, lit's `.value`, Vue —, before it is connected and before `<glk-select>` has copied its options in. Measured across the elements, before this release: setting `value` on `<glk-select>`, `<glk-input>`, `<glk-textarea>`, `<glk-search>` or `<glk-range>`, or `checked` on `<glk-checkbox>`, `<glk-toggle>` or `<glk-radio>`, before connecting threw a `TypeError`; a `<glk-select>` given its value after connecting but before the options were copied showed its first option while the app held the other value, and saving kept the value the user had not seen. Now every such setter keeps what it cannot apply yet and `render()` takes it up, the getters read it back meanwhile, and `<glk-select>` keeps a value naming no option yet as the wanted value — selected as soon as an option carries it, until the user picks another. That also makes good the documented promise that a `value` attribute whose option arrives later is selected then: a surviving default selection used to win. A form reset returns `<glk-select>` to its `value` attribute instead of the first option. ([#13](https://github.com/JUNGHERZ/GlassKit-Elements/issues/13))
- **Properties set before the element was defined are no longer lost.** A property a framework sets while the bundle is still loading lands on the element itself and hides the class's setter — `<glk-list header>`, `<glk-progress value>`, `<glk-image-picker label>` and the form values above showed nothing of it. On first connect such a value is taken off the instance and set again through the setter. Checked for all nineteen settable properties, set before connecting, before the definition and after connecting: each one shows and reads back. ([#13](https://github.com/JUNGHERZ/GlassKit-Elements/issues/13))

### Documentation

- Docs (English and German), README and SKILL.md describe the slots, `readonly`, the wanted value of `<glk-select>` and that properties set early are kept. The prose that 1.20.0 to 1.21.2 added to SKILL.md and README is on one line per paragraph now, as the rest of the new text.

---

## [1.21.2] – 2026-10-05

### Fixed

- **Disabled elements look disabled.** Rebuilt against GlassKit 1.21.2, which adds the disabled state its controls were missing. `<glk-button disabled>` rendered exactly like an enabled button, with the pointer cursor and the hover lift; so did `<glk-pill>` and `<glk-tab-accessory>`, and `<glk-toggle>`, `<glk-checkbox>`, `<glk-radio>`, `<glk-textarea>` and `<glk-range>` showed no difference at all — `<glk-select>` was dimmed by Chrome's own stylesheet only. Now buttons, pill, accessory and the check controls dim to 0.45 with the not-allowed cursor and no hover effect, the fields to 0.4 like `<glk-input>`. Measured in Chromium and WebKit, opacity of the inner control with `disabled` on the element: 1 → 0.45 for button, pill, accessory, toggle, checkbox and radio, 1 (Chrome: 0.7 for the select) → 0.4 for select, textarea and range. The rules are part of GlassKit's component sheet, so they reach the shadow roots; the bundles carry that sheet and needed the rebuild. The disabled toggle and button on the showcase and the docs now look disabled. The peer dependency moves to `>=1.21.2`. ([GlassKit #7](https://github.com/JUNGHERZ/GlassKit/issues/7))

---

## [1.21.1] – 2026-10-05

### Fixed

- **Printed pages keep the state of the controls.** Rebuilt against GlassKit 1.21.1, whose print rule keeps the parts that carry a state in colour on paper — print dialogs leave out background graphics by default, and a checked `<glk-checkbox>` printed like an empty one, a `<glk-progress>` printed empty, the chosen day of `<glk-calendar>` paler than the others. The rule is part of GlassKit's component sheet, so it reaches the shadow roots; the bundles carry that sheet and needed the rebuild, the per-component files take it from the project's GlassKit. Measured in Chromium with `page.pdf()` without background graphics, inked pixels inside the indicator, on / off: `<glk-toggle>` 231 / 222 → 1025 / 226, `<glk-checkbox>` 87 / 79 → 511 / 79, `<glk-radio>` 75 / 67 → 383 / 67, the chosen `<glk-calendar>` day 42 → 1915 against 56 for another day; the `<glk-progress>` fill, the current `<glk-steps>` step and the calendar's tone dots now print. The peer dependency moves to `>=1.21.1`. ([GlassKit #6](https://github.com/JUNGHERZ/GlassKit/issues/6))

### Documentation

- README, SKILL.md and the docs (English and German) describe printing, with a `beforeprint` / `afterprint` snippet that prints a dark page in the light theme; the elements follow the switch in time for the print (checked in Chromium).

---

## [1.21.0] – 2026-10-05

Versions realign with GlassKit at 1.21.0, which this release needs (peer dependency `>=1.21.0`). Contributed as pull request [#10](https://github.com/JUNGHERZ/GlassKit-Elements/pull/10), the companion of GlassKit's [#5](https://github.com/JUNGHERZ/GlassKit/pull/5).

### Added

- **`data-density` on `<html>` reaches the elements, like `data-theme`.** GlassKit 1.21.0 turns the sizes of fields, buttons, toggles, checkboxes, radios, list rows and modal actions into density tokens, with `data-density="compact"` on `<html>` as a denser preset for admin screens, desktop layouts and narrow forms. The values arrive in every shadow root by inheritance — GlassKit puts the preset into `tokensCss`, which the elements place on the document in `@layer glasskit-defaults` — so a project's own density values (`[data-density='compact'] { --gl-btn-height: 36px; }`) reach the elements too; with `data-glk-defaults="off"` the preset comes from `glasskit.css` on the page, like every other token. The global `MutationObserver` now watches `data-density` next to `data-theme` and `data-glk-defaults` and mirrors it onto every element's `.glk-wrapper`: set when the wrapper is created, updated when `<html>` changes, removed when `<html>` has none. A rule keyed on the attribute — a GlassKit component rule, the `hostStyles` of a project's own `GlkElement` — therefore matches inside the shadow root, as it does for the theme. `GlkElement` gains `_syncDensity(density)` next to `_syncTheme(theme)`; the observer calls each only for the attribute that changed. The bundles are built against GlassKit 1.21.0 and carry its tokens; the per-component files use the GlassKit the project installs.

### Fixed

- **An element that was out of the document while the theme changed came back with the old theme on its wrapper.** The observer only reaches connected elements, and the wrapper took `data-theme` once, when it was created; an element removed and re-inserted after a theme switch — a cached view, a list a framework re-sorts — kept the old value. Since 1.20.0 that value also sets the wrapper's `color-scheme`, so such an element drew its native parts — a select's list, a date picker, scrollbars — in the other scheme. It now takes `data-theme` and `data-density` from `<html>` again whenever it is connected anew.

Verified in Chromium and WebKit (Playwright 1.63), the elements built against the GlassKit branch with the density tokens: without `data-density` every element measures as with 1.20.0, and the elements' index, showcase and docs (EN/DE) render pixel-identical, apart from regions that also differ between two renders of 1.20.0; with `data-density="compact"` on `<html>`, at load and switched at runtime, `<glk-input>`, `<glk-select>` and `<glk-search>` measure 40 px with 12 px inner padding, `<glk-button>` 40 / 32 / 48 px, `<glk-textarea>` 88 px, `<glk-list-item>` 48 px, `<glk-toggle>` 44 × 26 px with an 18 px thumb, `<glk-checkbox>` and `<glk-radio>` 20 px, the `<glk-modal>` actions 44 px — with and without `glasskit.css` on the page, left to right and right to left. Every wrapper carries `data-density="compact"` and loses it with `<html>`; an element created after the switch starts with it, one detached during the switch catches up when it is inserted again, its `color-scheme` included.

---

## [1.20.0] – 2026-10-05

Versions realign with GlassKit at 1.20.0, which this release needs (peer dependency `>=1.20.0`). The first batch of findings filed as GitHub issues, from a product that is adopting GlassKit at full depth — mostly accessibility and forms. Everything below was measured in Chromium and WebKit.

### Fixed

- **Importing the elements no longer turns the page dark.** The token defaults went onto the document with GlassKit's `color-scheme: dark` included, so on a page that does not use GlassKit's theme the whole document switched: `color-scheme` of `:root` and of every native control to `dark`, unstyled text from black to white, links from `rgb(0, 0, 238)` to `rgb(158, 158, 255)`. The injected layer now carries the `--gl-*` tokens only. Each element sets `color-scheme` on its own theme wrapper, following `data-theme`, so native parts inside it — a select's list, a date picker — still match the element. Measured on a white page without GlassKit CSS: scheme, text and link colour stay as they were; the select inside `<glk-select>` is `dark`, under `data-theme="light"` `light`. **New:** `<html data-glk-defaults="off">` switches the defaults off, for a page that declares the tokens itself or wants them on part of the page only; the attribute is watched, so it may also be set or removed later. Until now the only way was the internal flag meant to detect duplicate bundles. Compatibility: a page that counted on the elements to make it dark sets `color-scheme` itself, or loads `glasskit.css`, whose token blocks set it. ([#1](https://github.com/JUNGHERZ/glasskit-elements/issues/1))
- **Form fields have accessible names, and focus reaches them.** The `<label>` of `<glk-input>`, `<glk-select>`, `<glk-textarea>` and `<glk-range>` sat next to the field without `for`, so the field had no name — with a placeholder, screen readers announced only that — and a click on the label text did nothing. Label and field are tied by id inside the shadow root now: `textbox "Vorname"`, `combobox "Land"`, `slider "Lautstärke"`. The `hint` of `<glk-input>` describes the field (`aria-describedby`), and `error` marks it `aria-invalid`. `<glk-search>`, which has no visible label, takes `label` as its accessible name. Form elements with one field open their shadow root with `delegatesFocus`, so `element.focus()`, a click on the label text and a click on a `<label for>` naming the element all land in the field. `<glk-segmented>` and `<glk-calendar>` keep it off: their first button is not the chosen one, and Tab already reaches the chosen one. An outer `<label for>` focuses the field but cannot name it across the shadow boundary — use `label` for the name. ([#2](https://github.com/JUNGHERZ/glasskit-elements/issues/2))
- **The form learns whether the fields are valid.** `GlkFormElement` had a `setValidity()` that nothing called, so an empty `required` field counted as valid: `form.checkValidity()` returned `true` and `requestSubmit()` sent the form. Every element built on one native field now copies that field's verdict onto the host after each change — value, attribute, reset — with the field as anchor, so the browser's bubble points at it and `reportValidity()` focuses it. `required`, `pattern`, `min`/`max`, `minlength`/`maxlength`, `type="email"` and the like stop a submit with the browser's own message; `validity`, `validationMessage`, `willValidate`, `checkValidity()` and `reportValidity()` answer on the element. `<glk-checkbox>`, `<glk-toggle>` and `<glk-radio>` gain `required`, radios by the native rule: one required radio makes its group required, any checked one satisfies it. `<glk-textarea>` and `<glk-select>` now also follow a `required` set after they rendered. A disabled field is barred from validation, as natively. `error` stays a marker and does not block — a server's verdict arrives that way, and it must not stop the next attempt. Measured: empty required fields make `checkValidity()` false, `requestSubmit()` sends nothing, `reportValidity()` focuses the first field; "nope" in a `type="email"` field is a `typeMismatch`; checking the second radio of a required group makes both valid; `form.reset()` validates again. ([#3](https://github.com/JUNGHERZ/glasskit-elements/issues/3))
- **`<glk-button type="submit">` submits its form, `type="reset"` resets it.** The native button lives in the shadow root, outside every form, so both types only emitted `glk-click`. The element is form-associated now and acts on its form once the click has finished bubbling — `preventDefault()` on the click stops it, as on a native button. Invalid fields stop the submit with the browser's message; the submit event names the element as its `submitter`; `form` and `type` are properties; `element.click()` acts like a click. Measured: one submit with complete `FormData` and the element as `submitter`, none after `preventDefault()`, one from `element.click()`; reset restores values and validity. Not covered: implicit submission — Enter in a `<glk-input>` does not submit the form. Compatibility: a form whose `<glk-button type="submit">` did its work in a `glk-click` handler now also submits for real — without a `submit` listener that calls `preventDefault()`, the browser sends the form and loads the page again. Handle `submit` instead, or drop `type="submit"`. ([#4](https://github.com/JUNGHERZ/glasskit-elements/issues/4))
- **`<glk-modal>` is a native dialog.** It had no dialog role, the focus stayed behind it, Tab walked through the page before it reached the modal's buttons, and its content was reachable while it was closed. The overlay is a `<dialog>` now, opened with `showModal()`: top layer, the page behind it inert for pointer, keyboard and screen readers, focus moving in and back to the opener on closing, named by its title (`aria-labelledby`), the content out of reach while closed. The fade stays — Escape arrives as the dialog's `cancel`, and the element turns it into the same animated close as a click on the dimmed area; both emit `glk-close`. The browsers pick the first focus differently, Chrome the first field of the content, Safari the first action; `autofocus` on an element in the content or on an action settles it. Moved while open, it opens as a modal again. Measured: `:modal` matches, `dialog "Eintrag löschen?"`, Tab cycles inside, a point over the page hits the overlay, Escape emits `glk-close` once and returns the focus to the opener. Compatibility: everything outside an open modal is inert — a `<glk-toast>` shown while it is open is neither clickable nor announced (moved into the top layer as a popover, it stays inert too; measured), so give feedback inside the modal or close it first; a `<glk-sheet>` opened from an open modal ends up behind it. ([#5](https://github.com/JUNGHERZ/glasskit-elements/issues/5))
- **`<glk-toggle>` is one switch, and clicks aimed at the element work.** The host carried `role="switch"` and `aria-checked` with a focusable native checkbox inside, so screen readers met a switch that contained a checkbox. The role moved onto the checkbox; the host carries no `role`, `aria-checked` or `aria-disabled` any more, and the tree shows `switch "Benachrichtigungen"`, nothing else. `toggle.click()` changed nothing, where a native checkbox toggles — and a `<label>` around the element or naming it clicks the host, too. A click aimed at the host itself is now handed to the input and the original stopped, so listeners see one click and one change; the same holds for `<glk-checkbox>`, `<glk-radio>` and `<glk-button>`. A press on the host's empty width (it is a block, the control narrower) still does nothing: Chrome gives a label's click the same `detail` and `isTrusted` as a real one, so the two are told apart by where the pointer went down. With GlassKit 1.20.0 the input lies on top of the track, so Playwright's `getByRole('switch').click()`, `check()` and `uncheck()` reach it instead of timing out on the covering track — `getByRole('checkbox')` and `getByRole('radio')` gain the same. Compatibility: CSS or tests that select `glk-toggle[aria-checked]` or `[role="switch"]` on the host use `glk-toggle[checked]` now. ([#6](https://github.com/JUNGHERZ/glasskit-elements/issues/6))
- **Accordion and popover triggers say whether they are open.** The accordion trigger carries `aria-expanded` and `aria-controls` now, and a closed section is `inert`: before, it was only squeezed to zero height, so Tab still walked into its links and screen readers read them. `<glk-popover>` sets `aria-expanded` on its trigger, again whenever the trigger is swapped; `<glk-button>` and `<glk-pill>` hand `aria-expanded`, `aria-haspopup` and `aria-pressed` on to their native button. Measured: `button "Abschnitt 1" [expanded=false]`, the closed section's link takes no focus and is missing from Chromium's accessibility tree, `button "Menü" [expanded]` while the popover is open. ([#7](https://github.com/JUNGHERZ/glasskit-elements/issues/7))
- **A toggle without label is as large as its track.** The host measured 64 × 34 px around a 52 × 30 track: the empty label kept its 12 px gap (GlassKit 1.20.0 hides an empty label), and the inline control sat on the text baseline with room for descenders below it — in a centred row the track sat 2 px high. The control aligns to the top of its line now: 52 × 30, centred at 9 px in a 48 px row. `<glk-checkbox>` and `<glk-radio>` lose the same descender room. Compatibility: stacked toggles, checkboxes and radios move closer — on the docs page a labelled toggle shrinks from 37.6 to 30 px, a checkbox from 27.4 to 25.6 px. ([#8](https://github.com/JUNGHERZ/glasskit-elements/issues/8))

### Changed

- **With GlassKit 1.20.0** the elements also get its fixes: `<glk-list-item>` without an icon no longer keeps 28 px for it — title at 20 px, row 56 instead of 60 px, divider from 20 px ([GlassKit #4](https://github.com/JUNGHERZ/GlassKit/issues/4)); the select's chevron is visible in the light theme ([GlassKit #1](https://github.com/JUNGHERZ/GlassKit/issues/1)); under `dir="rtl"` the elements mirror ([GlassKit #2](https://github.com/JUNGHERZ/GlassKit/issues/2)); `--gl-modal-max-width` widens `<glk-modal>` ([GlassKit #3](https://github.com/JUNGHERZ/GlassKit/issues/3)).

### Documentation

- **Component count and browser support in the README.** The badge said 33 components, the intro 29, the docs pages 29 and 33; the package ships 36 elements, as SKILL.md and the landing pages already said — now all of them do. Browser support named Chrome 90 and Firefox 103, but GlassKit's tokens are derived with `color-mix()`: the floor is Chrome and Edge 111, Safari 16.4, Firefox 113, and what the elements need themselves — constructable stylesheets, `ElementInternals`, `delegatesFocus`, `<dialog>`, `inert` — falls inside it. The refinements that come later are named. ([#9](https://github.com/JUNGHERZ/glasskit-elements/issues/9))
- Docs (English and German), README and SKILL.md describe validity, labels and focus, submit buttons, the dialog and its effect on toasts, the switch role, the triggers' states and the opt-out from the token defaults.

---

## [1.19.2] – 2026-09-26

### Fixed

- **`<glk-date-strip>` and `<glk-calendar>` name days in the page's language, not the browser's.** Without `locale` they went straight to `navigator.language`, so a German page opened on a phone set to English showed "SUN MON TUE" in the strip and started the calendar on Sunday — next to German text everywhere else. They now take the `lang` of the nearest ancestor, usually `<html lang>`, looked up across shadow roots through their hosts, so an element inside another component's shadow tree — a hybrids view, say — reaches the page's language, and a `<section lang="en">` in a German page stays English. Only without any `lang` does the browser language follow, then English; an empty `lang=""` means "unknown" in HTML and falls through to the browser. `locale` still wins over all of it. The page language decides weekday and month names, the chips' and days' `aria-label`s and the calendar's first day of the week. Measured in Chromium and WebKit with an `en-US` browser on `<html lang="de">`: "So Mo Di" and "Sonntag, 27. September 2026" instead of "Sun Mon Tue" and "Sunday, September 27, 2026", the calendar starts on Monday; a page without `lang` looks as before. Compatibility: a page whose `lang` differs from its visitors' browsers now shows its own language in these two elements — set `locale` to keep another. NotionKit Elements falls back to `<html lang>` since 1.17; this looks at the nearest ancestor instead. (EhrenPfoten, Elements finding 10.)

---

## [1.19.1] – 2026-09-26

### Fixed

- **The package carries `SKILL.md` and `CHANGELOG.md`.** `files` in package.json listed `dist/`, `src/` and `LICENSE` only, so no release up to 1.19.0 had them — an agent that reads `SKILL.md` from `node_modules`, or a developer looking up what changed, found nothing there and had to go to GitHub. The same gap NotionKit Elements closed in its 1.11.1; the question came up there.
- **Rebuilt against GlassKit 1.19.1**, whose `glasskit-styles.js` no longer embeds the `sourceMappingURL` comment of the minified sheet: all three bundles carried it inside their CSS text, where it pointed at a map that does not exist next to them. The peer dependency moves to `>=1.19.1`; no element changed.

### Added

- **`npm run check:package`, in CI and before every publish.** The release workflow runs it before it publishes, so a package that misses a file it points to no longer goes out; it reads the output of npm 10 and npm 12 alike (npm 12, which the release workflow installs, prints an object keyed by package name instead of a list). It packs the package without publishing and fails when an entry point of package.json (`main`, `module`, every `exports` target and pattern), `README.md`, `LICENSE`, `CHANGELOG.md`, `SKILL.md` or a source map named by a shipped file is missing — run against 1.19.0 it reports exactly the two missing documents and the three embedded map comments.

---

## [1.19.0] – 2026-09-26

Versions realign with GlassKit at 1.19.0.

### Added

- **`<glk-toast>` can offer something: a button and an ×.** It took `message`, `variant`, `duration` and `visible`; with `duration="0"` it stayed, but only code could close it, and there was no button — an offer like "A new version · Reload" had to live in a banner in the page. Now: `action-label` and `action-value`, or `show(message, { action: { label, value } })`, add GlassKit's `.glass-toast__action`, and with it an × (`.glass-toast__close`, named by `close-label`, "Close" by default); `dismissible` gives the × alone. A toast with an action stays until one of them is used, unless a `duration` is set, and it does not time out while the pointer or the focus is on it. The action emits `glk-action { action, label }` and closes the toast — unless a listener calls `preventDefault()`, or shows the next message from the handler ("Undo" → `show('Restored')`), both of which keep it up; the × and Escape emit `glk-close`; running out of time still emits `glk-dismiss`. `show()` keeps its old signature and gains an options form, `show(message, { variant, duration, action, dismissible })`: keys that are left out keep their attribute, except `action` — a message without one shows no button. The same shape as NotionKit Elements 1.19, with `glk-` names. (EhrenPfoten, Elements finding 9.)

- **An `icon` slot on `<glk-toast>`** replaces the built-in icon — an offer to reload wants a refresh icon, not the success check a toast without a variant shows. Leave the slotted icon's stroke unset and it takes the variant colour.

- **The toast is a live region.** `role="status"` and `aria-live="polite"` on the toast, so the message is announced; it was silent before. While hidden, its buttons are inert; closing it from the keyboard hands the focus back to where it came from.

- **`emit(name, detail, { cancelable: true })`** on `GlkElement` — the event can be cancelled with `preventDefault()`, and `emit()` returns `false` then. Without the option nothing changes.

### Fixed

- **The toast's icon never took the variant colour.** The built-in icons carried `stroke="currentColor"`, which wins over the colour GlassKit sets on `.glass-toast__icon`, so success, error and warning toasts all showed a white icon — unlike the CSS toast. The icons now inherit their stroke: green, red, yellow.
- **Changing `variant` on a visible toast hid it.** The class list was rebuilt without `is-visible` while the `visible` attribute stayed.
- **A second `show()` while the toast was up did not restart its timer**, so the second message disappeared early — at 400 ms, a second `show(…, 600)` was gone 200 ms later. It now runs its full duration.
- Rebuilt against GlassKit 1.19.0; the peer dependency moves to `>=1.19.0`.

Verified in Chromium and WebKit: the old `show(message, variant, duration)` still hides after its duration and emits `glk-dismiss`; an offer is still up after 3.5 s; the action emits `glk-action { action: "reload" }` and closes; `preventDefault()` and a `show()` in the handler keep the toast up; × and Escape emit `glk-close`, and Escape hands the focus back; a toast with a 600 ms duration is still up after 900 ms under the pointer and hides 600 ms after the pointer leaves; hidden buttons refuse focus; on a 390 px phone the offer is 358 px wide with both buttons inside.

---

## [1.18.0] – 2026-09-23

Versions realign with GlassKit at 1.18.0.

### Added

- **`<glk-badge variant="warning">`.** The element accepted `primary`, `success` and `error` and turned every other value into the neutral badge without a word, so `variant="warning"` — a state that waits for someone, like a booking still to be assigned — looked exactly like a cancelled one. It now maps to GlassKit 1.18.0's `.glass-badge--warning`, with its own tinted fill, border and text, and works with `interactive` and `selected`: a selected warning chip deepens its own yellow. A value outside the four still falls back to the neutral badge, as an unknown value of an enumerated attribute does. Rebuilt against GlassKit 1.18.0; the peer dependency moves to `>=1.18.0`. (EhrenPfoten, Elements finding 8.)

---

## [1.17.0] – 2026-09-22

Versions realign with GlassKit at 1.17.0.

### Added

- **`<glk-segmented overflow="scroll" | "wrap">` for more options than fit.** Seven areas in `<glk-segmented full>` did not fit on a phone: the row ran past its edge and the last area could not be reached. `overflow="scroll"` keeps one row that scrolls sideways (GlassKit's `.glass-segmented--scroll`, scrollbar hidden) and keeps the chosen option in view — centred in the row after the first layout, on every value change and when the row's width changes, through the row's own scrolling, so the page never moves; a value change glides unless reduced motion is asked for, a change of size snaps. `overflow="wrap"` breaks the row into lines (`--wrap`). Without the attribute the row stays one line, as before. Deviation from the proposal, which had two booleans `scroll` and `wrap`: `scroll` is a method of every element, and a framework that sets a property whenever the element has one — hybrids 9 checks `name in element`, Vue and React 19 do the same — would overwrite the method instead of setting the attribute, so `scroll="${…}"` would silently do nothing; one enumerated `overflow` also rules out asking for both at once. Verified in Chromium and WebKit, LTR and RTL: with the seventh option chosen it is visible after load; picking the first scrolls back to the start; `.value = 'd'` centres the fourth to the pixel; the page's scroll position never changes; keyboard focus scrolls the focused option into view. (EhrenPfoten, Elements finding 7.)

### Fixed

- **`<glk-input>` did not pass `min`, `max` and `step` to its field.** The element observed nine attributes, and `min`, `max`, `step`, `minlength`, `maxlength`, `pattern`, `autocomplete` and `inputmode` on the host never reached the inner `<input>` — a date field with `min` set to today still offered every past day in its picker. All eight are now handed down unchanged when present and removed when they go. The inner field's validity is still not reported to the surrounding form: like `required`, `pattern` and `min` constrain the field and its picker but do not block a submit. (EhrenPfoten, Elements finding 6.)

- **Rebuilt against GlassKit 1.17.0**, which the elements bundle: `<glk-input type="date">` (and `time`, `datetime-local`, `month`) keeps its column width on iOS — measured in the iOS 26.3 and 27.0 simulators at 402 px, the field sat 35 px past its column before and flush after, with the value at the start like every other field; several buttons in `<glk-empty>`'s `action` slot stand side by side with an 8 px gap instead of touching. The peer dependency moves to `>=1.17.0`.

### Changed

- `<glk-date-strip>` and `<glk-segmented>` share one helper for centring the chosen item (`src/reveal.js`, a shared chunk of the per-component build). It scrolls by a relative distance, so the strip now also centres in right-to-left layouts, where the absolute `scrollLeft` it used before runs negative.

---

## [1.16.1] – 2026-09-22

### Fixed

- **`title` on the elements that take a heading showed as a browser tooltip.** `<glk-sheet>`, `<glk-modal>`, `<glk-list-item>`, `<glk-accordion-item>` and `<glk-empty>` take their heading as `title` — which is also the global HTML attribute, so hovering a sheet floated its heading over the form, and a list showed a tooltip on every row. The elements now read the attribute and take it off the host (`GlkElement.takeTitle()`): a later `setAttribute('title', …)` is consumed the same way, `el.title` answers from the stored value and setting it never touches the attribute, and a framework that binds `title` as a property — hybrids, lit's `.title` — never puts one on the host at all. The API is unchanged, `title="…"` stays the documented attribute; what changes is that `getAttribute('title')` returns `null` after upgrade. Every other element keeps the native `title` tooltip. The proposal was a new `heading` attribute with `title` removed after reading; the second half is what happened, the first would have given one thing two names across five elements. (EhrenPfoten, Elements finding 5.)

---

## [1.16.0] – 2026-09-22

### Added

- **Three elements from EhrenPfoten: `<glk-date-strip>`, `<glk-calendar>`, `<glk-image-picker>`.** The ones that waited until real data had settled their attributes — the strip and the calendar run in booking (29-day horizon), in the team's day view and for schedule exceptions, the picker in the dog and profile photo upload. Built there as `GlkElement` subclasses by the rules in SKILL.md and reviewed here class by class. They arrive as copies with what the project proposed from the field, plus the deviations named below, which the project mirrors. Needs GlassKit 1.16.0 for the three CSS blocks; the peer dependency moves to `>=1.16.0`.

  `<glk-date-strip>` (navigation): `start`, `days`, `value`, `today`, `marks`, plus `locale` and `label`. Against the project's element: the chips are a `role="group"` of `aria-pressed` buttons like `<glk-segmented>`, not a `role="listbox"` — `aria-pressed` on a `role="option"` is invalid, and the CSS hangs on `aria-pressed`; every chip is named with its full date from `Intl` ("Sonntag, 11. Oktober 2026") instead of the visible "So 11"; weekday names come from `Intl.DateTimeFormat` for the `locale` (the browser language by default) — the German constants are gone, and so is the German `aria-label`: `label` sets one, there is none without it; the strip is one tab stop with arrow keys, Home and End, where 29 chips were 29 tab stops; the chosen chip is centred in the strip after the first layout and on every value change, computed from client rects and applied to the strip's own `scrollLeft` (`scrollIntoView` would scroll every ancestor, the page included) and re-centred when the strip's width changes — a parent that upgrades later and adds its padding, a resize; `marks` takes a tone (`primary` / `success` / `warning` / `error`) or `{ tone, disabled }`, where `disabled` makes the chip unpickable — the project's `closed` becomes `{ "tone": "error", "disabled": true }`, or just `"error"` when a closed day should stay tappable; `glk-change` only on an actual change.

  `<glk-calendar>` (forms): `month`, `value`, `today`, `marks`, plus `min`, `max`, `locale`, `week-start`, `label`, `prev-label`, `next-label` and `name`. Against the project's element: arrows only move focus and Enter or Space picks — the APG grid pattern — so a calendar that opens a sheet on every pick stays quiet while the user looks around, where the project's version picked on every arrow step; `min`/`max` mark days outside as `aria-disabled="true"`: in the arrow path and announced, never picked and never in `glk-change` — `disabled` would have taken them out of the arrow path, since a disabled button cannot take focus; the days are a `role="group"`, not `role="grid"` (a grid demands rows and cells with `aria-selected`); PageUp/PageDown move by a month, Home/End to the ends of the week; month title and weekday names come from `Intl`, and so does the first day of the week (`Intl.Locale.prototype.getWeekInfo()`, Monday where a browser cannot say, `week-start` overrides) — the German constants and labels are gone, `prev-label` / `next-label` default to English; the nav buttons carry SVG chevrons; the title is `aria-live="polite"`, so a new month is announced; a value set to another month flips the calendar there, also when `month` was set; form-associated like every other element in the forms group (`name`, `setFormValue`, reset restores the initial value); `glk-change` only on an actual change — a project that reopens a sheet by picking the same day again clears `value` when the sheet closes.

  `<glk-image-picker>` (forms) — the project's photo picker, renamed with its CSS block because it takes any image: `src`, `label`, `round`, `max`, plus `hint`, `type`, `quality`, `accept`, `choose-label`, `change-label`, `remove-label`. Against the project's element: Choose is a real `<button>` that opens the hidden file input — the project's `<label>` around a hidden input could not be reached by keyboard at all; a file the browser cannot decode (Chrome and HEIC, a corrupt file) emits `glk-error { message, name }`, where the project's version rejected silently; the remove button is really hidden — `hidden` on a `.glass-btn` lost to its `display: flex` until GlassKit 1.16.0, which is why the project's picker shows Remove without an image; after remove, focus moves to Choose instead of falling off the vanished button; the German texts are gone, and there is no default hint at all, since what is accepted depends on `accept` and on the browser; a JPEG is drawn on white first, so a transparent PNG does not come out on black; `size` counts the base64 payload without prefix and padding; `label` names the group (`aria-labelledby`), `hint` describes it. Not form-associated, as proposed: the form value would be either the original file, which is not what gets uploaded, or a data URL of megabytes. The `glk-file` with a preview slot that the plan foresaw does not exist; this element is the answer to that need.

  Verified in Chromium and WebKit: 29 chips with a deep link to the 20th day — the chosen chip inside the strip's visible range, centred to the pixel, page scroll unchanged; arrows on the calendar from 22 September across the month's edge to 7 October emit one `glk-month`, Enter on a `min`-blocked day emits nothing, Enter on the 23rd emits `glk-change`; a 200 × 100 JPEG with EXIF orientation 6 comes out 100 × 200 with the left half on top; `max="50"` on the same file gives 25 × 50; a bogus `.heic` emits `glk-error`; `FormData` carries the calendar's value and reset restores it.

  Shared code: `src/dates.js` (ISO dates, `Intl` formatters, first weekday) becomes a shared chunk of the per-component build, `dist/components/shared/dates-<hash>.js`; the full bundles inline it.

---

## [1.15.2] – 2026-09-21

### Fixed

- **`<glk-card fill>` grew past its grid cell with content that cannot wrap.** `fill` makes the host a grid so the inner `.glass-card` stretches to the cell — which also makes the card a grid item, and a grid item's `min-width: auto` is its min-content width. A nowrap `<glk-list-item>` subtitle therefore widened the card past its cell instead of getting its ellipsis: in a `repeat(auto-fit, minmax(300px, 1fr))` grid at 1100 px the host measured 522 px and the card 888 px, 366 px over the cell and across the neighbour; without `fill` the ellipsis worked. The card and the host now carry `min-width: 0`, so both yield to the cell and the subtitle truncates — the host part matters in `1fr` tracks and flex rows, where the host itself refused to shrink. The card also gets `min-height: 0`: in a cell of fixed height a scrollable child inside the card now shrinks and scrolls instead of the card running 250 px past the cell. Measured in Chromium and WebKit: card 522 px in the `minmax` grid, in a `1fr 1fr` grid and in a flex row; equal heights across a row unchanged; a plain `<glk-card>` unchanged. Compatibility: content that can neither wrap nor shrink now overflows the card's edge instead of pushing the card out of its cell, which is the trade-off `min-width: 0` always makes; a `glk-card[fill]::part(card) { min-width: 0 }` workaround can go. A plain `<glk-card>` keeps `min-width: auto` like any block — set `min-width: 0` on it yourself when it holds nowrap content in a `1fr` track. (EhrenPfoten, Elements finding 4.)

---

## [1.15.1] – 2026-09-21

### Fixed

- **Rebuilt against GlassKit 1.15.1.** The elements bundle GlassKit's stylesheet, so two CSS fixes need a new build to reach them: `<glk-sheet>` is readable in dark mode (it had a light milk surface under white text), and a `<glk-sheet>` or `<glk-modal>` overlay now paints above a `<glk-tab-bar>` when both sit inside `.glass-bg` — `.glass-bg` no longer turns each of its children into a stacking context that trapped the overlay below the bar. No element changed; the peer dependency moves to `>=1.15.1`.

---

## [1.15.0] – 2026-09-21

Version numbers stay in step with GlassKit CSS at 1.15.0.

### Added

- **Four elements from EhrenPfoten: `<glk-segmented>`, `<glk-steps>`, `<glk-sheet>`, `<glk-empty>`.** Built there as `GlkElement` subclasses by the rules in SKILL.md and reviewed here class by class. They arrive as copies with these deviations, which the project mirrors: no German defaults — `label` on `<glk-segmented>` and `<glk-steps>` sets the `aria-label` and there is none without it; `aria-current` only on the current step, not `"false"` on the others; the done check is an SVG, not a text glyph; tones are `success` / `warning` / `error`; `full` and `label` changes no longer rebuild the buttons. `<glk-segmented>` is form-associated (`name`, `setFormValue`, reset restores the initial value), like every other element in the forms group.

  `<glk-sheet>` is the mobile sibling of `<glk-modal>` with the same API shape (`open`, `title`, `show()`, `close()`, `glk-close` only on a user close). It hides its overlay after `transitionend` (fallback 400 ms, immediate under reduced motion), so the blurred layer leaves the layout instead of idling at opacity 0 — `<glk-modal>` still keeps its overlay in the layout with `pointer-events: none`; giving it the same mechanic is a follow-up, not part of this release.

  Documented on the docs and showcase pages in both languages with live demos, in README and SKILL.md. Requires GlassKit 1.15.0 for the four CSS blocks; the peer dependency moves to `>=1.15.0`. All 29 existing elements, attributes and events are unchanged.

### Changed

- **The per-component files no longer inline the GlassKit stylesheet.** `dist/components/base.js` carried `componentsSheet` and `tokensCss` from `@jungherz-de/glasskit/glasskit-styles.js` compiled in — 61 KB, and a second copy of the sheet next to the one an import-map project already loads for its own elements (EhrenPfoten, finding 3). The per-component build now leaves `@jungherz-de/glasskit/glasskit-styles.js` as an external import: a bundler resolves it from `node_modules`, a build-free project adds one import-map entry, and either way the sheet exists once. `base.js` shrinks to about 8 KB. The full bundles keep inlining it — a `<script>` tag has nothing to resolve against.

  Documented alongside: never mix the bundle with `base.js`. The bundle carries its own copy of `GlkElement`, so a subclass built on `base.js` next to it is a different class and `instanceof` fails across the two — with the bundle, take `GlassKitElements.GlkElement` or the ESM bundle's export.

---

## [1.14.0] – 2026-09-20

Version numbers realign with GlassKit CSS at 1.14.0.

### Added

- **`GlkElement` and `GlkFormElement` are exported.** A project that wanted to build its own elements on the same base — lifecycle, adopted GlassKit stylesheet, theme sync, `emit()` — could not: the bundle exported the 29 component classes and nothing else. EhrenPfoten had to wrap its own elements in a different library, and every one of them that later flows back here would have to be rewritten instead of moved.

  The classes are now reachable three ways: `import { GlkElement, GlkFormElement } from '@jungherz-de/glasskit-elements'` from the bundle; `from '@jungherz-de/glasskit-elements/base.js'` for per-component setups; and `GlassKitElements.GlkElement` from the CDN `<script>` bundle.

- **`dist/components/base.js` is a stable entry, not a hashed chunk.** `base.js` used to land in `dist/components/shared/base-<hash>.js`, a name that changed with every build and could not be imported on purpose. It is now an entry of the per-component build; Rollup never duplicates an entry module, so `glk-button.js` and a project's subclass import the same file and `instanceof GlkElement` holds across both. The `./base.js` export in `package.json` points at it.

  Documented with a live `<demo-counter>` on the docs and showcase pages (both languages) and in SKILL.md, including the rules a subclass has to follow.

### Changed

- **Requires GlassKit 1.14.0.** It ships `.glass-skeleton`, `.glass-table` and `.glass-prose`. All three are document-level blocks — from a shadow root, `::slotted()` cannot reach a table's cells or a Markdown paragraph — so no element wraps them; put the class on the light-DOM element. The peer dependency moves to `>=1.14.0`.

---

## [1.13.0] – 2026-09-20

### Added

- **`<glk-badge interactive selected>` — the badge as a filter chip.** A badge was already being used as a chip in the wild — a status row where one entry is picked — but the element offered nothing for it. Projects marked the chosen chip with `variant="primary"` and bolted an `onclick` onto the host, which worked with a mouse and nowhere else: no focus ring, no keyboard, nothing announced.

  `interactive` renders the badge as a real `<button type="button">` instead of a `<span>`, so the keyboard, the focus ring and the click semantics come from the platform rather than from a re-implementation. `selected` marks the chip that is on and is mirrored to `aria-pressed`, so a screen reader announces the row as a group of toggles. Both are reflected as properties.

  ```html
  <div id="filter">
    <glk-badge interactive selected>Active</glk-badge>
    <glk-badge interactive>Applied</glk-badge>
  </div>
  <script>
    filter.addEventListener('glk-click', e => {
      for (const chip of filter.querySelectorAll('glk-badge')) chip.selected = chip === e.target;
    });
  </script>
  ```

  `glk-click` fires only while `interactive` is set — the same rule `<glk-list-item>` follows. Toggling `interactive` at runtime swaps the inner element; the slot moves across, so the slotted label never has to be re-assigned.

### Changed

- **Requires GlassKit 1.12.0.** The chip states are painted by `.glass-badge--interactive` and `.glass-badge--selected`, which arrived in GlassKit CSS 1.12.0 — a selected chip deepens the colour the badge already has, so `variant="success"` stays green when picked. The peer dependency moves to `>=1.12.0`; on an older stylesheet the button renders, but without hover, focus ring or selection tint.

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

[Unreleased]: https://github.com/JUNGHERZ/GlassKit-Elements/compare/v1.33.1...HEAD
[1.36.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.36.0
[1.35.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.35.0
[1.34.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.34.0
[1.33.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.33.2
[1.33.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.33.1
[1.33.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.33.0
[1.32.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.32.0
[1.31.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.31.0
[1.30.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.30.0
[1.29.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.29.1
[1.29.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.29.0
[1.28.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.28.1
[1.28.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.28.0
[1.27.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.27.0
[1.26.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.26.0
[1.25.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.25.0
[1.24.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.24.0
[1.23.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.23.0
[1.22.3]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.22.3
[1.22.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.22.2
[1.22.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.22.1
[1.22.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.22.0
[1.21.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.21.2
[1.21.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.21.1
[1.21.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.21.0
[1.20.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.20.0
[1.19.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.19.2
[1.19.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.19.1
[1.19.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.19.0
[1.18.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.18.0
[1.17.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.17.0
[1.16.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.16.1
[1.16.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.16.0
[1.15.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.15.2
[1.15.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.15.1
[1.15.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.15.0
[1.14.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.14.0
[1.13.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.13.0
[1.12.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.12.0
[1.11.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.11.0
[1.10.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.10.0
[1.9.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.9.0
[1.8.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.8.0
[1.7.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.7.0
[1.6.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.6.2
[1.6.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.6.1
[1.6.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.6.0
[1.5.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v1.5.0
[0.9.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.9.0
[0.8.3]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.3
[0.8.2]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.2
[0.8.1]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.1
[0.8.0]: https://github.com/JUNGHERZ/GlassKit-Elements/releases/tag/v0.8.0
