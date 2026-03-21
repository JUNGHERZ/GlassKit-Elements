import { GlkElement } from '../../base.js';

const VARIANTS = ['primary', 'success', 'error'];

class GlkBadge extends GlkElement {
  static get displayInline() { return true; }
  static get observedAttributes() {
    return ['variant'];
  }

  render() {
    this._badge = this.createElement('span', this._computeClasses());
    this._badge.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._badge);
  }

  onAttributeChanged(name) {
    if (name === 'variant' && this._badge) {
      this._badge.className = this._computeClasses().join(' ');
    }
  }

  _computeClasses() {
    const classes = ['glass-badge'];
    const variant = this.getAttribute('variant');
    if (variant && VARIANTS.includes(variant)) {
      classes.push(`glass-badge--${variant}`);
    }
    return classes;
  }

  get variant() { return this.getAttribute('variant'); }
  set variant(v) { this.setAttribute('variant', v); }
}

customElements.define('glk-badge', GlkBadge);
export { GlkBadge };
