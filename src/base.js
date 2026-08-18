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

const TOKENS_INJECTED = '__glkDefaultTokensInjected';

function injectDefaultTokens() {
  if (typeof document === 'undefined') return;              // SSR / non-DOM
  if (globalThis[TOKENS_INJECTED]) return;                   // another bundle copy did it
  globalThis[TOKENS_INJECTED] = true;

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`@layer glasskit-defaults { ${tokensCss} }`);
  // Append — never assign — so an app's own adopted sheets survive.
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

injectDefaultTokens();

// ── Global Theme Sync ──
// Single MutationObserver that watches data-theme on <html>
// and notifies all GlkElement instances.

const instances = new Set();

function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

function syncAllThemes() {
  const theme = getCurrentTheme();
  for (const instance of instances) {
    instance._syncTheme(theme);
  }
}

if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(syncAllThemes);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
}

// ── Host Stylesheet ──
// Sets display:block on all custom elements by default.
// Inline components (badge, avatar) override this.

const hostSheet = new CSSStyleSheet();
hostSheet.replaceSync(`
  :host { display: block; }
  :host([hidden]) { display: none; }
  .glk-wrapper { display: contents; }
`);

const inlineHostSheet = new CSSStyleSheet();
inlineHostSheet.replaceSync(`
  :host { display: inline-block; }
  :host([hidden]) { display: none; }
  .glk-wrapper { display: contents; }
`);

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
   * children change, so a framework that swaps them keeps the rendered element
   * in step. Without it the copy is made once and silently goes stale.
   */
  static get observesLightDom() { return false; }

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
    this._initialized = false;
    this._shadow = this.attachShadow({ mode: 'open' });
    const displaySheet = this.constructor.displayInline ? inlineHostSheet : hostSheet;
    const sheets = [componentsSheet, displaySheet];
    const extra = this.constructor.hostStyles;
    if (extra) sheets.push(extra);
    this._shadow.adoptedStyleSheets = sheets;
  }

  connectedCallback() {
    if (!this._initialized) {
      this._initialized = true;

      // Create theme wrapper (display:contents makes it layout-transparent)
      this._wrapper = document.createElement('div');
      this._wrapper.className = 'glk-wrapper';
      this._wrapper.setAttribute('data-theme', getCurrentTheme());
      this._shadow.appendChild(this._wrapper);

      this.render();
    }

    // Everything below runs on every connect, not just the first. Moving an
    // element in the DOM disconnects and reconnects it, and disconnectedCallback
    // tears all of this down — without re-arming it here a moved element would
    // keep its markup but silently stop reacting.
    this.setupEvents();
    instances.add(this);

    if (this.constructor.observesLightDom) {
      this._lightDomObserver ??= new MutationObserver(records => this.projectLightDom(records));
      this._lightDomObserver.observe(this, {
        childList: true, subtree: true, characterData: true
      });
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

  // ── Utility Methods ──

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

  emit(eventName, detail = null) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail
    }));
  }
}

// ── Form-Associated Base Class ──

export class GlkFormElement extends GlkElement {

  static formAssociated = true;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  get form() { return this._internals.form; }
  get validationMessage() { return this._internals.validationMessage; }
  get validity() { return this._internals.validity; }

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
  }

  setValidity(flags, message, anchor) {
    this._internals.setValidity(flags, message, anchor);
  }
}
