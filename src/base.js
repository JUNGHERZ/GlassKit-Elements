import { glassSheet } from '@jungherz-de/glasskit/glasskit-styles.js';

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

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
    this._initialized = false;
    this._shadow = this.attachShadow({ mode: 'open' });
    const displaySheet = this.constructor.displayInline ? inlineHostSheet : hostSheet;
    this._shadow.adoptedStyleSheets = [glassSheet, displaySheet];
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
      this.setupEvents();

      // Register for theme sync
      instances.add(this);
    }
  }

  disconnectedCallback() {
    instances.delete(this);
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
