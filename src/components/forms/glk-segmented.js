import { GlkFormElement } from '../../base.js';
import { revealCentered } from '../../reveal.js';
import { attachDroplet } from '@jungherz-de/glasskit/glasskit-droplet.js';

// One button per option, the chosen one marked aria-pressed="true" — GlassKit
// styles exactly that attribute. Came back from EhrenPfoten in 1.15.0.
//
// Attributes: options (JSON [{value,label,tone?,disabled?}]), value, full,
//             overflow ("scroll" | "wrap": what happens when the options
//             do not fit — without it the row stays one line and runs past
//             the edge), label (aria-label of the group), name (form field),
//             disabled (the whole row; since 1.22.3, as is a disabled
//             fieldset around it), droplet (since 1.27.0: the chosen option
//             sits on a drop of glass that glides to the next one and can be
//             dragged — GlassKit's .glass-segmented--droplet), icon-only
//             (since 1.28.0: the options show their icons alone, each label
//             becomes the button's aria-label and title — GlassKit's
//             .glass-segmented--icons)
// Properties: value, options (array or JSON text), full, overflow, label,
//             disabled, droplet, iconOnly
// Slots:      icon-<value> (since 1.28.0) — the icon of the option with that
//             value: an <svg>, a font icon, an <img>. It sits in GlassKit's
//             .glass-segmented__icon before the label and takes the option's
//             colour; an option without one has no icon box.
// Event:      glk-change { value } — only on a change made by the user
// Part:       group
//
// Form-associated: a surrounding <form> receives name=value, reset restores
// the initial value. A value change only re-sets aria-pressed, never rebuilds,
// so focus stays on the button that was pressed.
//
// overflow="scroll" keeps the chosen option in view: it is centred in the
// row after the first layout, on every value change and when the row's width
// changes, through the row's own scrolling, so the page never moves (since
// 1.17.0). The attribute is not called "scroll": that is a method of every
// element, and a framework that sets a property whenever the element has one
// (hybrids, Vue, React 19) would overwrite the method instead of setting the
// attribute.

const TONES = ['success', 'warning', 'error'];
const OVERFLOWS = ['scroll', 'wrap'];

function parseList(json) {
  try {
    const list = JSON.parse(json || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

class GlkSegmented extends GlkFormElement {
  static get observedAttributes() { return ['options', 'value', 'full', 'overflow', 'label', 'droplet', 'icon-only']; }

  // A row of buttons with one tab stop: delegated focus would land on the
  // first button, not the chosen one.
  static get delegatesFocus() { return false; }

  render() {
    this._group = this.createElement('div', ['glass-segmented'], { role: 'group', part: 'group' });
    this._wrapper.appendChild(this._group);
    this._initialValue = this.value;
    this._build();
    this._applyLayout();
    this._applyLabel();
  }

  _build() {
    this._group.replaceChildren();
    const iconOnly = this.iconOnly;
    for (const option of parseList(this.getAttribute('options'))) {
      const value = String(option.value ?? '');
      const label = String(option.label ?? value);
      const button = this.createElement('button', ['glass-segmented__item'], { type: 'button', 'data-value': value });
      if (TONES.includes(option.tone)) {
        button.classList.add(`glass-segmented__item--${option.tone}`);
        button.appendChild(this.createElement('span', ['glass-segmented__dot']));
      }
      // The label names the button; an icon font's text must not join it.
      const icon = this.createElement('span', ['glass-segmented__icon'], { 'aria-hidden': 'true' });
      icon.appendChild(this.createElement('slot', [], { name: `icon-${value}` }));
      button.appendChild(icon);
      if (iconOnly) {
        button.setAttribute('aria-label', label);
        button.title = label;
      } else {
        button.appendChild(document.createTextNode(label));
      }
      this._group.appendChild(button);
    }
    this._syncIcons();
    this.applyDisabled(this._actuallyDisabled);
    this._syncValue();
  }

  /** An option shows its icon box only while an icon is slotted into it. */
  _syncIcons() {
    for (const slot of this._group.querySelectorAll('.glass-segmented__icon > slot')) {
      slot.parentElement.hidden = slot.assignedElements().length === 0;
    }
  }

  /** The whole row is disabled, or an option by its own `disabled`. */
  applyDisabled(disabled) {
    const options = this.options;
    this._group.querySelectorAll('button[data-value]').forEach((button, i) => {
      button.disabled = disabled || Boolean(options[i]?.disabled);
    });
  }

  _syncValue() {
    const value = this.value;
    for (const button of this._group.querySelectorAll('button[data-value]')) {
      button.setAttribute('aria-pressed', String(button.dataset.value === value));
    }
    this.setFormValue(value);
    this._reveal(this._revealedAt ? 'smooth' : 'instant');
  }

  _applyLayout() {
    const overflow = this.overflow;
    this._group.classList.toggle('glass-segmented--full', this.getBoolAttr('full'));
    this._group.classList.toggle('glass-segmented--droplet', this.getBoolAttr('droplet'));
    this._group.classList.toggle('glass-segmented--icons', this.iconOnly);
    for (const mode of OVERFLOWS) this._group.classList.toggle(`glass-segmented--${mode}`, overflow === mode);
    this._reveal('instant');
  }

  _reveal(behavior) {
    if (this.overflow !== 'scroll') return;
    const pressed = this._group.querySelector('[aria-pressed="true"]');
    if (revealCentered(this._group, pressed, behavior === 'smooth')) this._revealedAt = this._group.clientWidth;
  }

  _applyLabel() {
    const label = this.getAttribute('label');
    if (label) this._group.setAttribute('aria-label', label);
    else this._group.removeAttribute('aria-label');
  }

  setupEvents() {
    this._onClick = (event) => {
      // The option's button from the event's path. A click on a slotted icon
      // has that icon as its target, in the light DOM, where closest() never
      // meets the button — until 1.28.1 such a tap chose nothing.
      const button = event.composedPath().find(node => node.parentNode === this._group);
      if (!button || button.disabled) return;
      const { value } = button.dataset;
      if (value === this.value) return;
      this.value = value;
      this.emit('glk-change', { value });
    };
    this._onResize = () => { if (this._group.clientWidth !== this._revealedAt) this._reveal('instant'); };
    this._onSlotChange = () => this._syncIcons();
    this._group.addEventListener('click', this._onClick);
    this._group.addEventListener('slotchange', this._onSlotChange);
    this._resizeObserver = new ResizeObserver(this._onResize);
    this._resizeObserver.observe(this._group);
    this._syncIcons();
    this._applyDroplet();
  }

  teardownEvents() {
    this._group?.removeEventListener('click', this._onClick);
    this._group?.removeEventListener('slotchange', this._onSlotChange);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._droplet?.destroy();
    this._droplet = null;
  }

  // The drop follows aria-pressed inside this shadow root by itself; a drag
  // that ends on an option clicks it, the same path as a tap.
  _applyDroplet() {
    const on = this.getBoolAttr('droplet') && this.isConnected;
    if (on && !this._droplet) this._droplet = attachDroplet(this._group);
    else if (!on && this._droplet) { this._droplet.destroy(); this._droplet = null; }
  }

  onAttributeChanged(name) {
    if (!this._group) return;
    switch (name) {
      case 'value': this._syncValue(); break;
      case 'options': this._build(); break;
      case 'full':
      case 'overflow': this._applyLayout(); break;
      case 'droplet': this._applyLayout(); this._applyDroplet(); break;
      case 'icon-only': this._build(); this._applyLayout(); break;
      case 'label': this._applyLabel(); break;
    }
  }

  resetValue() { this.value = this._initialValue; }
  restoreValue(state) { if (typeof state === 'string') this.value = state; }

  get value() { return this.getAttribute('value') ?? ''; }
  set value(v) {
    if (v == null) this.removeAttribute('value');
    else this.setAttribute('value', String(v));
  }

  get options() { return parseList(this.getAttribute('options')); }
  set options(v) { this.setAttribute('options', typeof v === 'string' ? v : JSON.stringify(v ?? [])); }

  get full() { return this.getBoolAttr('full'); }
  set full(v) { this.setBoolAttr('full', v); }

  get droplet() { return this.getBoolAttr('droplet'); }
  set droplet(v) { this.setBoolAttr('droplet', v); }

  get iconOnly() { return this.getBoolAttr('icon-only'); }
  set iconOnly(v) { this.setBoolAttr('icon-only', v); }

  get overflow() {
    const v = this.getAttribute('overflow');
    return OVERFLOWS.includes(v) ? v : '';
  }
  set overflow(v) {
    if (v) this.setAttribute('overflow', String(v));
    else this.removeAttribute('overflow');
  }

  get label() { return this.getAttribute('label') || ''; }
  set label(v) {
    if (v) this.setAttribute('label', v);
    else this.removeAttribute('label');
  }
}

customElements.define('glk-segmented', GlkSegmented);
export { GlkSegmented };
