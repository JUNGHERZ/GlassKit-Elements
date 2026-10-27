import { GlkElement } from '../../base.js';

// An item of <glk-tree> (since 1.32.0): GlassKit's .glass-tree__row with its
// children, nested <glk-tree-item> elements, in a .glass-tree__group below.
// The label is `label`; slot="icon" goes before it, slot="trailing" after
// it — a badge, a status, an action. has-children says that children are
// still to come: the item shows the twisty and aria-expanded="false" before
// any of them exists, and loads them when it opens (see glk-tree-load) —
// once; closed and opened again it keeps them. load-error reports that
// they could not load: the item closes and shows it, its text becomes the
// item's description, and opening it again tries once more. highlight()
// flashes the row, for an item that changed elsewhere.
//
// The role and states sit on the element itself (ElementInternals), set by
// the tree: treeitem, aria-level, aria-setsize, aria-posinset — the browser
// cannot count them through the slots — aria-expanded, aria-selected,
// aria-disabled and aria-busy while children load. The item is named by its
// label alone, not by its children's text.
//
// Attributes: label, value, expanded, selected, disabled, has-children,
//             load-error, container and no-drag (for a sortable tree)
// Methods:    highlight()
// Slots:      default (child items), icon, trailing, handle (where a drag
//             starts in a sortable tree)
// Parts:      item, row, twisty, label, group

const TWISTY = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>';

const sheet = new CSSStyleSheet();
sheet.replaceSync(`
  :host { display: block; outline: none; }
  :host(:focus-visible) .glass-tree__row { box-shadow: inset 0 0 0 2px var(--gl-border-focus); }
`);

class GlkTreeItem extends GlkElement {
  static get observedAttributes() { return ['label', 'expanded', 'selected', 'disabled', 'has-children', 'load-error']; }

  static get hostStyles() { return sheet; }

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = 'treeitem';
  }

  render() {
    this._item = this.createElement('div', ['glass-tree__item'], { part: 'item' });
    this._row = this.createElement('div', ['glass-tree__row'], { part: 'row' });
    this._twisty = this.createElement('span', ['glass-tree__twisty'], { part: 'twisty', 'aria-hidden': 'true' });
    this._twisty.innerHTML = TWISTY;
    this._icon = this.createElement('span', ['glass-tree__icon']);
    this._iconSlot = this.createElement('slot', [], { name: 'icon' });
    this._icon.appendChild(this._iconSlot);
    this._labelEl = this.createElement('span', ['glass-tree__label'], { part: 'label' });
    this._trailing = this.createElement('span', ['glass-tree__trailing']);
    this._trailingSlot = this.createElement('slot', [], { name: 'trailing' });
    this._trailing.appendChild(this._trailingSlot);
    this._handle = this.createElement('span', ['glass-sort__handle']);
    this._handleSlot = this.createElement('slot', [], { name: 'handle' });
    this._handle.appendChild(this._handleSlot);
    this._row.append(this._twisty, this._icon, this._labelEl, this._trailing, this._handle);
    this._group = this.createElement('div', ['glass-tree__group'], { part: 'group', role: 'group' });
    this._group.appendChild(document.createElement('slot'));
    this._item.append(this._row, this._group);
    this._wrapper.appendChild(this._item);
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
    this._apply();
  }

  setupEvents() {
    this._onSlotChange = () => this._applySlots();
    this._iconSlot.addEventListener('slotchange', this._onSlotChange);
    this._trailingSlot.addEventListener('slotchange', this._onSlotChange);
    this._handleSlot.addEventListener('slotchange', this._onSlotChange);
    this._applySlots();
    this._tree()?._changed();
  }

  teardownEvents() {
    this._iconSlot?.removeEventListener('slotchange', this._onSlotChange);
    this._trailingSlot?.removeEventListener('slotchange', this._onSlotChange);
    this._handleSlot?.removeEventListener('slotchange', this._onSlotChange);
  }

  onAttributeChanged(name, old, value) {
    if (name === 'has-children') {
      if (value === null && this._loading) this._finishLoad();   // nothing more to come
      else if (old === null && value !== null) this._loaded = false;   // to load (again)
    } else if (name === 'load-error' && value !== null) {
      this._loading = null;
      this._loaded = false;
      if (this.expanded) this.expanded = false;
      this._tree()?._loadFailed?.(this);
    }
    if (!this._row) return;
    this._apply();
    this._tree()?._changed();
  }

  /** Children arrived, or has-children went: loaded. */
  _finishLoad() {
    this._loading = null;
    this._loaded = true;
    if (this._row) this._apply();
  }

  _tree() { return this.closest('glk-tree'); }

  _applySlots() {
    this._icon.hidden = this._iconSlot.assignedNodes().length === 0;
    this._trailing.hidden = this._trailingSlot.assignedNodes().length === 0;
    this._handle.hidden = this._handleSlot.assignedNodes().length === 0;
  }

  /** Called by a sortable tree: how to move the item, or null. */
  _setSortable(messages) {
    this._sortText = messages ? messages.instructions : null;
    this._applyDescription();
  }

  /** The description: why the children did not load, how to move the item. */
  _applyDescription() {
    const error = this.hasAttribute('load-error') ? (this.getAttribute('load-error') || 'Could not load.') : '';
    const text = [error, this._sortText].filter(Boolean).join(' ') || null;
    if ('ariaDescription' in this._internals) this._internals.ariaDescription = text;
    else if (text) this.setAttribute('aria-description', text);
    else this.removeAttribute('aria-description');
  }

  /** The child items, in order. */
  get items() { return [...this.children].filter(el => el.localName === 'glk-tree-item' && !el.hidden); }

  /** Children, or children to load. */
  get hasChildren() { return this.items.length > 0 || this.getBoolAttr('has-children'); }

  _apply() {
    const label = this.getAttribute('label') || '';
    this._labelEl.textContent = label;
    this._internals.ariaLabel = label;
    const parent = this.hasChildren, expanded = parent && this.expanded;
    this._internals.ariaExpanded = parent ? String(expanded) : null;
    this._internals.ariaDisabled = this.disabled ? 'true' : null;
    this._row.classList.toggle('is-expanded', expanded);
    this._row.classList.toggle('is-leaf', !parent);
    this._row.classList.toggle('is-disabled', this.disabled);
    this._group.hidden = !expanded;
    this._applyLoading();
  }

  /** Loading since glk-tree-load, or failed with load-error. */
  _applyLoading() {
    const loading = Boolean(this._loading);
    this._internals.ariaBusy = loading ? 'true' : null;
    this._row?.classList.toggle('is-loading', loading);
    this._row?.classList.toggle('is-error', this.hasAttribute('load-error'));
    this._applyDescription();
  }

  /**
   * A short flash of the row, for an item that changed elsewhere — on
   * another device, by an undo — so the eye finds it (GlassKit's .is-flash);
   * none under prefers-reduced-motion.
   */
  highlight() {
    const row = this._row;
    if (!row) return;
    row.classList.remove('is-flash');
    void row.offsetWidth;                                  // again from the start
    row.classList.add('is-flash');
    clearTimeout(this._flashTimer);
    const end = (e) => {
      if (e && (e.target !== row || e.animationName !== 'glass-flash')) return;
      clearTimeout(this._flashTimer);
      row.classList.remove('is-flash');
      row.removeEventListener('animationend', end);
    };
    row.addEventListener('animationend', end);
    this._flashTimer = setTimeout(end, (parseFloat(getComputedStyle(row).animationDuration) || 0) * 1000 + 100);
  }

  /** Set by the tree. */
  _place({ level, size, pos, selectable }) {
    this._internals.ariaLevel = String(level);
    this._internals.ariaSetSize = String(size);
    this._internals.ariaPosInSet = String(pos);
    this._internals.ariaSelected = selectable ? String(this.selected) : null;
    this._row?.classList.toggle('is-selected', selectable && this.selected);
    this._row?.style.setProperty('--gl-tree-level', String(level));
    this._level = level;
  }

  get level() { return this._level || 1; }

  get label() { return this.getAttribute('label') || ''; }
  set label(v) { this.setAttribute('label', v ?? ''); }

  get value() { return this.getAttribute('value') ?? this.label; }
  set value(v) { this.setAttribute('value', v); }

  get expanded() { return this.getBoolAttr('expanded'); }
  set expanded(v) { this.setBoolAttr('expanded', v); }

  get selected() { return this.getBoolAttr('selected'); }
  set selected(v) { this.setBoolAttr('selected', v); }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }

  get loadError() { return this.getAttribute('load-error'); }
  set loadError(v) {
    if (v == null || v === false) this.removeAttribute('load-error');
    else this.setAttribute('load-error', v === true ? '' : String(v));
  }

  /** Whether glk-tree-load is pending: children asked for, not there yet. */
  get loading() { return Boolean(this._loading); }
}

customElements.define('glk-tree-item', GlkTreeItem);
export { GlkTreeItem };
