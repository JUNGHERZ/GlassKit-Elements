import { GlkFormElement } from './base.js';
import { r as revealCentered } from './shared/reveal-CjjzoxTa.js';
import { a as attachDroplet } from './shared/glasskit-droplet-3vJVXB3u.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// One button per option, the chosen one marked aria-pressed="true" — GlassKit
// styles exactly that attribute. Came back from EhrenPfoten in 1.15.0.
//
// Attributes: options (JSON [{value,label,tone?,disabled?,badge?,badgeLabel?,
//             badgeTone?}] — badge since 1.29.0: a count after the label,
//             GlassKit's .glass-segmented__badge, in the tone's colour where
//             one is set; missing, empty or 0 shows none; badgeLabel words it
//             for the name, "1 open"; badgeTone since 1.31.0: primary,
//             success, warning or error colours the count alone, without the
//             dot a tone puts before the label), value, full,
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
// Parts:      group, item (each option's button), badge (its count) — item
//             and badge since 1.31.0
//
// Form-associated: a surrounding <form> receives name=value, reset restores
// the initial value. A value change only re-sets aria-pressed, never rebuilds,
// so focus stays on the button that was pressed. New options with the same
// values in the same order — a count that changed — fill the buttons in
// place (since 1.29.0), so the focus and the drop stay as well.
//
// overflow="scroll" keeps the chosen option in view: it is centred in the
// row after the first layout, on every value change and when the row's width
// changes, through the row's own scrolling, so the page never moves (since
// 1.17.0). The attribute is not called "scroll": that is a method of every
// element, and a framework that sets a property whenever the element has one
// (hybrids, Vue, React 19) would overwrite the method instead of setting the
// attribute.

const TONES = ['success', 'warning', 'error'];
const BADGE_TONES = ['primary', ...TONES];
const OVERFLOWS = ['scroll', 'wrap'];

function parseList(json) {
  try {
    const list = JSON.parse(json || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** The text of an option's count; empty when there is none to show. */
function badgeText(badge) {
  if (badge == null || badge === false) return '';
  const text = String(badge).trim();
  return text === '0' ? '' : text;
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
    const list = parseList(this.getAttribute('options'));
    const iconOnly = this.iconOnly;
    // The same values in the same order keep their buttons; anything else
    // starts the row afresh.
    const buttons = [...this._group.children];
    const same = buttons.length === list.length
      && list.every((option, i) => buttons[i].dataset.value === String(option.value ?? ''));
    if (!same) this._group.replaceChildren(...list.map(() => this.createElement('button', [], { type: 'button', part: 'item' })));
    [...this._group.children].forEach((button, i) => this._fill(button, list[i], iconOnly));
    this._syncIcons();
    this.applyDisabled(this._actuallyDisabled);
    this._syncValue();
  }

  /** Gives an option's button its tone, icon box, label and count. */
  _fill(button, option, iconOnly) {
    const value = String(option.value ?? '');
    const label = String(option.label ?? value);
    const parts = [];
    button.className = 'glass-segmented__item';
    button.dataset.value = value;
    if (TONES.includes(option.tone)) {
      button.classList.add(`glass-segmented__item--${option.tone}`);
      parts.push(this.createElement('span', ['glass-segmented__dot']));
    }
    // The label names the button; an icon font's text must not join it.
    const icon = this.createElement('span', ['glass-segmented__icon'], { 'aria-hidden': 'true' });
    icon.appendChild(this.createElement('slot', [], { name: `icon-${value}` }));
    parts.push(icon);
    if (!iconOnly) parts.push(document.createTextNode(label));
    // The count after the label, or at the icon's corner in an icon-only row;
    // the name says it in words — "Tickets, 1 open".
    const badge = badgeText(option.badge);
    let name = label;
    if (badge) {
      const tone = BADGE_TONES.includes(option.badgeTone) ? [`glass-segmented__badge--${option.badgeTone}`] : [];
      const pill = this.createElement('span', ['glass-segmented__badge', ...tone], { part: 'badge' });
      pill.textContent = badge;
      if (iconOnly) icon.appendChild(pill);
      else parts.push(pill);
      name = `${label}, ${option.badgeLabel ? String(option.badgeLabel) : badge}`;
    }
    button.replaceChildren(...parts);
    if (iconOnly || badge) button.setAttribute('aria-label', name);
    else button.removeAttribute('aria-label');
    if (iconOnly) button.title = name;
    else button.removeAttribute('title');
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
