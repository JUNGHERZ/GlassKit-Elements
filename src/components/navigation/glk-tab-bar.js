import { GlkElement } from '../../base.js';
import { attachDroplet } from '@jungherz-de/glasskit/glasskit-droplet.js';

// droplet (since 1.27.0): the active item sits on a drop of glass that glides
// to the next one and can be dragged — GlassKit's .glass-tab-bar--droplet,
// moved by its glasskit-droplet.js. The items live in shadow roots of their
// own, so the bar hands its state down to them (see glk-tab-item _syncBar)
// and tells the drop when the active item changed.
//
// One set of items in more places than the bottom edge (since 1.32.0):
// orientation="vertical" makes the bar a column — a sidebar placed by the
// page's layout, or with dock="start" or "end" fixed to that edge of the
// viewport, clear of its safe area: the side a phone's thumb reaches when
// the system moves its controls there. rail shows the icons alone; the
// label stays the item's name and shows in a tooltip. placement="top" lays
// a horizontal bar out for the top of a page. The drop runs along y in a
// column. The page switches between the layouts with a media query or on
// resize, without rendering the items again.
//
// Since 1.33.0 rail="labels" keeps the label under the icon, as on the
// floating bar: a desktop rail that names its items. floating with
// orientation="vertical" and dock makes the rail a pane of its own glass at
// that edge, full height and inset from it. slot="leading" holds a mark or
// the accessory before the items — above them in a column — and
// slot="trailing" a foot such as the account after them.
//
// Attributes: static, floating, droplet, orientation (horizontal | vertical),
//             rail (or rail="labels"), dock (start | end; with vertical),
//             placement (bottom | top), label (the navigation's name)
// Slots:      default (glk-tab-item), leading, trailing (since 1.33.0)
// Events:     glk-tab-change { tab } — after a glk-tab-select went through
// Parts:      nav (since 1.32.0), leading, trailing (since 1.33.0)

const DOCKS = ['start', 'end'];

class GlkTabBar extends GlkElement {
  static get observedAttributes() {
    return ['static', 'floating', 'droplet', 'orientation', 'rail', 'dock', 'placement', 'label'];
  }

  render() {
    const nav = this.createElement('nav', ['glass-tab-bar'], { part: 'nav' });
    this._leading = this._createPlace('leading');
    this._trailing = this._createPlace('trailing');
    nav.append(this._leading, document.createElement('slot'), this._trailing);
    this._wrapper.appendChild(nav);
    this._nav = nav;

    if (this.getBoolAttr('floating')) {
      nav.classList.add('glass-tab-bar--floating');
    }
    nav.classList.toggle('glass-tab-bar--droplet', this.getBoolAttr('droplet'));
    this._applyLayout();
    this._applyLabel();
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
    } else if (name === 'label') {
      this._applyLabel();
    } else {
      this._applyLayout();
      this._syncItems();
      this._droplet?.update();
    }
  }

  /** A place before or after the items, shown once something is in it. */
  _createPlace(name) {
    const place = this.createElement('div', [`glass-tab-bar__${name}`], { part: name, hidden: '' });
    const slot = this.createElement('slot', [], { name });
    slot.addEventListener('slotchange', () => { place.hidden = slot.assignedNodes().length === 0; });
    place.appendChild(slot);
    return place;
  }

  get _layout() {
    const vertical = this.orientation === 'vertical';
    const dock = this.getAttribute('dock');
    const rail = vertical && this.getBoolAttr('rail');
    return {
      vertical,
      rail,
      labels: rail && this.getAttribute('rail') === 'labels',
      dock: vertical && DOCKS.includes(dock) ? dock : null,
      top: !vertical && this.getAttribute('placement') === 'top',
    };
  }

  _applyLayout() {
    const { vertical, rail, labels, dock, top } = this._layout;
    const nav = this._nav;
    nav.classList.toggle('glass-tab-bar--vertical', vertical);
    nav.classList.toggle('glass-tab-bar--rail', rail);
    nav.classList.toggle('glass-tab-bar--labels', labels);
    for (const d of DOCKS) nav.classList.toggle(`glass-tab-bar--${d}`, dock === d);
    nav.classList.toggle('glass-tab-bar--top', top);
    this._applyStatic();
  }

  /** static: in the flow, with corners — a bottom bar's look on a page. */
  _applyStatic() {
    const on = this.getBoolAttr('static');
    const { vertical, top } = this._layout;
    this._nav.style.position = on && !vertical ? 'relative' : '';
    this._nav.style.borderRadius = on && !vertical && !top ? '16px' : '';
  }

  _applyLabel() {
    const label = this.getAttribute('label');
    if (label) this._nav.setAttribute('aria-label', label);
    else this._nav.removeAttribute('aria-label');
  }

  _items() {
    return [...this.children].filter(el => el.localName === 'glk-tab-item');
  }

  /** Hands the bar's look and droplet state to every item's wrapper. */
  _syncItems() {
    const state = {
      floating: this.getBoolAttr('floating'),
      droplet: this.getBoolAttr('droplet'),
      placed: Boolean(this._nav?.hasAttribute('data-droplet')),
      drag: Boolean(this._nav?.hasAttribute('data-droplet-drag')),
      ...(this._nav ? this._layout : {}),
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

  get orientation() { return this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'horizontal'; }
  set orientation(v) {
    if (v === 'vertical') this.setAttribute('orientation', 'vertical');
    else this.removeAttribute('orientation');
  }

  /** true, false, or "labels" for a rail that keeps its labels. */
  get rail() { return this.getAttribute('rail') === 'labels' ? 'labels' : this.getBoolAttr('rail'); }
  set rail(v) {
    if (v === 'labels') this.setAttribute('rail', 'labels');
    else this.setBoolAttr('rail', v);
  }

  get dock() { return DOCKS.includes(this.getAttribute('dock')) ? this.getAttribute('dock') : ''; }
  set dock(v) {
    if (DOCKS.includes(v)) this.setAttribute('dock', v);
    else this.removeAttribute('dock');
  }

  get placement() { return this.getAttribute('placement') === 'top' ? 'top' : 'bottom'; }
  set placement(v) {
    if (v === 'top') this.setAttribute('placement', 'top');
    else this.removeAttribute('placement');
  }

  get label() { return this.getAttribute('label') || ''; }
  set label(v) {
    if (v) this.setAttribute('label', v);
    else this.removeAttribute('label');
  }
}

customElements.define('glk-tab-bar', GlkTabBar);
export { GlkTabBar };
