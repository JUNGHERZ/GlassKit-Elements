import { GlkElement } from '../../base.js';

// A line between groups of <glk-menu> items (since 1.32.0), role="separator"
// on the element itself — GlassKit's .glass-menu__separator.

class GlkMenuSeparator extends GlkElement {
  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = 'separator';
  }

  render() {
    this._wrapper.appendChild(this.createElement('div', ['glass-menu__separator']));
  }
}

customElements.define('glk-menu-separator', GlkMenuSeparator);
export { GlkMenuSeparator };
