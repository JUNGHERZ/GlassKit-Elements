import { GlkElement } from '../../base.js';

const VARIANTS = ['success', 'error'];
const SIZES = ['sm', 'lg'];

class GlkProgress extends GlkElement {
  static get observedAttributes() {
    return ['value', 'label', 'variant', 'size'];
  }

  render() {
    this._container = this.createElement('div', this._computeClasses());

    // Header
    const header = this.createElement('div', ['glass-progress__header']);
    this._labelEl = this.createElement('span', ['glass-progress__label']);
    this._labelEl.textContent = this.getAttribute('label') || '';
    this._valueEl = this.createElement('span', ['glass-progress__value']);

    header.appendChild(this._labelEl);
    header.appendChild(this._valueEl);

    // Track
    const track = this.createElement('div', ['glass-progress__track']);
    this._fill = this.createElement('div', ['glass-progress__fill']);

    track.appendChild(this._fill);

    this._container.appendChild(header);
    this._container.appendChild(track);

    this._updateValue();

    this._wrapper.appendChild(this._container);
  }

  onAttributeChanged(name) {
    if (!this._container) return;
    switch (name) {
      case 'value':
        this._updateValue();
        break;
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        break;
      case 'variant':
      case 'size':
        this._container.className = this._computeClasses().join(' ');
        break;
    }
  }

  _updateValue() {
    const val = Math.min(100, Math.max(0, parseInt(this.getAttribute('value') || '0', 10)));
    this._fill.style.width = `${val}%`;
    this._valueEl.textContent = `${val}%`;
  }

  _computeClasses() {
    const classes = ['glass-progress'];
    const variant = this.getAttribute('variant');
    if (variant && VARIANTS.includes(variant)) {
      classes.push(`glass-progress--${variant}`);
    }
    const size = this.getAttribute('size');
    if (size && SIZES.includes(size)) {
      classes.push(`glass-progress--${size}`);
    }
    return classes;
  }

  get value() { return this.getAttribute('value'); }
  set value(v) { this.setAttribute('value', String(v)); }
}

customElements.define('glk-progress', GlkProgress);
export { GlkProgress };
