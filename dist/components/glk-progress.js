import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

const VARIANTS = ['success', 'error'];
const SIZES = ['sm', 'lg'];

class GlkProgress extends GlkElement {
  static get observedAttributes() {
    return ['value', 'max', 'value-text', 'label', 'variant', 'size'];
  }

  // The element is the progress bar (since 1.33.2): role and values sit on
  // the host, so aria-label or aria-labelledby on it name the bar directly.
  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = 'progressbar';
    this._internals.ariaValueMin = '0';
  }

  render() {
    this._container = this.createElement('div', this._computeClasses());

    // Header
    const header = this.createElement('div', ['glass-progress__header']);
    this._labelEl = this.createElement('span', ['glass-progress__label'], { part: 'label' });
    this._valueEl = this.createElement('span', ['glass-progress__value'], { part: 'value' });

    header.appendChild(this._labelEl);
    header.appendChild(this._valueEl);

    // Track
    const track = this.createElement('div', ['glass-progress__track'], { part: 'track' });
    this._fill = this.createElement('div', ['glass-progress__fill'], { part: 'fill' });

    track.appendChild(this._fill);

    this._container.appendChild(header);
    this._container.appendChild(track);

    this._updateLabel();
    this._updateValue();

    this._wrapper.appendChild(this._container);
  }

  onAttributeChanged(name) {
    if (!this._container) return;
    switch (name) {
      case 'value':
      case 'max':
      case 'value-text':
        this._updateValue();
        break;
      case 'label':
        this._updateLabel();
        break;
      case 'variant':
      case 'size':
        this._container.className = this._computeClasses().join(' ');
        break;
    }
  }

  _updateLabel() {
    const label = this.getAttribute('label') || '';
    this._labelEl.textContent = label;
    this._internals.ariaLabel = label || null;
  }

  /**
   * The fill is value / max. The text is value-text when there is one
   * ("3 of 20"), the percentage otherwise. Until 1.33.2 value was a
   * percentage, max and value-text did not exist, and the bar had no role.
   */
  _updateValue() {
    const max = this.max;
    const value = Math.min(max, Math.max(0, parseFloat(this.getAttribute('value')) || 0));
    const percent = value / max * 100;
    const text = this.getAttribute('value-text');
    this._fill.style.width = `${percent}%`;
    this._valueEl.textContent = text || `${Math.round(percent)}%`;
    this._internals.ariaValueNow = String(value);
    this._internals.ariaValueMax = String(max);
    this._internals.ariaValueText = text || null;
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

  /** The value of a full bar; 100 when missing, zero or not a number. */
  get max() {
    const max = parseFloat(this.getAttribute('max'));
    return max > 0 ? max : 100;
  }
  set max(v) { this.setAttribute('max', String(v)); }

  get valueText() { return this.getAttribute('value-text'); }
  set valueText(v) {
    if (v === null || v === undefined) this.removeAttribute('value-text');
    else this.setAttribute('value-text', String(v));
  }
}

customElements.define('glk-progress', GlkProgress);

export { GlkProgress };
