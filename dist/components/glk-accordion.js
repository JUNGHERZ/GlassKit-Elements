import { G as GlkElement } from './shared/base-BoN33KPe.js';

class GlkAccordion extends GlkElement {
  render() {
    const container = this.createElement('div', ['glass-accordion']);
    container.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(container);
  }
}

customElements.define('glk-accordion', GlkAccordion);

export { GlkAccordion };
