# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **`data-density` on `<html>` reaches the elements, like `data-theme`.** GlassKit 1.21.0 turns the sizes of fields, buttons, toggles, checkboxes, radios, list rows and modal actions into density tokens, with `data-density="compact"` on `<html>` as a denser preset for admin screens, desktop layouts and narrow forms. The values arrive in every shadow root by inheritance — GlassKit puts the preset into `tokensCss`, which the elements place on the document in `@layer glasskit-defaults` — so a project's own density values (`[data-density='compact'] { --gl-btn-height: 36px; }`) reach the elements too; with `data-glk-defaults="off"` the preset comes from `glasskit.css` on the page, like every other token. The global `MutationObserver` now watches `data-density` next to `data-theme` and `data-glk-defaults` and mirrors it onto every element's `.glk-wrapper`: set when the wrapper is created, updated when `<html>` changes, removed when `<html>` has none. A rule keyed on the attribute — a GlassKit component rule, the `hostStyles` of a project's own `GlkElement` — therefore matches inside the shadow root, as it does for the theme. `GlkElement` gains `_syncDensity(density)` next to `_syncTheme(theme)`; the observer calls each only for the attribute that changed. The compact sizes need GlassKit 1.21.0: the bundles carry the GlassKit sheet they were built against, which in `dist/` is still the lockfile's 1.20.0 — rebuilt against 1.21.0, they bring the tokens along; the per-component files use the GlassKit the project installs.

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

[Unreleased]: https://github.com/JUNGHERZ/GlassKit-Elements/compare/v1.20.0...HEAD
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
