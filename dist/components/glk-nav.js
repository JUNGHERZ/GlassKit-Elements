import { G as GlkElement } from './shared/base-BoN33KPe.js';

class GlkNav extends GlkElement {
  render() {
    const nav = this.createElement('nav', ['glass-nav']);
    nav.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(nav);
  }
}

customElements.define('glk-nav', GlkNav);

export { GlkNav };
