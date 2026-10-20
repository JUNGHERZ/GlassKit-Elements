import { GlkElement } from './base.js';
import { a as attachDroplet } from './shared/glasskit-droplet-3vJVXB3u.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// droplet (since 1.27.0): the active item sits on a drop of glass that glides
// to the next one and can be dragged — GlassKit's .glass-tab-bar--droplet,
// moved by its glasskit-droplet.js. The items live in shadow roots of their
// own, so the bar hands its state down to them (see glk-tab-item _syncBar)
// and tells the drop when the active item changed.

class GlkTabBar extends GlkElement {
  static get observedAttributes() {
    return ['static', 'floating', 'droplet'];
  }

  render() {
    const nav = this.createElement('nav', ['glass-tab-bar']);
    nav.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(nav);
    this._nav = nav;

    if (this.getBoolAttr('floating')) {
      nav.classList.add('glass-tab-bar--floating');
    }
    nav.classList.toggle('glass-tab-bar--droplet', this.getBoolAttr('droplet'));

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
      this._syncItems();
    } else if (name === 'droplet') {
      this._nav.classList.toggle('glass-tab-bar--droplet', this.getBoolAttr('droplet'));
      this._applyDroplet();
    }
  }

  _applyStatic() {
    this._nav.style.position = 'relative';
    this._nav.style.borderRadius = '16px';
  }

  _items() {
    return [...this.children].filter(el => el.localName === 'glk-tab-item');
  }

  /** Hands the bar's floating and droplet state to every item's wrapper. */
  _syncItems() {
    const state = {
      floating: this.getBoolAttr('floating'),
      droplet: this.getBoolAttr('droplet'),
      placed: Boolean(this._nav?.hasAttribute('data-droplet')),
      drag: Boolean(this._nav?.hasAttribute('data-droplet-drag')),
    };
    for (const item of this._items()) item._syncBar?.(state);
  }

  /** Called by an item that rendered or changed its active state. */
  _itemChanged() {
    this._syncItems();
    this._droplet?.update();
  }

  _applyDroplet() {
    const on = this.getBoolAttr('droplet') && this.isConnected;
    if (on && !this._droplet) {
      // The drop measures and marks the items' own buttons; picking one clicks
      // it, which is what a tap does.
      this._droplet = attachDroplet(this._nav, {
        items: () => this._items().map(item => item._btn).filter(Boolean),
      });
    } else if (!on && this._droplet) {
      this._droplet.destroy();
      this._droplet = null;
    }
    this._syncItems();
  }

  /**
   * Called by an item the user selected once its glk-tab-select went through
   * uncancelled; the item is active already. Until 1.27.0 the bar did this
   * while the event was still on its way, so a listener further up could not
   * have kept the current tab.
   */
  _selected(tab) {
    for (const item of this.querySelectorAll('glk-tab-item')) {
      if (item !== tab) item.removeAttribute('active');
    }
    this.emit('glk-tab-change', { tab });
  }

  setupEvents() {
    // The drop's state lives on the nav; the items carry it on their wrappers.
    this._navObserver = new MutationObserver(() => this._syncItems());
    this._navObserver.observe(this._nav, { attributes: true, attributeFilter: ['data-droplet', 'data-droplet-drag'] });
    // Items added or removed.
    this._itemObserver = new MutationObserver(() => this._itemChanged());
    this._itemObserver.observe(this, { childList: true });
    this._applyDroplet();
  }

  teardownEvents() {
    this._navObserver?.disconnect();
    this._itemObserver?.disconnect();
    this._droplet?.destroy();
    this._droplet = null;
  }

  // Properties as well (since 1.28.0): `bar.droplet = true` set an own
  // property before and changed nothing.
  get floating() { return this.getBoolAttr('floating'); }
  set floating(v) { this.setBoolAttr('floating', v); }

  get droplet() { return this.getBoolAttr('droplet'); }
  set droplet(v) { this.setBoolAttr('droplet', v); }
}

customElements.define('glk-tab-bar', GlkTabBar);

export { GlkTabBar };
