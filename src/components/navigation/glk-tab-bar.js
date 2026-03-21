import { GlkElement } from '../../base.js';

class GlkTabBar extends GlkElement {
  render() {
    const nav = this.createElement('nav', ['glass-tab-bar']);
    nav.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(nav);
  }

  setupEvents() {
    // Listen for tab selection events from child glk-tab-item elements
    this._onTabSelect = (e) => {
      // Deactivate all other tabs
      const items = this.querySelectorAll('glk-tab-item');
      items.forEach(item => {
        if (item !== e.target) {
          item.removeAttribute('active');
        }
      });
      this.emit('glk-tab-change', { tab: e.target });
    };
    this.addEventListener('glk-tab-select', this._onTabSelect);
  }

  teardownEvents() {
    this.removeEventListener('glk-tab-select', this._onTabSelect);
  }
}

customElements.define('glk-tab-bar', GlkTabBar);
export { GlkTabBar };
