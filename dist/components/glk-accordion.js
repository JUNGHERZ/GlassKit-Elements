import { G as GlkElement } from './shared/base-C0B1hgOt.js';

class GlkAccordion extends GlkElement {
  render() {
    const container = this.createElement('div', ['glass-accordion']);
    container.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(container);
  }
}

customElements.define('glk-accordion', GlkAccordion);

export { GlkAccordion };
