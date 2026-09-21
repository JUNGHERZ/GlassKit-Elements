import { GlkFormElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// One button per option, the chosen one marked aria-pressed="true" — GlassKit
// styles exactly that attribute. Came back from EhrenPfoten in 1.15.0.
//
// Attributes: options (JSON [{value,label,tone?,disabled?}]), value, full,
//             label (aria-label of the group), name (form field name)
// Properties: value, options (array or JSON text), full, label
// Event:      glk-change { value } — only on a change made by the user
// Part:       group
//
// Form-associated: a surrounding <form> receives name=value, reset restores
// the initial value. A value change only re-sets aria-pressed, never rebuilds,
// so focus stays on the button that was pressed.

const TONES = ['success', 'warning', 'error'];

function parseList(json) {
  try {
    const list = JSON.parse(json || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

class GlkSegmented extends GlkFormElement {
  static get observedAttributes() { return ['options', 'value', 'full', 'label']; }

  render() {
    this._group = this.createElement('div', ['glass-segmented'], { role: 'group', part: 'group' });
    this._wrapper.appendChild(this._group);
    this._initialValue = this.value;
    this._build();
    this._applyFull();
    this._applyLabel();
  }

  _build() {
    this._group.replaceChildren();
    for (const option of parseList(this.getAttribute('options'))) {
      const value = String(option.value ?? '');
      const button = this.createElement('button', ['glass-segmented__item'], { type: 'button', 'data-value': value });
      if (TONES.includes(option.tone)) {
        button.classList.add(`glass-segmented__item--${option.tone}`);
        button.appendChild(this.createElement('span', ['glass-segmented__dot']));
      }
      if (option.disabled) button.disabled = true;
      button.appendChild(document.createTextNode(option.label ?? value));
      this._group.appendChild(button);
    }
    this._syncValue();
  }

  _syncValue() {
    const value = this.value;
    for (const button of this._group.querySelectorAll('button[data-value]')) {
      button.setAttribute('aria-pressed', String(button.dataset.value === value));
    }
    this.setFormValue(value);
  }

  _applyFull() {
    this._group.classList.toggle('glass-segmented--full', this.getBoolAttr('full'));
  }

  _applyLabel() {
    const label = this.getAttribute('label');
    if (label) this._group.setAttribute('aria-label', label);
    else this._group.removeAttribute('aria-label');
  }

  setupEvents() {
    this._onClick = (event) => {
      const button = event.target.closest('button[data-value]');
      if (!button || button.disabled) return;
      const { value } = button.dataset;
      if (value === this.value) return;
      this.value = value;
      this.emit('glk-change', { value });
    };
    this._group.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    this._group?.removeEventListener('click', this._onClick);
  }

  onAttributeChanged(name) {
    if (!this._group) return;
    switch (name) {
      case 'value': this._syncValue(); break;
      case 'options': this._build(); break;
      case 'full': this._applyFull(); break;
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

  get label() { return this.getAttribute('label') || ''; }
  set label(v) {
    if (v) this.setAttribute('label', v);
    else this.removeAttribute('label');
  }
}

customElements.define('glk-segmented', GlkSegmented);

export { GlkSegmented };
