import { GlkElement } from './base.js';
import { o as openPanel, f as focusTarget } from './shared/overlay-zsSL3Ygw.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// A menu button (since 1.32.0) — GlassKit's .glass-menu: the overflow menu
// of a header, the actions of a table row. The button is the element in
// slot="trigger"; the items are <glk-menu-item> children, parted by
// <glk-menu-separator> and gathered in a <glk-menu-group label>.
//
// As in the WAI-ARIA menu button pattern: the button carries
// aria-haspopup="menu" and aria-expanded, the panel role="menu" named by
// the button, the items menuitem, menuitemcheckbox or menuitemradio. One
// tab stop: on the button Enter, Space and Down open the menu at its first
// item, Up at its last; in the menu Down and Up move and wrap, Home and End
// go to the ends, typing jumps to the next item that starts with the typed
// letters, Enter and Space choose, Escape closes and gives the focus back
// to the button, Tab closes and moves on. A pointer that hovers an item
// moves the focus to it; a click outside closes, and so does Escape with
// the focus elsewhere (since 1.36.0). In the top layer, placed
// below the button (above with placement="top"), aligned at its start —
// placement="end" aligns at its end — and flipped and shifted to stay in
// the viewport.
//
// glk-select { item, value, checked } is cancelable and comes before
// anything happens: an item closes the menu and gives the focus back to the
// button, a checkbox item toggles and a radio item is checked (the others
// of its group unchecked), and both leave the menu open. Cancelled, nothing
// changes.
//
// Attributes: open, placement (bottom | top | start | end)
// Slots:      trigger, default (items)
// Events:     glk-select, glk-open, glk-close
// Part:       menu
// Methods:    show(), close(), toggle()

const PLACEMENTS = ['bottom', 'top', 'start', 'end'];
const ITEM = 'glk-menu-item';

class GlkMenu extends GlkElement {
  static get observedAttributes() { return ['open', 'placement']; }

  render() {
    this._triggerSlot = this.createElement('slot', [], { name: 'trigger' });
    this._panel = this.createElement('div', ['glass-menu'], { part: 'menu', role: 'menu', popover: 'manual' });
    this._panel.appendChild(document.createElement('slot'));
    this._wrapper.append(this._triggerSlot, this._panel);
  }

  get _trigger() { return this._triggerSlot?.assignedElements()[0] ?? null; }

  /**
   * The element with the focus in the menu's own tree (since 1.38.0): in a
   * shadow root document.activeElement is only the outermost host, and the
   * arrows lost their place.
   */
  _focused() { return this.getRootNode().activeElement; }

  /** The items in order, those in groups included, hidden ones left out. */
  _items() {
    return [...this.querySelectorAll(ITEM)].filter(item => !item.hidden && item.closest('glk-menu') === this);
  }

  _applyTrigger() {
    const trigger = this._trigger;
    if (!trigger) return;
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', String(this.open));
    this._panel.ariaLabelledByElements = [trigger];
  }

  setupEvents() {
    this._onSlotChange = () => this._applyTrigger();
    this._triggerSlot.addEventListener('slotchange', this._onSlotChange);
    this._applyTrigger();

    this._onClick = (e) => {
      const path = e.composedPath();
      const trigger = this._trigger;
      if (trigger && path.includes(trigger)) {
        e.stopPropagation();
        // A click from Enter or Space (no pointer) opens at the first item.
        if (this.open) this.close();
        else this._open(e.detail === 0 ? 'first' : null);
        return;
      }
      const item = path.find(n => n.localName === ITEM);
      if (item && item.closest('glk-menu') === this) this._choose(item);
    };
    this.addEventListener('click', this._onClick);

    this._onKeydown = (e) => this._keydown(e);
    this.addEventListener('keydown', this._onKeydown);

    // Escape closes an open menu wherever the focus is (since 1.36.0), as it
    // closes a popover: opened by a click, the focus may be outside it —
    // Safari does not focus a clicked button —, and a modeless sheet around
    // leaves the key to the menu. Marked as handled. With the focus in the
    // menu or on its button, _keydown has taken the key already.
    this._onDocKeydown = (e) => {
      if (e.key !== 'Escape' || !this.open || e.defaultPrevented) return;
      e.preventDefault();
      this.close();
    };
    document.addEventListener('keydown', this._onDocKeydown);

    this._onPointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      const item = e.composedPath().find(n => n.localName === ITEM);
      if (item && item !== this._focused() && item.closest('glk-menu') === this) item.focus({ preventScroll: true });
    };
    this.addEventListener('pointermove', this._onPointerMove);

    this._onOutside = (e) => {
      if (this.open && !e.composedPath().includes(this)) this.close();
    };
    document.addEventListener('pointerdown', this._onOutside, true);

    if (this.open) this._open(null);
  }

  teardownEvents() {
    this._triggerSlot?.removeEventListener('slotchange', this._onSlotChange);
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeydown);
    document.removeEventListener('keydown', this._onDocKeydown);
    this.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerdown', this._onOutside, true);
    this._handle?.close();
    this._handle = null;
  }

  onAttributeChanged(name) {
    if (!this._panel) return;
    if (name === 'open') {
      if (this.open && !this._handle) this._open(null);
      else if (!this.open && this._handle) this._hide();
    } else if (name === 'placement' && this._handle) {
      this._hide();
      this._open(null);
    }
  }

  _open(focus) {
    if (!this.isConnected) return;
    const trigger = this._trigger;
    if (!this._handle) {
      const placement = PLACEMENTS.includes(this.getAttribute('placement')) ? this.getAttribute('placement') : 'bottom';
      this._handle = openPanel(this._panel, trigger ? focusTarget(trigger) : this, {
        side: placement === 'top' ? 'top' : 'bottom',
        align: placement === 'end' ? 'end' : 'start',
        offset: 6,
      });
      const items = this._items(), checkable = items.some(item => item.type);
      for (const item of items) {
        item.tabIndex = -1;
        item._reserveCheck?.(checkable);
      }
      if (!this.open) this.setAttribute('open', '');
      this._applyTrigger();
      this.emit('glk-open', null, { bubbles: false });
    }
    const items = this._items();
    if (focus === 'first') items[0]?.focus();
    else if (focus === 'last') items[items.length - 1]?.focus();
  }

  _hide() {
    this._handle?.close();
    this._handle = null;
    if (this.open) this.removeAttribute('open');
    this._applyTrigger();
    this.emit('glk-close', null, { bubbles: false });
  }

  /** Closes; with focus, gives it back to the button. */
  close({ focus = false } = {}) {
    if (this._handle) this._hide();
    else if (this.open) this.removeAttribute('open');
    if (focus) focusTarget(this._trigger)?.focus();
  }

  show() { this._open(null); }
  toggle() { if (this.open) this.close(); else this.show(); }

  _choose(item) {
    if (item.disabled) return;
    const type = item.type;
    const checked = type === 'checkbox' ? !item.checked : type === 'radio' ? true : undefined;
    if (!this.emit('glk-select', { item, value: item.value, checked }, { cancelable: true })) return;
    if (type === 'checkbox') {
      item.checked = checked;
    } else if (type === 'radio') {
      const group = item.closest('glk-menu-group') || this;
      for (const other of group.querySelectorAll(ITEM)) {
        if (other !== item && other.type === 'radio' && (other.closest('glk-menu-group') || this) === group) other.checked = false;
      }
      item.checked = true;
    } else {
      this.close({ focus: true });
    }
  }

  _keydown(e) {
    const trigger = this._trigger;
    const onTrigger = trigger && e.composedPath().includes(trigger);
    if (onTrigger) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this._open(e.key === 'ArrowDown' ? 'first' : 'last');
      } else if (e.key === 'Escape' && this.open) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
      return;
    }
    if (!this.open) return;
    const items = this._items();
    const current = items.indexOf(this._focused());
    const go = (i) => { e.preventDefault(); items[(i + items.length) % items.length]?.focus(); };
    switch (e.key) {
      case 'ArrowDown': go(current + 1); break;
      case 'ArrowUp': go(current < 0 ? -1 : current - 1); break;
      case 'Home': go(0); break;
      case 'End': go(-1); break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();                 // a dialog around stays open
        this.close({ focus: true });
        break;
      case 'Tab':
        this.close();                        // the focus moves on by itself
        break;
      case 'Enter':
      case ' ':
        if (current >= 0) { e.preventDefault(); this._choose(items[current]); }
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) this._typeahead(e.key, items, current);
    }
  }

  /** Letters typed within half a second form one search. */
  _typeahead(key, items, current) {
    clearTimeout(this._typeTimer);
    this._typed = (this._typed || '') + key.toLowerCase();
    this._typeTimer = setTimeout(() => { this._typed = ''; }, 500);
    const order = [...items.slice(current + 1), ...items.slice(0, current + 1)];
    const one = this._typed.length > 1 && [...this._typed].every(c => c === this._typed[0]);
    const term = one ? this._typed[0] : this._typed;
    // A repeated letter moves on; a longer word searches from the current item.
    const from = one || this._typed.length === 1 ? order : [items[current], ...order].filter(Boolean);
    const hit = from.find(item => item.label.toLowerCase().startsWith(term));
    hit?.focus();
  }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }

  get placement() { return PLACEMENTS.includes(this.getAttribute('placement')) ? this.getAttribute('placement') : 'bottom'; }
  set placement(v) { if (PLACEMENTS.includes(v)) this.setAttribute('placement', v); }
}

customElements.define('glk-menu', GlkMenu);

export { GlkMenu };
