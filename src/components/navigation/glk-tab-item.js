import { GlkElement } from '../../base.js';

class GlkTabItem extends GlkElement {
  static get observedAttributes() {
    return ['label', 'active', 'badge'];
  }

  render() {
    this._btn = this.createElement('button', ['glass-tab-bar__item']);
    if (this.getBoolAttr('active')) this._btn.classList.add('is-active');

    // Icon slot
    this._iconEl = this.createElement('span', ['glass-tab-bar__icon']);
    this._iconEl.appendChild(document.createElement('slot'));

    // Label
    this._labelEl = this.createElement('span', ['glass-tab-bar__label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    this._btn.appendChild(this._iconEl);
    this._btn.appendChild(this._labelEl);

    // Badge (optional)
    const badge = this.getAttribute('badge');
    if (badge) {
      this._badgeEl = this.createElement('span', ['glass-tab-bar__badge']);
      this._badgeEl.textContent = badge;
      this._btn.appendChild(this._badgeEl);
    }

    this._wrapper.appendChild(this._btn);
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
            this._btn.appendChild(this._badgeEl);
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
