import { GlkElement } from './base.js';
import { a as attachSortable } from './shared/sortable-DxyHuCmj.js';
import { k as keepFocus } from './shared/keep-focus-Bvq6y1D0.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// A tree with levels that open and close (since 1.32.0) — GlassKit's
// .glass-tree: the structure of an app, menus with submenus. The levels
// are nested <glk-tree-item> elements.
//
// As in the WAI-ARIA tree view: role="tree" named by `label`, one tab stop
// (the selected item, else the first), and the keyboard — Down and Up to
// the next and previous visible item, Right opens an item or moves to its
// first child, Left closes it or moves to its parent (mirrored right to
// left), Home and End to the first and last visible item, Enter and Space
// select (selection does not follow the focus), * opens every sibling, a
// typed letter moves to the next item that starts with it. A click on a
// row selects it, a click on its twisty opens or closes it.
//
// The events are cancelable and come before anything changes:
// glk-tree-toggle { item, expanded }, glk-tree-select { item, value }, and
// glk-tree-load { item, retry } when an item with has-children opens whose
// children have not loaded — it shows that it is loading (aria-busy) until
// the page appends children or removes has-children, once: closed and
// opened again it keeps them. load-error on the item reports a failure; the
// tree says so, and opening the item again tries once more (retry: true).
// Cancelled, the item does not wait for children.
//
// Single items change in place: the page appends, removes, moves and
// renames items with the DOM's own methods, without rendering the tree
// again — expanded levels, the selection and the scroll position stay, an
// item moves as the same element, and the focus stays on it (or, where it
// went, on its neighbour or the open item around it). highlight() on an
// item flashes it.
//
// Attributes: label, selection (single | none), sortable, group
// Properties: value (the selected item's), items (the top level)
// Events:     glk-tree-toggle, glk-tree-select, glk-tree-load, and the
//             glk-sort-* events of a sortable tree
// Part:       tree

const ITEM = 'glk-tree-item';

class GlkTree extends GlkElement {
  static get observedAttributes() { return ['label', 'selection', 'sortable', 'group']; }

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = 'tree';
  }

  render() {
    this._list = this.createElement('div', ['glass-tree'], { part: 'tree' });
    this._list.appendChild(document.createElement('slot'));
    // What happened out of sight: children that could not load.
    this._live = this.createElement('div', [], { 'aria-live': 'polite' });
    this._live.style.cssText = 'position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
    this._wrapper.append(this._list, this._live);
    this._applyLabel();
  }

  setupEvents() {
    this._observer = new MutationObserver(() => this._changed());
    this._observer.observe(this, { childList: true, subtree: true });
    this._onClick = (e) => this._click(e);
    this._onKeydown = (e) => this._keydown(e);
    this._onFocusIn = (e) => {
      const item = this._itemOf(e);
      if (item) this._rove(item);
    };
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeydown);
    this.addEventListener('focusin', this._onFocusIn);
    this._keep = keepFocus(this, {
      isItem: (n) => n.localName === ITEM && n.closest('glk-tree') === this,
      focusOf: (item) => item,
      shown: (item) => this._shown(item),
    });
    this._changed();
    this._applySortable();
  }

  teardownEvents() {
    this._observer?.disconnect();
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeydown);
    this.removeEventListener('focusin', this._onFocusIn);
    this._keep?.destroy();
    this._keep = null;
    this._sort?.destroy();
    this._sort = null;
  }

  onAttributeChanged(name) {
    if (name === 'label') this._applyLabel();
    else if (name === 'sortable') this._applySortable();
    else if (name === 'group') {
      if (this._sort) { this._sort.destroy(); this._sort = null; this._applySortable(); }
    } else this._changed();
  }

  /**
   * sortable: the items move within their level, into another item and out
   * of it, by mouse, touch and keyboard — Space picks up (Enter selects
   * then), Right moves into the item above, Left out to the level above.
   * Items with children, or with `container`, take others inside them; a
   * closed one opens after a moment under the dragged item.
   */
  _applySortable() {
    const on = this.getBoolAttr('sortable') && this.isConnected;
    if (on && !this._sort) {
      this._sort = attachSortable(this, {
        owns: (item) => item.localName === ITEM && item.closest('glk-tree') === this,
        items: () => this._visible(),
        rowOf: (item) => item._row,
        focusOf: (item) => item,
        containerOf: (item) => (item.parentElement?.localName === ITEM ? item.parentElement : this),
        childrenOf: (container) => this._childrenOf(container),
        canContain: (item) => item.hasAttribute('container') || item.hasChildren,
        nameOf: (container) => (container === this ? this.label || 'tree' : container.label),
        open: (item) => { if (!item.expanded) this._toggle(item, true); },
        insert: (container, item, ref) => {
          // Dropped into a level that is loading: not one of the children it waits for.
          if (container._loading && item.parentElement !== container) container._loading.count++;
          container.insertBefore(item, ref);
        },
        mark: (item, messages) => item._setSortable?.(messages),
      });
    } else if (!on && this._sort) {
      this._sort.destroy();
      this._sort = null;
    }
  }

  _applyLabel() {
    this._internals.ariaLabel = this.getAttribute('label') || null;
  }

  /** The tree's own items, depth first. */
  _all() {
    return [...this.querySelectorAll(ITEM)].filter(item => item.closest('glk-tree') === this);
  }

  _childrenOf(parent) {
    return [...parent.children].filter(el => el.localName === ITEM && !el.hidden);
  }

  /** Whether an item can be seen: every item around it open. */
  _shown(item) {
    if (item.hidden) return false;
    for (let n = item.parentElement; n && n !== this; n = n.parentElement) {
      if (n.localName === ITEM && (!n.expanded || n.hidden)) return false;
    }
    return true;
  }

  /** The items a reader can see: those whose ancestors are all open. */
  _visible() {
    const out = [];
    const walk = (parent) => {
      for (const item of this._childrenOf(parent)) {
        out.push(item);
        if (item.expanded) walk(item);
      }
    };
    walk(this);
    return out;
  }

  /** Levels, sizes and positions change with the children: once per task. */
  _changed() {
    if (this._pending) return;
    this._pending = true;
    queueMicrotask(() => {
      this._pending = false;
      if (this.isConnected) this._refresh();
    });
  }

  _refresh() {
    // Children that arrived for an item that was loading: loaded.
    for (const item of this._all()) {
      if (item._loading && item.items.length > item._loading.count) item._finishLoad();
    }
    const selectable = this.selection !== 'none';
    const place = (parent, level) => {
      const items = this._childrenOf(parent);
      items.forEach((item, i) => {
        // One not rendered yet places itself once it is.
        if (item._row) {
          item._place({ level, size: items.length, pos: i + 1, selectable });
          item._apply();
        }
        place(item, level + 1);
      });
    };
    place(this, 1);
    const visible = this._visible();
    if (!visible.includes(this._focusable)) {
      this._focusable = visible.find(item => item.selected && !item.disabled) || visible[0] || null;
    }
    for (const item of this._all()) item.tabIndex = item === this._focusable ? 0 : -1;
    this._sort?.sync();
  }

  /** The tab stop moves with the focus. */
  _rove(item) {
    if (item === this._focusable) return;
    if (this._focusable) this._focusable.tabIndex = -1;
    item.tabIndex = 0;
    this._focusable = item;
  }

  _itemOf(e) {
    const item = e.composedPath().find(n => n.localName === ITEM);
    return item && item.closest('glk-tree') === this ? item : null;
  }

  _toggle(item, expand = !item.expanded) {
    if (!item.hasChildren || expand === item.expanded) return false;
    if (!this.emit('glk-tree-toggle', { item, expanded: expand }, { cancelable: true })) return false;
    item.expanded = expand;
    if (expand) this._load(item);
    return true;
  }

  /**
   * Children still to come and not asked for yet: glk-tree-load, then the
   * item loads until they arrive, has-children goes or load-error comes.
   * After a load-error, the next opening tries again.
   */
  _load(item) {
    if (!item.hasAttribute('has-children') || item._loaded || item._loading) return;
    const retry = item.hasAttribute('load-error');
    if (retry) item.removeAttribute('load-error');
    const count = item.items.length;
    if (!this.emit('glk-tree-load', { item, retry }, { cancelable: true })) return;
    // Filled right away, from a cache: nothing to wait for.
    if (item.items.length > count || !item.hasAttribute('has-children')) item._finishLoad();
    else {
      item._loading = { count };
      item._apply();
    }
  }

  /** load-error on an item: said in the live region. */
  _loadFailed(item) {
    if (!this._live) return;
    const text = `${item.label}: ${item.getAttribute('load-error') || 'Could not load.'}`;
    this._live.textContent = '';
    requestAnimationFrame(() => { this._live.textContent = text; });
  }

  _select(item) {
    if (item.disabled) return;
    if (!this.emit('glk-tree-select', { item, value: item.value }, { cancelable: true })) return;
    if (this.selection === 'none') return;
    for (const other of this._all()) if (other !== item && other.selected) other.selected = false;
    item.selected = true;
  }

  _click(e) {
    const item = this._itemOf(e);
    if (!item || this._sort?.dragging) return;
    const path = e.composedPath();
    // Something in the trailing slot — an action button — is the page's.
    if (path.some(n => n.classList?.contains('glass-tree__trailing'))) return;
    item.focus({ preventScroll: true });
    if (path.some(n => n.classList?.contains('glass-tree__twisty'))) this._toggle(item);
    else this._select(item);
  }

  _keydown(e) {
    const item = this._itemOf(e);
    if (!item) return;
    if (this._sort?.keydown(e, item)) return;
    if (e.composedPath()[0] !== item) return;      // keys of a control inside are its own
    const visible = this._visible(), i = visible.indexOf(item);
    const go = (next) => {
      e.preventDefault();
      next?.focus();
    };
    const rtl = getComputedStyle(this).direction === 'rtl';
    switch (e.key) {
      case 'ArrowDown': go(visible[i + 1]); break;
      case 'ArrowUp': go(visible[i - 1]); break;
      case 'Home': go(visible[0]); break;
      case 'End': go(visible[visible.length - 1]); break;
      case 'ArrowRight':
      case 'ArrowLeft': {
        e.preventDefault();
        const forward = (e.key === 'ArrowRight') !== rtl;
        if (forward) {
          if (item.hasChildren && !item.expanded) this._toggle(item, true);
          else if (item.expanded) item.items[0]?.focus();
        } else if (item.hasChildren && item.expanded) {
          this._toggle(item, false);
        } else {
          const parent = item.parentElement?.closest(ITEM);
          if (parent && parent.closest('glk-tree') === this) parent.focus();
        }
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        this._select(item);
        break;
      case '*': {
        e.preventDefault();
        const parent = item.parentElement;
        for (const sibling of this._childrenOf(parent)) if (sibling.hasChildren && !sibling.expanded) this._toggle(sibling, true);
        break;
      }
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const key = e.key.toLowerCase();
          const order = [...visible.slice(i + 1), ...visible.slice(0, i + 1)];
          const hit = order.find(other => other.label.toLowerCase().startsWith(key));
          if (hit) go(hit);
        }
    }
  }

  /** The tree's tab stop takes the focus. */
  focus(options) {
    (this._focusable || this._visible()[0])?.focus(options);
  }

  get items() { return this._childrenOf(this); }

  get sortable() { return this.getBoolAttr('sortable'); }
  set sortable(v) { this.setBoolAttr('sortable', v); }

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

  get value() { return this._all().find(item => item.selected)?.value ?? ''; }

  get selection() { return this.getAttribute('selection') === 'none' ? 'none' : 'single'; }
  set selection(v) { this.setAttribute('selection', v === 'none' ? 'none' : 'single'); }

  get label() { return this.getAttribute('label') || ''; }
  set label(v) {
    if (v) this.setAttribute('label', v);
    else this.removeAttribute('label');
  }
}

customElements.define('glk-tree', GlkTree);

export { GlkTree };
