import { GlkElement } from '../../base.js';

class GlkPill extends GlkElement {
  static get observedAttributes() {
    return ['label', 'disabled'];
  }

  render() {
    this._btn = this.createElement('button', ['glass-pill']);

    if (this.getBoolAttr('disabled')) this._btn.disabled = true;

    const ariaLabel = this.getAttribute('label');
    if (ariaLabel) this._btn.setAttribute('aria-label', ariaLabel);

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
    }
  }
}

customElements.define('glk-pill', GlkPill);
export { GlkPill };
