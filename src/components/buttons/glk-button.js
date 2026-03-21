import { GlkElement } from '../../base.js';

const VARIANTS = ['primary', 'secondary', 'tertiary'];
const SIZES = ['sm', 'md', 'lg', 'auto'];

class GlkButton extends GlkElement {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'type'];
  }

  render() {
    this._btn = this.createElement('button', this._computeClasses(), {
      type: this.getAttribute('type') || 'button'
    });

    if (this.getBoolAttr('disabled')) {
      this._btn.disabled = true;
    }

    this._btn.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._btn);
  }

  setupEvents() {
    this._onClick = (e) => {
      if (this.getBoolAttr('disabled')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.emit('glk-click');
    };
    this._btn.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    switch (name) {
      case 'variant':
      case 'size':
        this._btn.className = this._computeClasses().join(' ');
        break;
      case 'disabled':
        this._btn.disabled = this.getBoolAttr('disabled');
        break;
      case 'type':
        this._btn.setAttribute('type', this.getAttribute('type') || 'button');
        break;
    }
  }

  _computeClasses() {
    const classes = ['glass-btn'];
    const variant = this.getAttribute('variant');
    if (variant && VARIANTS.includes(variant)) {
      classes.push(`glass-btn--${variant}`);
    }
    const size = this.getAttribute('size');
    if (size && SIZES.includes(size)) {
      classes.push(`glass-btn--${size}`);
    }
    return classes;
  }

  get variant() { return this.getAttribute('variant'); }
  set variant(v) { this.setAttribute('variant', v); }

  get size() { return this.getAttribute('size'); }
  set size(v) { this.setAttribute('size', v); }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
}

customElements.define('glk-button', GlkButton);
export { GlkButton };
