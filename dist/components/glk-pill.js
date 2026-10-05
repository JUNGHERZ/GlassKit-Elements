import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// Handed down to the native button, which is what assistive technology reads —
// <glk-popover> sets aria-expanded on its trigger.
const FORWARDED_ARIA = ['aria-expanded', 'aria-haspopup', 'aria-pressed'];

class GlkPill extends GlkElement {
  static get observedAttributes() {
    return ['label', 'disabled', ...FORWARDED_ARIA];
  }

  render() {
    this._btn = this.createElement('button', ['glass-pill']);

    if (this.getBoolAttr('disabled')) this._btn.disabled = true;

    const ariaLabel = this.getAttribute('label');
    if (ariaLabel) this._btn.setAttribute('aria-label', ariaLabel);
    for (const attr of FORWARDED_ARIA) this._forward(attr);

    // Slotted content (SVG icons, text)
    this._btn.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._btn);
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
      default:
        if (FORWARDED_ARIA.includes(name)) this._forward(name);
    }
  }

  _forward(attr) {
    const value = this.getAttribute(attr);
    if (value === null) this._btn.removeAttribute(attr);
    else this._btn.setAttribute(attr, value);
  }
}

customElements.define('glk-pill', GlkPill);

export { GlkPill };
