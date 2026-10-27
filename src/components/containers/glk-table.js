import { GlkElement } from '../../base.js';

// A native <table class="glass-table"> in its light DOM, kept a table — its
// semantics, copy and paste, find in page, markup rendered on the server —
// with what a list of invoices or users needs around it (since 1.32.0):
//
// Sorting: a header cell with data-sort="<key>" gets a button inside it
// and aria-sort on itself (ascending, descending, none). A click, Enter or
// Space cycles the direction and emits glk-table-sort { key, direction },
// cancelable; the page sorts the rows — often on the server — and renders
// them, the element only shows the state. sort and direction set it.
//
// sticky-header: the wrap scrolls both ways, as high as
// --gl-table-max-height (60vh), and the header cells stick to its top on
// the header's own surface. The wrap's edges shade where more columns wait.
//
// Row actions: cells with class="glass-table__actions" stay at the row's
// end while the table scrolls sideways — a <glk-menu> or icon buttons with
// a <glk-tooltip>.
//
// Empty: while the body has no rows, the slot="empty" content (a
// <glk-empty>) shows below the header.
//
// list-below="640px": narrower than that — measured on the element, not
// the viewport — each row becomes a card with the column's name before each
// value; the element copies each header's text into its cells as
// data-label, and keeps the table's roles explicit so assistive technology
// still meets a table.
//
// Attributes: sort, direction (ascending | descending), sticky-header,
//             list-below
// Slots:      default (the table), empty
// Events:     glk-table-sort
// Parts:      wrap, empty

const ARROW = '<svg class="glass-table__sort-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
const DIRECTIONS = ['ascending', 'descending'];

/** Sets an attribute only where it changes: each write would wake the observer. */
function put(el, name, value) {
  if (value == null) { if (el.hasAttribute(name)) el.removeAttribute(name); }
  else if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

class GlkTable extends GlkElement {
  static get observedAttributes() { return ['sort', 'direction', 'sticky-header', 'list-below']; }

  static get observesLightDom() { return true; }

  render() {
    this._frame = this.createElement('div', ['glass-table-frame']);
    this._wrap = this.createElement('div', ['glass-table-wrap'], { part: 'wrap' });
    this._empty = this.createElement('div', ['glass-table__empty'], { part: 'empty' });
    this._emptySlot = this.createElement('slot', [], { name: 'empty' });
    this._empty.appendChild(this._emptySlot);
    this._wrap.append(document.createElement('slot'), this._empty);
    this._frame.appendChild(this._wrap);
    this._wrapper.appendChild(this._frame);
    this.projectLightDom();
  }

  get _table() { return this.querySelector(':scope > table'); }

  /** Everything the element adds to the table, again after each change. */
  projectLightDom() {
    const table = this._table;
    if (!table || !this._wrap) return;
    if (!table.classList.contains('glass-table')) table.classList.add('glass-table');
    // A table can grow wider than the element — longer rows, a column more —
    // while the element keeps its size: the edges follow the table too.
    if (this._resize && this._observed !== table) {
      if (this._observed) this._resize.unobserve(this._observed);
      this._resize.observe(table);
      this._observed = table;
    }
    this._applySort(table);
    this._applyLabels(table);
    this._applyEmpty(table);
    this._applyLayout(table);
    this._applyEdges();
  }

  _headers(table) { return [...(table.tHead?.rows[table.tHead.rows.length - 1]?.cells ?? [])]; }

  _applySort(table) {
    const key = this.getAttribute('sort');
    const direction = DIRECTIONS.includes(this.getAttribute('direction')) ? this.getAttribute('direction') : 'ascending';
    for (const th of this._headers(table)) {
      if (!th.dataset.sort) continue;
      let button = th.querySelector(':scope > .glass-table__sort');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'glass-table__sort';
        button.append(...th.childNodes);
        button.insertAdjacentHTML('beforeend', ARROW);
        th.appendChild(button);
      }
      put(th, 'aria-sort', th.dataset.sort === key ? direction : 'none');
    }
  }

  /** Each cell knows its column's name, for the cards. */
  _applyLabels(table) {
    const names = this._headers(table).map(th => th.classList.contains('glass-table__actions') ? '' : th.textContent.replace(/\s+/g, ' ').trim());
    for (const body of table.tBodies) {
      for (const row of body.rows) {
        let col = 0;
        for (const cell of row.cells) {
          put(cell, 'data-label', names[col] ?? '');
          col += cell.colSpan || 1;
        }
      }
    }
  }

  _applyEmpty(table) {
    const rows = [...table.tBodies].reduce((n, body) => n + body.rows.length, 0);
    this._empty.hidden = rows > 0 || this._emptySlot.assignedNodes().length === 0;
  }

  _applyLayout(table) {
    const below = parseFloat(this.getAttribute('list-below'));
    const list = Number.isFinite(below) && this.clientWidth > 0 && this.clientWidth < below;
    if (table.classList.contains('glass-table--list') !== list) table.classList.toggle('glass-table--list', list);
    // As cards the header is hidden, and the page scrolls them, not a box.
    const sticky = this.hasAttribute('sticky-header') && !list;
    this._wrap.classList.toggle('glass-table-wrap--sticky', sticky);
    if (table.classList.contains('glass-table--sticky') !== sticky) table.classList.toggle('glass-table--sticky', sticky);
    this._applyRoles(table, list);
  }

  /** As cards the table drops its display; the roles stay explicit. */
  _applyRoles(table, on) {
    const parts = [[table, 'table'], ...[table.tHead, ...table.tBodies, table.tFoot].filter(Boolean).flatMap(group => [
      [group, 'rowgroup'],
      ...[...group.rows].flatMap(row => [[row, 'row'], ...[...row.cells].map(cell => [cell, cell.localName === 'th' ? (group === table.tHead ? 'columnheader' : 'rowheader') : 'cell'])]),
    ])];
    for (const [el, role] of parts) {
      if (on) { put(el, 'role', role); put(el, 'data-glk-role', ''); }
      else if (el.hasAttribute('data-glk-role')) { el.removeAttribute('role'); el.removeAttribute('data-glk-role'); }
    }
  }

  /** Shades the edges where more columns wait. */
  _applyEdges() {
    const w = this._wrap;
    const table = this._table;
    const scrolls = w.scrollWidth > w.clientWidth + 1;
    if (table && table.classList.contains('glass-table--scrolls') !== scrolls) table.classList.toggle('glass-table--scrolls', scrolls);
    const x = Math.abs(w.scrollLeft);
    this._frame.toggleAttribute('data-more-start', scrolls && x > 1);
    this._frame.toggleAttribute('data-more-end', scrolls && x + w.clientWidth < w.scrollWidth - 1);
  }

  setupEvents() {
    this._onClick = (e) => {
      const button = e.composedPath().find(n => n.classList?.contains('glass-table__sort'));
      const th = button?.closest('th');
      if (!th || th.closest('glk-table') !== this) return;
      const key = th.dataset.sort;
      const current = th.getAttribute('aria-sort');
      const direction = current === 'ascending' ? 'descending' : 'ascending';
      if (!this.emit('glk-table-sort', { key, direction }, { cancelable: true })) return;
      this.setAttribute('sort', key);
      this.setAttribute('direction', direction);
    };
    this.addEventListener('click', this._onClick);
    this._onScroll = () => this._applyEdges();
    this._wrap.addEventListener('scroll', this._onScroll, { passive: true });
    this._onSlotChange = () => { const t = this._table; if (t) this._applyEmpty(t); };
    this._emptySlot.addEventListener('slotchange', this._onSlotChange);
    this._resize = new ResizeObserver(() => {
      const t = this._table;
      if (t) this._applyLayout(t);
      this._applyEdges();
    });
    this._resize.observe(this);
    this.projectLightDom();
  }

  teardownEvents() {
    this.removeEventListener('click', this._onClick);
    this._wrap?.removeEventListener('scroll', this._onScroll);
    this._emptySlot?.removeEventListener('slotchange', this._onSlotChange);
    this._resize?.disconnect();
    this._observed = null;
  }

  onAttributeChanged() { this.projectLightDom(); }

  get sort() { return this.getAttribute('sort') || ''; }
  set sort(v) {
    if (v) this.setAttribute('sort', v);
    else this.removeAttribute('sort');
  }

  get direction() { return this.getAttribute('direction') === 'descending' ? 'descending' : 'ascending'; }
  set direction(v) { this.setAttribute('direction', v === 'descending' ? 'descending' : 'ascending'); }

  get stickyHeader() { return this.getBoolAttr('sticky-header'); }
  set stickyHeader(v) { this.setBoolAttr('sticky-header', v); }

  get listBelow() { return this.getAttribute('list-below') || ''; }
  set listBelow(v) {
    if (v) this.setAttribute('list-below', v);
    else this.removeAttribute('list-below');
  }
}

customElements.define('glk-table', GlkTable);
export { GlkTable };
