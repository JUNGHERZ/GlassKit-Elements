import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// An item of <glk-menu> (since 1.32.0): GlassKit's .glass-menu__item. The
// label is its content; slot="icon" goes before it, slot="trailing" after
// it — a hint such as a shortcut. type="checkbox" or "radio" makes it
// checkable, with `checked` and the check mark; variant="danger" takes the
// error colour. A disabled item keeps its place in the arrow path and is
// announced as unavailable, but cannot be chosen.
//
// The role and states sit on the element itself (ElementInternals), so the
// menu's items are its own children across the slot: menuitem,
// menuitemcheckbox or menuitemradio, aria-checked, aria-disabled.
//
// Attributes: value, type (checkbox | radio), checked, disabled, variant
// Slots:      default (label), icon, trailing
// Part:       item

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="5 12 10 17 19 7"/></svg>';
const TYPES = ['checkbox', 'radio'];

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  :host { outline: none; }
  :host(:focus) .glass-menu__item { background: var(--gl-surface-2); }
  :host(:focus-visible) .glass-menu__item { box-shadow: inset 0 0 0 2px var(--gl-border-focus); }
  /* A folded level of <glk-breadcrumbs> as the target of a drag (since
     1.34.0), lit as its crumb would be. */
  :host(.is-drop-target) .glass-menu__item {
    color: var(--gl-color-text);
    background: color-mix(in srgb, var(--gl-color-primary) 18%, transparent);
    box-shadow: inset 0 0 0 1.5px var(--gl-border-focus);
  }
  :host(.is-drop-refused) .glass-menu__item { background: var(--gl-color-error-surface); box-shadow: inset 0 0 0 1.5px var(--gl-color-error-border); }
`);

class GlkMenuItem extends GlkElement {
  static get observedAttributes() { return ['type', 'checked', 'disabled', 'variant']; }

  static get hostStyles() { return sheet; }

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  render() {
    this._row = this.createElement('div', ['glass-menu__item'], { part: 'item' });
    this._check = this.createElement('span', ['glass-menu__check']);
    this._check.innerHTML = CHECK;
    this._icon = this.createElement('span', ['glass-menu__icon']);
    this._iconSlot = this.createElement('slot', [], { name: 'icon' });
    this._icon.appendChild(this._iconSlot);
    const label = this.createElement('span', ['glass-menu__label']);
    label.appendChild(document.createElement('slot'));
    this._trailing = this.createElement('span', ['glass-menu__trailing']);
    this._trailingSlot = this.createElement('slot', [], { name: 'trailing' });
    this._trailing.appendChild(this._trailingSlot);
    this._row.append(this._check, this._icon, label, this._trailing);
    this._wrapper.appendChild(this._row);
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
    this._apply();
  }

  setupEvents() {
    this._onSlotChange = () => this._applySlots();
    this._iconSlot.addEventListener('slotchange', this._onSlotChange);
    this._trailingSlot.addEventListener('slotchange', this._onSlotChange);
    this._applySlots();
  }

  teardownEvents() {
    this._iconSlot?.removeEventListener('slotchange', this._onSlotChange);
    this._trailingSlot?.removeEventListener('slotchange', this._onSlotChange);
  }

  onAttributeChanged() { if (this._row) this._apply(); }

  _applySlots() {
    this._icon.hidden = this._iconSlot.assignedNodes().length === 0;
    this._trailing.hidden = this._trailingSlot.assignedNodes().length === 0;
  }

  _apply() {
    const type = this.type, checkable = TYPES.includes(type);
    this._internals.role = type === 'checkbox' ? 'menuitemcheckbox' : type === 'radio' ? 'menuitemradio' : 'menuitem';
    this._internals.ariaChecked = checkable ? String(this.checked) : null;
    this._internals.ariaDisabled = this.disabled ? 'true' : null;
    // A menu with checkable items keeps the mark's room on every item, so
    // the labels line up.
    this._check.hidden = !checkable && !this._reserve;
    this._row.classList.toggle('is-checked', checkable && this.checked);
    this._row.classList.toggle('is-disabled', this.disabled);
    this._row.classList.toggle('glass-menu__item--danger', this.getAttribute('variant') === 'danger');
  }

  /** Called by the menu: whether any of its items is checkable. */
  _reserveCheck(on) {
    this._reserve = on;
    if (this._row) this._apply();
  }

  /** The text typed to jump to the item. */
  get label() { return this.textContent.replace(/\s+/g, ' ').trim(); }

  get value() { return this.getAttribute('value') ?? this.label; }
  set value(v) { this.setAttribute('value', v); }

  get type() { return TYPES.includes(this.getAttribute('type')) ? this.getAttribute('type') : ''; }
  set type(v) {
    if (TYPES.includes(v)) this.setAttribute('type', v);
    else this.removeAttribute('type');
  }

  get checked() { return this.getBoolAttr('checked'); }
  set checked(v) { this.setBoolAttr('checked', v); }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
}

customElements.define('glk-menu-item', GlkMenuItem);

export { GlkMenuItem };
