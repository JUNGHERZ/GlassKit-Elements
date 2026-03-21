import { GlkElement } from '../../base.js';

const SIZES = ['sm', 'lg'];

class GlkAvatar extends GlkElement {
  static get displayInline() { return true; }
  static get observedAttributes() {
    return ['size', 'src', 'alt'];
  }

  render() {
    this._avatar = this.createElement('div', this._computeClasses());
    this._updateContent();
    this._wrapper.appendChild(this._avatar);
  }

  onAttributeChanged(name) {
    if (!this._avatar) return;
    if (name === 'size') {
      this._avatar.className = this._computeClasses().join(' ');
    } else if (name === 'src' || name === 'alt') {
      this._updateContent();
    }
  }

  _updateContent() {
    const src = this.getAttribute('src');
    this._avatar.innerHTML = '';
    if (src) {
      const img = this.createElement('img', [], {
        src,
        alt: this.getAttribute('alt') || ''
      });
      this._avatar.appendChild(img);
    } else {
      // Use slotted text content (initials)
      this._avatar.appendChild(document.createElement('slot'));
    }
  }

  _computeClasses() {
    const classes = ['glass-avatar'];
    const size = this.getAttribute('size');
    if (size && SIZES.includes(size)) {
      classes.push(`glass-avatar--${size}`);
    }
    return classes;
  }

  get size() { return this.getAttribute('size'); }
  set size(v) { this.setAttribute('size', v); }

  get src() { return this.getAttribute('src'); }
  set src(v) { this.setAttribute('src', v); }
}

customElements.define('glk-avatar', GlkAvatar);
export { GlkAvatar };
