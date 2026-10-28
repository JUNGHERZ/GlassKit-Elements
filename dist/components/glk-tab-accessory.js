import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// The round button beside the floating bar, or in a bar's leading place.
// show-label (since 1.33.0) sets its label under it as well — in a rail
// that names its items, the accessory names itself the same way. The label
// stays the button's name; the visible one is not read a second time, and
// a click on it presses the button.
//
// Attributes: label, disabled, variant (accent | success | error),
//             show-label
// Events:     glk-click

const VARIANTS = ['accent', 'success', 'error'];

class GlkTabAccessory extends GlkElement {
  static get observedAttributes() {
    return ['label', 'disabled', 'variant', 'show-label'];
  }

  render() {
    this._btn = this.createElement('button', ['glass-tab-bar__accessory']);

    if (this.getBoolAttr('disabled')) this._btn.disabled = true;

    const ariaLabel = this.getAttribute('label');
    if (ariaLabel) this._btn.setAttribute('aria-label', ariaLabel);

    this._applyVariant();

    this._btn.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._btn);
    this._applyShowLabel();
  }

  /** With show-label, the button and its visible label as one column. */
  _applyShowLabel() {
    const on = this.getBoolAttr('show-label');
    if (on && !this._item) {
      this._item = this.createElement('div', ['glass-tab-bar__accessory-item']);
      this._labelEl = this.createElement('span', ['glass-tab-bar__accessory-label'], { 'aria-hidden': 'true', part: 'label' });
      this._labelEl.addEventListener('click', () => this._btn.click());
      this._btn.replaceWith(this._item);
      this._item.append(this._btn, this._labelEl);
    } else if (!on && this._item) {
      this._item.replaceWith(this._btn);
      this._item = this._labelEl = null;
    }
    if (this._labelEl) this._labelEl.textContent = this.getAttribute('label') || '';
  }

  _applyVariant() {
    if (!this._btn) return;
    for (const v of VARIANTS) {
      this._btn.classList.remove(`glass-tab-bar__accessory--${v}`);
    }
    const variant = this.getAttribute('variant');
    if (variant && VARIANTS.includes(variant)) {
      this._btn.classList.add(`glass-tab-bar__accessory--${variant}`);
    }
  }

  setupEvents() {
    this._onClick = () => {
      if (!this.getBoolAttr('disabled')) {
        this.emit('glk-click');
      }
    };
    this._btn.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    switch (name) {
      case 'label':
        this._btn.setAttribute('aria-label', this.getAttribute('label') || '');
        this._applyShowLabel();
        break;
      case 'show-label':
        this._applyShowLabel();
        break;
      case 'disabled':
        this._btn.disabled = this.getBoolAttr('disabled');
        break;
      case 'variant':
        this._applyVariant();
        break;
    }
  }

  get showLabel() { return this.getBoolAttr('show-label'); }
  set showLabel(v) { this.setBoolAttr('show-label', v); }
}

customElements.define('glk-tab-accessory', GlkTabAccessory);

export { GlkTabAccessory };
