import { G as GlkElement } from './shared/base-BoN33KPe.js';

class GlkTabBar extends GlkElement {
  static get observedAttributes() {
    return ['static', 'floating'];
  }

  render() {
    const nav = this.createElement('nav', ['glass-tab-bar']);
    nav.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(nav);
    this._nav = nav;

    if (this.getBoolAttr('floating')) {
      nav.classList.add('glass-tab-bar--floating');
    }

    if (this.getBoolAttr('static')) {
      this._applyStatic();
    }
  }

  onAttributeChanged(name) {
    if (!this._nav) return;
    if (name === 'static') {
      this._applyStatic();
    } else if (name === 'floating') {
      this._nav.classList.toggle('glass-tab-bar--floating', this.getBoolAttr('floating'));
    }
  }

  _applyStatic() {
    this._nav.style.position = 'relative';
    this._nav.style.borderRadius = '16px';
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
