import { G as GlkElement } from './shared/base-D7w9EVJi.js';

class GlkDivider extends GlkElement {
  render() {
    const hr = this.createElement('div', ['glass-divider']);
    this._wrapper.appendChild(hr);
  }
}

customElements.define('glk-divider', GlkDivider);

export { GlkDivider };
