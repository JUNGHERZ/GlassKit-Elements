import { GlkElement } from '../../base.js';

class GlkStatus extends GlkElement {
  static get observedAttributes() {
    return ['message'];
  }

  render() {
    this._container = this.createElement('div', ['glass-status']);

    // Icon via slot
    this._iconSlot = this.createElement('span', []);
    this._iconSlot.appendChild(this.createElement('slot', [], { name: 'icon' }));

    // Message
    this._messageEl = this.createElement('p', []);
    this._messageEl.textContent = this.getAttribute('message') || '';

    this._container.appendChild(this._iconSlot);
    this._container.appendChild(this._messageEl);
    this._wrapper.appendChild(this._container);
  }

  onAttributeChanged(name) {
    if (name === 'message' && this._messageEl) {
      this._messageEl.textContent = this.getAttribute('message') || '';
    }
  }

  get message() { return this.getAttribute('message'); }
  set message(v) { this.setAttribute('message', v); }
}

customElements.define('glk-status', GlkStatus);
export { GlkStatus };
