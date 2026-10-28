import { GlkElement } from './base.js';
import { a as attachSortable } from './shared/sortable-DxyHuCmj.js';
import { k as keepFocus } from './shared/keep-focus-Bvq6y1D0.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// sortable (since 1.32.0): the items can be reordered by mouse, touch and
// keyboard; lists with the same group exchange items, and drop them onto
// breadcrumbs of that group. See sortable.js for the events. An item with `container` takes a
// dropped item inside it (a submenu): that level is not in this list, so
// the page moves it. `messages` translates the announcements.
//
// Single items change in place (since 1.32.0): the page appends, removes,
// moves and updates items with the DOM's own methods, without rendering the
// list again; an item moves as the same element and the focus stays on it,
// or, where it went, goes to its neighbour. highlight() on an item flashes
// it.
//
// grid (since 1.34.0) lays the items out as tiles side by side, each a
// pane of glass of its own (GlassKit's .glass-list--grid and
// .glass-list__item--tile): components, apps, choices. Sorted, they move
// on the horizontal axis, and an item with `container` takes one dropped
// in its middle. handle="start" (since 1.34.0) puts the handle of every
// item before its icon; an item's own handle attribute wins.

class GlkList extends GlkElement {
  static get observedAttributes() {
    return ['flush', 'bare', 'header', 'sortable', 'group', 'handle', 'grid'];
  }

  render() {
    // Optional section header — sits before the <ul>.
    this._header = this.createElement('div', ['glass-list__section-header'], { part: 'header' });
    const initialHeader = this.getAttribute('header') || '';
    this._header.textContent = initialHeader;
    this._header.hidden = !initialHeader;
    this._wrapper.appendChild(this._header);

    this._ul = this.createElement('ul', ['glass-list'], { part: 'list' });
    if (this.getBoolAttr('flush')) this._ul.classList.add('glass-list--flush');
    if (this.getBoolAttr('bare')) this._ul.classList.add('glass-list--bare');
    if (this.getBoolAttr('grid')) this._ul.classList.add('glass-list--grid');
    this._ul.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._ul);
  }

  setupEvents() {
    this._syncLast();
    this._mutObserver = new MutationObserver(() => {
      this._syncLast();
      this._sort?.sync();
    });
    this._mutObserver.observe(this, { childList: true });
    this._onKeydown = (e) => {
      const item = e.composedPath().find(n => n.localName === 'glk-list-item' && n.parentElement === this);
      if (item) this._sort?.keydown(e, item);
    };
    this.addEventListener('keydown', this._onKeydown);
    this._keep = keepFocus(this, {
      isItem: (n) => n.localName === 'glk-list-item' && n.parentElement === this,
      focusOf: (item) => (item._item && item._item.tabIndex >= 0 ? item._item : null),
      shown: (item) => !item.hidden,
    });
    this._applySortable();
  }

  teardownEvents() {
    this._mutObserver?.disconnect();
    this._keep?.destroy();
    this._keep = null;
    this.removeEventListener('keydown', this._onKeydown);
    this._sort?.destroy();
    this._sort = null;
  }

  _items() {
    return [...this.children].filter(el => el.localName === 'glk-list-item' && !el.hidden);
  }

  _applySortable() {
    const on = this.getBoolAttr('sortable') && this.isConnected;
    if (on && !this._sort) {
      this._sort = attachSortable(this, {
        owns: (item) => item.localName === 'glk-list-item' && item.parentElement === this,
        items: () => this._items(),
        rowOf: (item) => item.shadowRoot?.querySelector('.glass-list__item'),
        focusOf: (item) => item.shadowRoot?.querySelector('.glass-list__item'),
        containerOf: () => this,
        childrenOf: (container) => (container === this ? this._items() : []),
        canContain: (item) => item.hasAttribute('container'),
        nameOf: (container) => (container === this ? this.header || this.getAttribute('aria-label') || 'list' : container.title),
        // Into a container item: that level is elsewhere, the page moves it.
        insert: (container, item, ref) => (container === this ? this.insertBefore(item, ref) && undefined : false),
        mark: (item, messages) => item._setSortable?.(messages),
      });
    } else if (!on && this._sort) {
      this._sort.destroy();
      this._sort = null;
    }
  }

  _syncLast() {
    const items = this.querySelectorAll(':scope > glk-list-item');
    const lastIndex = items.length - 1;
    items.forEach((item, i) => {
      if (i === lastIndex) item.setAttribute('data-last', '');
      else item.removeAttribute('data-last');
    });
  }

  onAttributeChanged(name) {
    if (!this._ul) return;
    switch (name) {
      case 'flush':
        this._ul.classList.toggle('glass-list--flush', this.getBoolAttr('flush'));
        break;
      case 'bare':
        this._ul.classList.toggle('glass-list--bare', this.getBoolAttr('bare'));
        break;
      case 'sortable':
        this._applySortable();
        break;
      case 'handle':
        for (const item of this.querySelectorAll(':scope > glk-list-item')) item._applyHandle?.();
        break;
      case 'grid':
        this._ul.classList.toggle('glass-list--grid', this.getBoolAttr('grid'));
        for (const item of this.querySelectorAll(':scope > glk-list-item')) item._applyTile?.();
        break;
      case 'group':
        // A new group: join it afresh.
        if (this._sort) { this._sort.destroy(); this._sort = null; this._applySortable(); }
        break;
      case 'header': {
        const value = this.getAttribute('header') || '';
        this._header.textContent = value;
        this._header.hidden = !value;
        break;
      }
    }
  }

  get flush() { return this.getBoolAttr('flush'); }
  set flush(v) { this.setBoolAttr('flush', v); }

  get bare() { return this.getBoolAttr('bare'); }
  set bare(v) { this.setBoolAttr('bare', v); }

  get grid() { return this.getBoolAttr('grid'); }
  set grid(v) { this.setBoolAttr('grid', v); }

  get sortable() { return this.getBoolAttr('sortable'); }
  set sortable(v) { this.setBoolAttr('sortable', v); }

  /** Where the items' handles stand, unless an item says otherwise: "start" or "end". */
  get handle() { return this.getAttribute('handle') === 'start' ? 'start' : 'end'; }
  set handle(v) {
    if (v === 'start' || v === 'end') this.setAttribute('handle', v);
    else this.removeAttribute('handle');
  }

  /** The texts of the announcements, translated (see SORT_MESSAGES); the items take them at once. */
  get messages() { return this._messages ?? null; }
  set messages(v) {
    this._messages = v || null;
    this._sort?.sync();
  }

  get group() { return this.getAttribute('group') || ''; }
  set group(v) {
    if (v) this.setAttribute('group', v);
    else this.removeAttribute('group');
  }

  get header() { return this.getAttribute('header') || ''; }
  set header(v) {
    if (v) this.setAttribute('header', v);
    else this.removeAttribute('header');
  }
}

customElements.define('glk-list', GlkList);

export { GlkList };
