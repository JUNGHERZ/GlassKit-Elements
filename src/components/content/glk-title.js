import { GlkElement } from '../../base.js';

class GlkTitle extends GlkElement {
  static get observedAttributes() {
    return [];
  }

  render() {
    const el = this.createElement('div', ['glass-title']);
    el.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(el);
  }
}

customElements.define('glk-title', GlkTitle);
export { GlkTitle };
