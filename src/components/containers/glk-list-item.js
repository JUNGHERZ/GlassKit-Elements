import { GlkElement } from '../../base.js';

// Module-level override sheet — shared by all instances.
// Suppresses the auto-divider when glk-list marks this item as the
// last-of-type via [data-last]. The default divider is rendered by
// glasskit.css thanks to the sentinel sibling in the shadow tree.
const lastChildOverrideSheet = new CSSStyleSheet();
lastChildOverrideSheet.replaceSync(`
  :host([data-last]) .glass-list__item::after { content: none; }
`);

const VARIANTS = ['danger', 'accent'];

// An interactive item is a button for the keyboard and for assistive
// technology (since 1.32.0): its row takes the focus in the Tab order, Enter
// and Space click it — in a sortable list Space picks it up — and it is
// announced as a button. Until then it was a plain list item that only a
// pointer could reach. highlight() flashes the row.
//
// selected (since 1.34.0) marks the entry a list beside its detail shows:
// GlassKit's .is-selected lays a pill of raised glass into the row, and
// the row carries aria-current="true". The page sets it; a click does not.
// handle="start" puts a sortable item's handle before the icon, "end" (the
// default) after the trailing content; on <glk-list> it is the default of
// its items. Parts since 1.34.0: item (the row) and handle.
//
// Since 1.35.0 slot="title-trailing" sets something beside the title — a
// badge, a mark — which moves under it where the row is too narrow, and
// slot="extra" something below the subtitle: a link, a line of chips.
// Parts title and subtitle, and GlassKit's --gl-list-title-size, -weight
// and --gl-list-subtitle-size, set the row's type.
//
// Since 1.36.0 the parts leading and trailing reach the two boxes at the
// row's ends, and GlassKit's --gl-list-leading-width widens the leading
// one — a time and a chip before the text. The title of a selected row
// takes the row's colour, so --gl-list-item-selected-color reaches it.

class GlkListItem extends GlkElement {
  static get observedAttributes() {
    return ['title', 'subtitle', 'interactive', 'center', 'leading-lg', 'wrap', 'detail', 'variant', 'data-last', 'no-drag', 'selected', 'handle'];
  }

  constructor() {
    super();
    this._shadow.adoptedStyleSheets = [
      ...this._shadow.adoptedStyleSheets,
      lastChildOverrideSheet
    ];
  }

  render() {
    // display:contents wrapper — transparent to layout.
    const wrap = this.createElement('div');
    wrap.style.display = 'contents';

    this._item = this.createElement('li', ['glass-list__item'], { part: 'item' });
    this._applyInteractive();
    this._applySelected();
    if (this.getBoolAttr('center')) this._item.classList.add('glass-list__item--center');
    const initialVariant = this.getAttribute('variant');
    if (initialVariant && VARIANTS.includes(initialVariant)) {
      this._item.classList.add(`glass-list__item--${initialVariant}`);
    }

    // Leading slot — hidden until a child with slot="leading" appears.
    // Parts leading and trailing since 1.36.0; GlassKit's
    // --gl-list-leading-width widens the box for a time and a chip.
    this._leading = this.createElement('span', ['glass-list__leading'], { part: 'leading' });
    if (this.getBoolAttr('leading-lg')) this._leading.classList.add('glass-list__leading--lg');
    this._leadingSlot = document.createElement('slot');
    this._leadingSlot.setAttribute('name', 'leading');
    this._leading.appendChild(this._leadingSlot);
    this._leading.hidden = true;

    // Content — title + optional subtitle; beside the title and below the
    // subtitle a place each (since 1.35.0), hidden until something is slotted.
    this._content = this.createElement('div', ['glass-list__content']);
    const titleRow = this.createElement('div', ['glass-list__title-row']);
    this._titleEl = this.createElement('div', ['glass-list__title'], { part: 'title' });
    this.takeTitle();
    this._titleEl.textContent = this._title || '';
    this._titleTrailing = this.createElement('span', ['glass-list__title-trailing'], { part: 'title-trailing', hidden: '' });
    this._titleTrailingSlot = this.createElement('slot', [], { name: 'title-trailing' });
    this._titleTrailing.appendChild(this._titleTrailingSlot);
    titleRow.append(this._titleEl, this._titleTrailing);
    this._subtitleEl = this.createElement('div', ['glass-list__subtitle'], { part: 'subtitle' });
    if (this.getBoolAttr('wrap')) this._subtitleEl.classList.add('glass-list__subtitle--wrap');
    const initialSubtitle = this.getAttribute('subtitle') || '';
    this._subtitleEl.textContent = initialSubtitle;
    this._subtitleEl.hidden = !initialSubtitle;
    this._extra = this.createElement('div', ['glass-list__extra'], { part: 'extra', hidden: '' });
    this._extraSlot = this.createElement('slot', [], { name: 'extra' });
    this._extra.appendChild(this._extraSlot);
    this._content.append(titleRow, this._subtitleEl, this._extra);

    // Trailing — value span + slot for icons/badges.
    this._trailing = this.createElement('div', ['glass-list__trailing'], { part: 'trailing' });
    this._valueEl = this.createElement('span', ['glass-list__value']);
    const initialDetail = this.getAttribute('detail') || '';
    this._valueEl.textContent = initialDetail;
    this._valueEl.hidden = !initialDetail;
    this._trailing.appendChild(this._valueEl);
    this._trailingSlot = document.createElement('slot');
    this._trailingSlot.setAttribute('name', 'trailing');
    this._trailing.appendChild(this._trailingSlot);
    this._trailing.hidden = !initialDetail; // also revealed by slotchange

    this._item.appendChild(this._leading);
    this._item.appendChild(this._content);
    this._item.appendChild(this._trailing);

    // A handle for a sortable list (since 1.32.0), at the row's end — or,
    // since 1.34.0, at its start (handle="start").
    this._handle = this.createElement('span', ['glass-sort__handle'], { part: 'handle' });
    this._handleSlot = this.createElement('slot', [], { name: 'handle' });
    this._handle.appendChild(this._handleSlot);
    this._handle.hidden = true;
    this._applyHandle();
    this._applyTile();

    // Sentinel sibling so the <li> is never :last-child inside its shadow
    // parent — keeps the glasskit.css ::after divider rule matching.
    const sentinel = this.createElement('span');
    sentinel.hidden = true;
    sentinel.setAttribute('aria-hidden', 'true');

    wrap.appendChild(this._item);
    wrap.appendChild(sentinel);
    this._wrapper.appendChild(wrap);
  }

  setupEvents() {
    // Reveal leading/trailing wrappers only when slotted content exists.
    this._onLeadingSlotChange = () => {
      this._leading.hidden = this._leadingSlot.assignedNodes().length === 0;
    };
    this._onTrailingSlotChange = () => {
      const hasSlotted = this._trailingSlot.assignedNodes().length > 0;
      const hasDetail = !this._valueEl.hidden;
      this._trailing.hidden = !hasSlotted && !hasDetail;
    };
    this._onHandleSlotChange = () => { this._handle.hidden = this._handleSlot.assignedNodes().length === 0; };
    this._onPlaceSlotChange = () => {
      this._titleTrailing.hidden = this._titleTrailingSlot.assignedNodes().length === 0;
      this._extra.hidden = this._extraSlot.assignedNodes().length === 0;
    };
    this._titleTrailingSlot.addEventListener('slotchange', this._onPlaceSlotChange);
    this._extraSlot.addEventListener('slotchange', this._onPlaceSlotChange);
    this._onPlaceSlotChange();
    this._handleSlot.addEventListener('slotchange', this._onHandleSlotChange);
    this._leadingSlot.addEventListener('slotchange', this._onLeadingSlotChange);
    this._trailingSlot.addEventListener('slotchange', this._onTrailingSlotChange);
    this._onLeadingSlotChange();
    this._onTrailingSlotChange();

    // Forward clicks as glk-click — only for interactive items.
    this._onClick = () => {
      if (this.getBoolAttr('interactive')) {
        this.emit('glk-click');
      }
    };
    this._item.addEventListener('click', this._onClick);

    // Enter clicks on keydown, Space on keyup, as on a native button. In a
    // sortable list Space picks the item up instead.
    this._onKeydown = (e) => {
      if (!this.getBoolAttr('interactive') || e.target !== this._item) return;
      if (e.key === 'Enter') { e.preventDefault(); this._item.click(); }
      else if (e.key === ' ') e.preventDefault();          // no page scroll
    };
    this._onKeyup = (e) => {
      if (this._sortable) return;
      if (this.getBoolAttr('interactive') && e.target === this._item && e.key === ' ') this._item.click();
    };
    this._item.addEventListener('keydown', this._onKeydown);
    this._item.addEventListener('keyup', this._onKeyup);
    // Moved into another list: that list's handle="…" and grid may differ.
    this._applyHandle();
    this._applyTile();
    // Defined after its sortable list, or added later: the list marks it now.
    this.parentElement?._sort?.sync();
  }

  teardownEvents() {
    this._leadingSlot?.removeEventListener('slotchange', this._onLeadingSlotChange);
    this._trailingSlot?.removeEventListener('slotchange', this._onTrailingSlotChange);
    this._item?.removeEventListener('click', this._onClick);
    this._item?.removeEventListener('keydown', this._onKeydown);
    this._item?.removeEventListener('keyup', this._onKeyup);
    this._handleSlot?.removeEventListener('slotchange', this._onHandleSlotChange);
    this._titleTrailingSlot?.removeEventListener('slotchange', this._onPlaceSlotChange);
    this._extraSlot?.removeEventListener('slotchange', this._onPlaceSlotChange);
  }

  _applyInteractive() {
    const on = this.getBoolAttr('interactive');
    this._item.classList.toggle('glass-list__item--interactive', on);
    // Focusable as a button when interactive, or as a sortable item.
    if (on || this._sortable) {
      this._item.setAttribute('role', 'button');
      this._item.tabIndex = 0;
    } else {
      this._item.removeAttribute('role');
      this._item.removeAttribute('tabindex');
    }
  }

  _applySelected() {
    const on = this.getBoolAttr('selected');
    this._item.classList.toggle('is-selected', on);
    if (on) this._item.setAttribute('aria-current', 'true');
    else this._item.removeAttribute('aria-current');
  }

  /**
   * The handle's place: the item's own handle="start" or "end", else the
   * one its <glk-list> sets for all of them. At the start it comes first in
   * the row, so the keyboard reaches a button in it before the row's other
   * controls, as the eye does.
   */
  _applyHandle() {
    if (!this._item) return;
    if (this.handle === 'start') this._item.insertBefore(this._handle, this._item.firstChild);
    else this._item.appendChild(this._handle);
  }

  /** A tile in a <glk-list grid> (since 1.34.0). */
  _applyTile() {
    if (!this._item) return;
    const list = this.parentElement?.localName === 'glk-list' ? this.parentElement : null;
    this._item.classList.toggle('glass-list__item--tile', Boolean(list?.hasAttribute('grid')));
  }

  /**
   * Called by a sortable list: the row takes the focus and says what it is
   * and how to move it; null takes it back.
   */
  _setSortable(messages) {
    this._sortable = Boolean(messages);
    if (!this._item) return;
    this._applyInteractive();
    if (messages) {
      this._item.setAttribute('aria-roledescription', messages.roleDescription);
      this._item.setAttribute('aria-description', messages.instructions);
    } else {
      this._item.removeAttribute('aria-roledescription');
      this._item.removeAttribute('aria-description');
    }
  }

  onAttributeChanged(name, _old, value) {
    if (!this._item) return;
    switch (name) {
      case 'title':
        if (this.takeTitle(value)) this._applyTitle();
        break;
      case 'subtitle': {
        const value = this.getAttribute('subtitle') || '';
        this._subtitleEl.textContent = value;
        this._subtitleEl.hidden = !value;
        break;
      }
      case 'interactive':
        this._applyInteractive();
        break;
      case 'center':
        this._item.classList.toggle('glass-list__item--center', this.getBoolAttr('center'));
        break;
      case 'leading-lg':
        this._leading.classList.toggle('glass-list__leading--lg', this.getBoolAttr('leading-lg'));
        break;
      case 'wrap':
        this._subtitleEl.classList.toggle('glass-list__subtitle--wrap', this.getBoolAttr('wrap'));
        break;
      case 'detail': {
        const detail = this.getAttribute('detail') || '';
        this._valueEl.textContent = detail;
        this._valueEl.hidden = !detail;
        // Re-evaluate trailing visibility.
        if (this._onTrailingSlotChange) this._onTrailingSlotChange();
        break;
      }
      case 'variant': {
        // Remove previous variant, add new one.
        VARIANTS.forEach(v => this._item.classList.remove(`glass-list__item--${v}`));
        const variant = this.getAttribute('variant');
        if (variant && VARIANTS.includes(variant)) {
          this._item.classList.add(`glass-list__item--${variant}`);
        }
        break;
      }
      case 'no-drag':
        this.parentElement?._sort?.sync();
        break;
      case 'selected':
        this._applySelected();
        break;
      case 'handle':
        this._applyHandle();
        break;
      case 'data-last':
        // Handled purely via CSS :host([data-last]) — no JS needed here,
        // but observing it makes sure the shadow re-evaluates the rule.
        break;
    }
  }

  _applyTitle() {
    if (this._titleEl) this._titleEl.textContent = this._title || '';
  }

  // `title` is the heading, never a tooltip — see GlkElement.takeTitle().
  get title() { return this._title ?? ''; }
  set title(v) {
    this._title = v == null ? '' : String(v);
    this._applyTitle();
  }

  get interactive() { return this.getBoolAttr('interactive'); }
  set interactive(v) { this.setBoolAttr('interactive', v); }

  get center() { return this.getBoolAttr('center'); }
  set center(v) { this.setBoolAttr('center', v); }

  get leadingLg() { return this.getBoolAttr('leading-lg'); }
  set leadingLg(v) { this.setBoolAttr('leading-lg', v); }

  get wrap() { return this.getBoolAttr('wrap'); }
  set wrap(v) { this.setBoolAttr('wrap', v); }

  get detail() { return this.getAttribute('detail') || ''; }
  set detail(v) {
    if (v) this.setAttribute('detail', v);
    else this.removeAttribute('detail');
  }

  get selected() { return this.getBoolAttr('selected'); }
  set selected(v) { this.setBoolAttr('selected', v); }

  /** Where the handle stands: "start" or "end", by the item's own attribute, else its list's. */
  get handle() {
    const list = this.parentElement?.localName === 'glk-list' ? this.parentElement : null;
    return (this.getAttribute('handle') ?? list?.getAttribute('handle')) === 'start' ? 'start' : 'end';
  }
  set handle(v) {
    if (v === 'start' || v === 'end') this.setAttribute('handle', v);
    else this.removeAttribute('handle');
  }

  get variant() { return this.getAttribute('variant') || ''; }
  set variant(v) {
    if (v && VARIANTS.includes(v)) this.setAttribute('variant', v);
    else this.removeAttribute('variant');
  }

  /** The row takes the focus where it is a tab stop — interactive or sortable (since 1.33.2). */
  focus(options) {
    if (this._item?.tabIndex >= 0) this._item.focus(options);
    else super.focus(options);
  }

  /**
   * A short flash of the row (since 1.32.0), for an item that changed
   * elsewhere — on another device, by an undo — so the eye finds it
   * (GlassKit's .is-flash); none under prefers-reduced-motion.
   */
  highlight() {
    const row = this._item;
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
}

customElements.define('glk-list-item', GlkListItem);
export { GlkListItem };
