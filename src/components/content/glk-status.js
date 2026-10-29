import { GlkElement } from '../../base.js';

// A status line. Since 1.35.0 the message may be the element's content,
// with markup — "Included in your package <b>Premium</b>" —; `message` stays
// the short form for plain text and shows while the content is empty
// (whitespace does not count). GlassKit's --gl-status-color sets the
// message's colour. Parts since 1.35.0: status, message.

class GlkStatus extends GlkElement {
  static get observedAttributes() {
    return ['message'];
  }

  render() {
    this._container = this.createElement('div', ['glass-status'], { part: 'status' });

    // Icon via slot
    this._iconSlot = this.createElement('span', []);
    this._iconSlot.appendChild(this.createElement('slot', [], { name: 'icon' }));

    // Message: the attribute's text, or what is slotted in its place
    this._messageEl = this.createElement('p', [], { part: 'message' });
    this._messageText = document.createTextNode(this.getAttribute('message') || '');
    this._messageSlot = document.createElement('slot');
    this._messageEl.append(this._messageText, this._messageSlot);

    this._container.appendChild(this._iconSlot);
    this._container.appendChild(this._messageEl);
    this._wrapper.appendChild(this._container);
  }

  setupEvents() {
    this._onSlotChange = () => this._applyMessage();
    this._messageSlot.addEventListener('slotchange', this._onSlotChange);
    this._applyMessage();
  }

  teardownEvents() {
    this._messageSlot?.removeEventListener('slotchange', this._onSlotChange);
  }

  /** The content wins over `message` as soon as it holds more than whitespace. */
  _applyMessage() {
    const content = this._messageSlot.assignedNodes().some(n => n.nodeType === Node.ELEMENT_NODE || n.textContent.trim());
    this._messageText.data = content ? '' : (this.getAttribute('message') || '');
  }

  onAttributeChanged(name) {
    if (name === 'message' && this._messageEl) this._applyMessage();
  }

  get message() { return this.getAttribute('message'); }
  set message(v) { this.setAttribute('message', v); }
}

customElements.define('glk-status', GlkStatus);
export { GlkStatus };
