import { G as GlkElement } from './shared/base-C4ZYKLPu.js';

const VARIANTS = ['accent', 'success', 'error'];

class GlkTabAccessory extends GlkElement {
  static get observedAttributes() {
    return ['label', 'disabled', 'variant'];
  }

  render() {
    this._btn = this.createElement('button', ['glass-tab-bar__accessory']);

    if (this.getBoolAttr('disabled')) this._btn.disabled = true;

    const ariaLabel = this.getAttribute('label');
    if (ariaLabel) this._btn.setAttribute('aria-label', ariaLabel);

    this._applyVariant();

    this._btn.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._btn);
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
        break;
      case 'disabled':
        this._btn.disabled = this.getBoolAttr('disabled');
        break;
      case 'variant':
        this._applyVariant();
        break;
    }
  }
}

customElements.define('glk-tab-accessory', GlkTabAccessory);

export { GlkTabAccessory };
