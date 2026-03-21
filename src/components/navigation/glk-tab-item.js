import { GlkElement } from '../../base.js';

class GlkTabItem extends GlkElement {
  static get observedAttributes() {
    return ['label', 'active', 'badge'];
  }

  render() {
    this._btn = this.createElement('button', ['glass-tab-bar__item']);
    if (this.getBoolAttr('active')) this._btn.classList.add('is-active');

    // Icon — clone SVG from light DOM into shadow DOM so GlassKit CSS applies
    this._iconEl = this.createElement('span', ['glass-tab-bar__icon']);

    // Label
    this._labelEl = this.createElement('span', ['glass-tab-bar__label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    // Badge inside icon container (position: absolute relative to icon)
    const badge = this.getAttribute('badge');
    if (badge) {
      this._badgeEl = this.createElement('span', ['glass-tab-bar__badge']);
      this._badgeEl.textContent = badge;
      this._iconEl.appendChild(this._badgeEl);
    }

    this._btn.appendChild(this._iconEl);
    this._btn.appendChild(this._labelEl);

    this._wrapper.appendChild(this._btn);

    // Defer icon cloning — children may not be parsed yet
    requestAnimationFrame(() => this._cloneIcon());
  }

  _cloneIcon() {
    const svg = this.querySelector('svg');
    if (svg) {
      const clone = svg.cloneNode(true);
      // Remove inline attributes that would override GlassKit styles
      clone.removeAttribute('width');
      clone.removeAttribute('height');
      clone.removeAttribute('stroke');
      clone.removeAttribute('stroke-width');
      clone.removeAttribute('stroke-linecap');
      clone.removeAttribute('stroke-linejoin');
      clone.removeAttribute('fill');
      this._iconEl.insertBefore(clone, this._iconEl.firstChild);
    }
  }

  setupEvents() {
    this._onClick = () => {
      this.setAttribute('active', '');
      this.emit('glk-tab-select');
    };
    this._btn.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    switch (name) {
      case 'active':
        this._btn.classList.toggle('is-active', this.getBoolAttr('active'));
        break;
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        break;
      case 'badge': {
        const badge = this.getAttribute('badge');
        if (badge) {
          if (!this._badgeEl) {
            this._badgeEl = this.createElement('span', ['glass-tab-bar__badge']);
            this._iconEl.appendChild(this._badgeEl);
          }
          this._badgeEl.textContent = badge;
        } else if (this._badgeEl) {
          this._badgeEl.remove();
          this._badgeEl = null;
        }
        break;
      }
    }
  }
}

customElements.define('glk-tab-item', GlkTabItem);
export { GlkTabItem };
