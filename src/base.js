import { componentsSheet, tokensCss } from '@jungherz-de/glasskit/glasskit-styles.js';

// ── Design Tokens ──
// The shadow roots deliberately adopt the *components* sheet only. Adopting
// the full GlassKit sheet would bring its [data-theme] blocks along, and those
// match the .glk-wrapper below — the tokens would then be re-declared inside
// every shadow root, where a matching rule always beats an inherited value.
// A project's own `:root { --gl-color-primary: … }` would never arrive.
//
// So the token defaults go on the document once, and every shadow root
// inherits them like any other custom property. They are wrapped in a cascade
// layer so an ordinary (unlayered) brand stylesheet wins over them, no matter
// whether it loads before or after this module.
//
// Only the custom properties go there. GlassKit's token blocks also set
// color-scheme, and on the document that is no default: it switches the whole
// page to dark — native controls, scrollbars, the root text colour, link
// colours — on pages that never asked for GlassKit's theme. The elements set
// color-scheme on their own theme wrapper instead (host sheet below).
//
// The --gl-* names themselves are still global. A page that declares them
// itself, or wants them on part of the page only, switches the defaults off
// with <html data-glk-defaults="off">. The attribute is watched, so it may
// also be set or removed later.

const TOKENS_INJECTED = '__glkDefaultTokensInjected';
const DEFAULTS_ATTR = 'data-glk-defaults';
let defaultTokensSheet = null;

function injectDefaultTokens() {
  if (typeof document === 'undefined') return;              // SSR / non-DOM
  if (globalThis[TOKENS_INJECTED]) return;                   // another bundle copy did it
  globalThis[TOKENS_INJECTED] = true;

  const tokens = tokensCss.replace(/color-scheme\s*:[^;}]*;?/g, '');
  defaultTokensSheet = new CSSStyleSheet();
  defaultTokensSheet.replaceSync(`@layer glasskit-defaults { ${tokens} }`);
  syncDefaultTokens();
}

/** Adopts or drops the default tokens to match <html data-glk-defaults>. */
function syncDefaultTokens() {
  if (!defaultTokensSheet) return;
  const wanted = document.documentElement.getAttribute(DEFAULTS_ATTR) !== 'off';
  const sheets = document.adoptedStyleSheets;
  if (wanted === sheets.includes(defaultTokensSheet)) return;
  // Add or remove only this sheet — never assign a fresh list — so an app's
  // own adopted sheets survive.
  document.adoptedStyleSheets = wanted
    ? [...sheets, defaultTokensSheet]
    : sheets.filter(sheet => sheet !== defaultTokensSheet);
}

injectDefaultTokens();

// ── Global Theme, Density & Surface Sync ──
// Single MutationObserver that watches data-theme, data-density and
// data-surface on <html> and notifies all GlkElement instances.
//
// The density and surface tokens themselves arrive from <html> by
// inheritance, like every other token: GlassKit's [data-density="compact"]
// and [data-surface="solid"] presets are part of tokensCss, not of the
// components sheet. The wrapper mirrors the attributes anyway, as it mirrors
// data-theme — a rule keyed on one (a component rule, a subclass's
// hostStyles) can match inside a shadow root only on an element there.

const instances = new Set();

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

/** The density on <html>, or null — there is no default to fall back to. */
function getCurrentDensity() {
  return document.documentElement.getAttribute('data-density');
}

/** The surface preset on <html> (since 1.24.0), or null, like the density. */
function getCurrentSurface() {
  return document.documentElement.getAttribute('data-surface');
}

function syncAllThemes() {
  const theme = getCurrentTheme();
  for (const instance of instances) {
    instance._syncTheme(theme);
  }
}

function syncAllDensities() {
  const density = getCurrentDensity();
  for (const instance of instances) {
    instance._syncDensity(density);
  }
}

function syncAllSurfaces() {
  const surface = getCurrentSurface();
  for (const instance of instances) {
    instance._syncSurface(surface);
  }
}

if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(records => {
    if (records.some(r => r.attributeName === 'data-theme')) syncAllThemes();
    if (records.some(r => r.attributeName === 'data-density')) syncAllDensities();
    if (records.some(r => r.attributeName === 'data-surface')) syncAllSurfaces();
    if (records.some(r => r.attributeName === DEFAULTS_ATTR)) syncDefaultTokens();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-density', 'data-surface', DEFAULTS_ATTR]
  });
}

// ── Host Stylesheet ──
// Sets display:block on all custom elements by default.
// Inline components (badge, avatar) override this.
//
// The wrapper carries the theme's color-scheme, so native parts inside the
// elements — a select's list, a date picker, scrollbars — match the element,
// whatever the page around it uses.

const wrapperRules = `
  .glk-wrapper { display: contents; }
  .glk-wrapper[data-theme="dark"] { color-scheme: dark; }
  .glk-wrapper[data-theme="light"] { color-scheme: light; }
`;

const hostSheet = new CSSStyleSheet();
hostSheet.replaceSync(`
  :host { display: block; }
  :host([hidden]) { display: none; }
  ${wrapperRules}
`);

const inlineHostSheet = new CSSStyleSheet();
inlineHostSheet.replaceSync(`
  :host { display: inline-block; }
  :host([hidden]) { display: none; }
  ${wrapperRules}
`);

/**
 * Host rules for glk-checkbox, glk-radio and glk-toggle. Their control is an
 * inline-flex label inside a block host; sitting on the text baseline it left
 * room for descenders below, so the host was about 4px taller than the
 * control and the control sat high in a centred row. Aligned to the top of
 * its line, the label is as tall as the host.
 */
export const checkControlSheet = new CSSStyleSheet();
checkControlSheet.replaceSync(`
  .glass-checkbox, .glass-radio, .glass-toggle { vertical-align: top; }
`);

// ── Clicks Aimed at the Host ──
// The innermost target of the latest pointerdown anywhere in the document;
// tracked once, on first use.
let lastPressed = null;
let trackingPresses = false;

/**
 * For elements whose control is a native input or button inside the shadow
 * root: glk-checkbox, glk-radio, glk-toggle, glk-button. A click aimed at the
 * host itself — host.click(), or the click a <label> around the element or
 * naming it dispatches — reaches only the host. The control never saw it, so
 * nothing changed where a native checkbox toggles and a native button
 * submits. Such a click is handed to the control; the original is stopped, so
 * listeners see one click, the control's.
 *
 * A pointer press on the host's own empty box (the host is a block, the
 * control is narrower) also lands on the host. Chrome cannot tell it apart
 * from a label's click by the event, only by where the pointer went down; it
 * stays a no-op, as before. Returns the teardown.
 */
export function forwardHostClicks(host, getField) {
  if (!trackingPresses && typeof window !== 'undefined') {
    trackingPresses = true;
    window.addEventListener('pointerdown', e => { lastPressed = e.composedPath()[0]; },
      { capture: true, passive: true });
  }
  const onClick = (e) => {
    if (e.composedPath()[0] !== host) return;           // from inside: the input had it
    if (e.isTrusted && lastPressed === host) return;     // a press on the empty box
    const field = getField();
    if (!field || field.disabled) return;
    e.stopImmediatePropagation();
    field.click();
  };
  host.addEventListener('click', onClick);
  return () => host.removeEventListener('click', onClick);
}

// ── Base Class ──

export class GlkElement extends HTMLElement {

  /** Override in subclass to use inline-block display */
  static get displayInline() { return false; }

  /**
   * Optional CSSStyleSheet with component-specific host rules, adopted after
   * the shared sheets. Keeps per-component selectors out of the shared sheet
   * so an attribute like [fill] only means something where it is documented.
   */
  static get hostStyles() { return null; }

  /**
   * Opt in when the component copies light-DOM children into its shadow tree.
   * A MutationObserver then calls projectLightDom() again whenever those
   * children change — their content and, since 1.28.0, their attributes — so
   * a framework that swaps them or only binds `disabled` keeps the rendered
   * element in step. Without it the copy is made once and silently goes stale.
   */
  static get observesLightDom() { return false; }

  /**
   * Turned on by elements built around one native field: focus() on the
   * host, a click on the label text and a <label for> outside all land in
   * that field.
   */
  static get delegatesFocus() { return false; }

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
    this._initialized = false;
    this._shadow = this.attachShadow({ mode: 'open', delegatesFocus: this.constructor.delegatesFocus });
    const displaySheet = this.constructor.displayInline ? inlineHostSheet : hostSheet;
    const sheets = [componentsSheet, displaySheet];
    const extra = this.constructor.hostStyles;
    if (extra) sheets.push(extra);
    this._shadow.adoptedStyleSheets = sheets;
  }

  connectedCallback() {
    if (!this._initialized) {
      // Before _initialized: setters that set attributes must not reach
      // onAttributeChanged yet — render() reads the attributes anyway.
      this._upgradeProperties();
      this._initialized = true;

      // Create theme wrapper (display:contents makes it layout-transparent)
      this._wrapper = document.createElement('div');
      this._wrapper.className = 'glk-wrapper';
      this._wrapper.setAttribute('data-theme', getCurrentTheme());
      this._syncDensity(getCurrentDensity());
      this._syncSurface(getCurrentSurface());
      this._shadow.appendChild(this._wrapper);

      this.render();
      if (this.constructor.formAssociated) this._syncDisabled();
    } else {
      // Back in the document. While it was out, the observer did not reach
      // it, so a theme, density or surface switched in the meantime is
      // caught up here — the wrapper's data-theme also sets the color-scheme
      // of the native parts inside.
      this._syncTheme(getCurrentTheme());
      this._syncDensity(getCurrentDensity());
      this._syncSurface(getCurrentSurface());
    }

    // Everything below runs on every connect, not just the first. Moving an
    // element in the DOM disconnects and reconnects it, and disconnectedCallback
    // tears all of this down — without re-arming it here a moved element would
    // keep its markup but silently stop reacting.
    this.setupEvents();
    instances.add(this);

    if (this.constructor.observesLightDom) {
      this._lightDomObserver ??= new MutationObserver(records => this.projectLightDom(records));
      // Attributes too: the copies show them. Until 1.27.0 a modal action
      // that started disabled stayed disabled in its copy after the page
      // enabled it, and the dialog could not be confirmed. The elements'
      // own projectLightDom() compare a signature first, so a change
      // elsewhere in the content costs a string comparison.
      this._lightDomObserver.observe(this, {
        childList: true, subtree: true, characterData: true, attributes: true
      });
    }
  }

  /**
   * A property set on the element before its class was defined — markup a
   * framework fills before the bundle has loaded — lands on the instance
   * and hides the class's accessor: the setter never ran, and the value was
   * lost (a glk-select kept its first option, a glk-progress stayed at 0).
   * Such a value is taken off the instance and set again through the
   * setter, which keeps what it cannot apply before render().
   */
  _upgradeProperties() {
    for (const key of Object.keys(this)) {
      let proto = Object.getPrototypeOf(this);
      let setter = null;
      while (proto && proto !== HTMLElement.prototype) {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        if (desc) { setter = desc.set; break; }
        proto = Object.getPrototypeOf(proto);
      }
      if (!setter) continue;
      const value = this[key];
      delete this[key];
      this[key] = value;
    }
  }

  disconnectedCallback() {
    instances.delete(this);
    this._lightDomObserver?.disconnect();
    this.teardownEvents();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._initialized) return;
    if (oldValue === newValue) return;
    this.onAttributeChanged(name, oldValue, newValue);
  }

  _syncTheme(theme) {
    if (this._wrapper) {
      this._wrapper.setAttribute('data-theme', theme);
    }
  }

  /** Mirrors data-density from <html>; without one there, the wrapper has none. */
  _syncDensity(density) {
    if (!this._wrapper) return;
    if (density) {
      this._wrapper.setAttribute('data-density', density);
    } else {
      this._wrapper.removeAttribute('data-density');
    }
  }

  /** Mirrors data-surface from <html> (since 1.24.0), like the density. */
  _syncSurface(surface) {
    if (!this._wrapper) return;
    if (surface) {
      this._wrapper.setAttribute('data-surface', surface);
    } else {
      this._wrapper.removeAttribute('data-surface');
    }
  }

  /** Subclasses override to build inner DOM inside this._wrapper. */
  render() {}

  /** Subclasses override to attach event listeners. */
  setupEvents() {}

  /** Subclasses override to remove event listeners. */
  teardownEvents() {}

  /** Subclasses override to react to attribute changes. */
  onAttributeChanged(name, oldValue, newValue) {}

  /**
   * Subclasses that set observesLightDom override this to (re-)copy their
   * light-DOM children into the shadow tree. Runs on every change to those
   * children, so it has to be safe to call repeatedly.
   */
  projectLightDom() {}

  /**
   * Escape hatch: re-copy the light-DOM children now. The observer covers the
   * ordinary cases; this is for the ones it cannot see, so nobody has to reach
   * into element.shadowRoot.
   */
  refresh() { this.projectLightDom(); }

  /**
   * Form-associated elements only. Such an element is disabled by its own
   * `disabled` attribute or by a <fieldset disabled> around it: the browser
   * counts both — :disabled, left out of the form data — and calls
   * formDisabledCallback() on every change, also when the element moves into
   * or out of such a fieldset. The native controls sit in the shadow root,
   * out of every fieldset's reach, so the state is handed on to them through
   * applyDisabled(). Until 1.22.2 only the element's own attribute reached
   * them: inside a disabled fieldset every field stayed usable, and a submit
   * button sent the form.
   */
  get _actuallyDisabled() { return this.matches(':disabled'); }

  formDisabledCallback() {
    if (this._initialized) this._syncDisabled();
  }

  _syncDisabled() { this.applyDisabled(this._actuallyDisabled); }

  /** Form-associated subclasses override to disable their native controls. */
  applyDisabled(disabled) {}

  // ── Utility Methods ──

  /**
   * For elements whose heading arrives as `title`. That is also the global
   * HTML attribute, and a title on the host shows as a browser tooltip — the
   * sheet's heading floating over its form. So the value is read into
   * this._title and the attribute is taken off the host; a later
   * setAttribute('title') comes through attributeChangedCallback, is taken
   * the same way and removed again, and the element's `title` accessor
   * answers from this._title. The removal fires the callback with null,
   * which is ignored here — only an empty string clears the heading.
   * Returns whether a value was taken.
   */
  takeTitle(value = this.getAttribute('title')) {
    if (value === null) return false;
    this._title = value;
    this.removeAttribute('title');
    return true;
  }

  getBoolAttr(name) {
    return this.hasAttribute(name);
  }

  setBoolAttr(name, value) {
    if (value) {
      this.setAttribute(name, '');
    } else {
      this.removeAttribute(name);
    }
  }

  createElement(tag, classes = [], attrs = {}) {
    const el = document.createElement(tag);
    if (classes.length) el.classList.add(...classes);
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
    return el;
  }

  /**
   * Dispatch a bubbling, composed CustomEvent. With { cancelable: true } a
   * listener may call preventDefault(); the return value is false then.
   */
  emit(eventName, detail = null, { cancelable = false } = {}) {
    return this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      cancelable,
      detail
    }));
  }
}

// ── Form-Associated Base Class ──

export class GlkFormElement extends GlkElement {

  static formAssociated = true;

  // One native field inside, so focus goes there. The button groups
  // (glk-segmented, glk-calendar) turn this off again: their first button is
  // not the chosen one.
  static get delegatesFocus() { return true; }

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  /**
   * The place at the end of a field's label row (since 1.33.0), for a link
   * such as "Forgot password?": slot="label-end", after the field in the
   * shadow tree so the keyboard reaches it after the field, and drawn on
   * the label's line by GlassKit's .glass-input-group--label-end.
   */
  _labelEndPlace(group) {
    const place = this.createElement('span', ['glass-input-group__label-end'], { part: 'label-end', hidden: '' });
    const slot = this.createElement('slot', [], { name: 'label-end' });
    slot.addEventListener('slotchange', () => {
      const on = slot.assignedNodes().length > 0;
      place.hidden = !on;
      group.classList.toggle('glass-input-group--label-end', on);
    });
    place.appendChild(slot);
    return place;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    super.attributeChangedCallback(name, oldValue, newValue);
    // required, min, pattern, type … all change what counts as valid.
    if (this._initialized) this.syncValidity();
  }

  // Reflects the attribute, as on a native control: a disabled fieldset
  // around the element disables it without changing this.
  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }

  _syncDisabled() {
    super._syncDisabled();
    // A disabled field is barred from validation; enabled again, it counts.
    this.syncValidity();
  }

  get form() { return this._internals.form; }
  get validationMessage() { return this._internals.validationMessage; }
  get validity() { return this._internals.validity; }
  get willValidate() { return this._internals.willValidate; }

  checkValidity() { return this._internals.checkValidity(); }
  reportValidity() { return this._internals.reportValidity(); }

  formResetCallback() {
    this.resetValue();
  }

  formStateRestoreCallback(state, mode) {
    this.restoreValue(state);
  }

  /** Subclasses override. */
  resetValue() {}
  restoreValue(state) {}

  setFormValue(value) {
    this._internals.setFormValue(value);
    this.syncValidity();
  }

  setValidity(flags, message, anchor) {
    this._internals.setValidity(flags, message, anchor);
  }

  /**
   * The native field whose constraint validation the host reports, or null.
   * Subclasses built around one field return it.
   */
  get _validityField() { return null; }

  /**
   * A form asks the host — checkValidity(), reportValidity(), submitting — and
   * the host knows nothing by itself, so the inner field's verdict is copied
   * over after everything that can change it: a value (every setFormValue
   * lands here), an attribute, a reset. The field is the anchor: the browser's
   * bubble points at it, and reportValidity() focuses it.
   */
  syncValidity() {
    const field = this._validityField;
    if (!field) return;
    const message = field.validationMessage;
    // A field barred from validation (disabled) can still carry flags, but
    // it has no message, and setValidity() refuses flags without one.
    if (!field.willValidate || field.validity.valid || !message) {
      this._internals.setValidity({});
    } else {
      this._internals.setValidity(field.validity, message, field);
    }
  }
}
