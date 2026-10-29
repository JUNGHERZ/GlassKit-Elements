import { GlkElement } from '../../base.js';

// size: sm (32px), lg (56px); 44px without, or with md. GlassKit's
// --gl-avatar-size (since 1.37.0) sets any other size, on the element or
// around it, and --gl-avatar-font-size the initials' size with it; in the
// leading box of a <glk-list-item> the avatar takes the box's size, 28px,
// 40px with leading-lg. Parts (since 1.37.0): avatar, the circle, and
// image, the picture in it.
const SIZES = ['sm', 'lg'];

class GlkAvatar extends GlkElement {
  static get displayInline() { return true; }
  static get observedAttributes() {
    return ['size', 'src', 'alt'];
  }

  render() {
    this._avatar = this.createElement('div', this._computeClasses(), { part: 'avatar' });
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
        alt: this.getAttribute('alt') || '',
        part: 'image'
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
