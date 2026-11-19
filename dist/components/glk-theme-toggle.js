import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// A round button that switches the page between light, dark and auto (since
// 1.41.0) — GlassKit's .glass-theme-toggle, with its moon, its sun and, for
// auto, the sun with an A. Auto follows the system's colour scheme, also
// when it changes while the page is open.
//
// The choice goes on <html>: data-theme names the theme that is on, as ever,
// and data-theme-mode the choice itself, auto included — so every toggle of
// the page, and GlassKit's plain .glass-theme-toggle, shows the same state.
// It is kept in localStorage under storage-key ("glk-theme"; an empty value
// keeps it for the page alone) and comes back on the next visit. Until a
// choice was made, the toggle takes the page's data-theme as it is, or
// starts in the mode its attribute names.
//
// Each press moves on: from auto to the theme the system does not show, then
// to the other one, and back to auto — so the first press always changes
// what one sees.
//
// The button is named by label and the state, "Theme: Auto"; light-label,
// dark-label and auto-label word the states.
//
// Attributes: mode (light | dark | auto — the start, and a mode set later),
//             label, light-label, dark-label, auto-label, storage-key,
//             disabled
// Properties: mode (the page's mode), label, storageKey, disabled
// Events:     glk-change { mode, theme } — after a press
// Part:       button

const MODES = ['light', 'dark', 'auto'];
const DEFAULT_KEY = 'glk-theme';
const NAMES = { light: 'Light', dark: 'Dark', auto: 'Auto' };

const ICONS = '<svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
  + '<svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
  + '<svg class="icon-auto" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 1.5v1.5M12 21v1.5M4.57 4.57l1.06 1.06M18.37 18.37l1.06 1.06M1.5 12H3M21 12h1.5M4.57 19.43l1.06-1.06M18.37 5.63l1.06-1.06"/><path d="M9.5 15.4 12 8.8l2.5 6.6M10.4 13.1h3.2" stroke-width="1.8"/></svg>';

// ── The page's mode, shared by every toggle ──

const toggles = new Set();
const html = typeof document !== 'undefined' ? document.documentElement : null;
const system = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: light)') : null;

function systemTheme() { return system?.matches ? 'light' : 'dark'; }

/** The choice on <html>; without one, the theme that is on. */
function pageMode() {
  const mode = html.getAttribute('data-theme-mode');
  if (MODES.includes(mode)) return mode;
  return html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function applyMode(mode) {
  const theme = mode === 'auto' ? systemTheme() : mode;
  html.setAttribute('data-theme-mode', mode);
  if (html.getAttribute('data-theme') !== theme) html.setAttribute('data-theme', theme);
}

/** From auto to the theme the system does not show, then the other one. */
function nextMode(mode) {
  const shown = systemTheme(), other = shown === 'light' ? 'dark' : 'light';
  const order = ['auto', other, shown];
  return order[(order.indexOf(mode) + 1) % order.length];
}

function readStored(key) {
  if (!key) return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function store(key, mode) {
  if (!key) return;
  try { localStorage.setItem(key, mode); } catch { /* private mode: the choice holds for this visit */ }
}

if (html && typeof MutationObserver !== 'undefined') {
  new MutationObserver(() => { for (const toggle of toggles) toggle._sync(); })
    .observe(html, { attributes: true, attributeFilter: ['data-theme-mode', 'data-theme'] });
  system?.addEventListener('change', () => {
    if (html.getAttribute('data-theme-mode') === 'auto') applyMode('auto');
  });
}

class GlkThemeToggle extends GlkElement {
  static get observedAttributes() {
    return ['mode', 'label', 'light-label', 'dark-label', 'auto-label', 'disabled'];
  }

  // focus() lands on the native button.
  static get delegatesFocus() { return true; }

  render() {
    this._btn = this.createElement('button', ['glass-theme-toggle'], { type: 'button', part: 'button' });
    this._btn.innerHTML = ICONS;
    this._btn.disabled = this.getBoolAttr('disabled');
    this._wrapper.appendChild(this._btn);
  }

  setupEvents() {
    toggles.add(this);
    this._start();
    this._sync();
    this._onClick = () => {
      if (this._btn.disabled) return;
      const mode = nextMode(pageMode());
      applyMode(mode);
      store(this.storageKey, mode);
      this.emit('glk-change', { mode, theme: html.getAttribute('data-theme') });
    };
    this._btn.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    toggles.delete(this);
    this._btn?.removeEventListener('click', this._onClick);
  }

  /**
   * Once per page: a choice already on <html> stands — a script in <head>
   * set it, or another toggle. Else the stored one, else the attribute.
   */
  _start() {
    if (html.hasAttribute('data-theme-mode')) return;
    const stored = readStored(this.storageKey);
    const mode = MODES.includes(stored) ? stored : this.getAttribute('mode');
    if (MODES.includes(mode)) applyMode(mode);
  }

  /** The icon follows <html> through GlassKit's rules; the name follows here. */
  _sync() {
    if (!this._btn) return;
    const mode = pageMode();
    if (html.hasAttribute('data-theme-mode')) this._wrapper.setAttribute('data-theme-mode', mode);
    else this._wrapper.removeAttribute('data-theme-mode');
    const name = `${this.label}: ${this.getAttribute(`${mode}-label`) || NAMES[mode]}`;
    this._btn.setAttribute('aria-label', name);
    this._btn.title = name;
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    if (name === 'disabled') this._btn.disabled = this.getBoolAttr('disabled');
    else if (name === 'mode') this.mode = this.getAttribute('mode');
    else this._sync();
  }

  get mode() { return html ? pageMode() : 'dark'; }
  set mode(v) {
    if (!MODES.includes(v) || !html) return;
    applyMode(v);
    store(this.storageKey, v);
  }

  get label() { return this.getAttribute('label') || 'Theme'; }
  set label(v) { this.setAttribute('label', v); }

  /** The localStorage key; an empty one keeps the choice for this page alone. */
  get storageKey() { return this.getAttribute('storage-key') ?? DEFAULT_KEY; }
  set storageKey(v) { this.setAttribute('storage-key', v ?? ''); }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
}

customElements.define('glk-theme-toggle', GlkThemeToggle);

export { GlkThemeToggle };
