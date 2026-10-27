import { GlkElement } from './base.js';
import { t as tooltipBehaviour } from './shared/overlay-COVSRs-B.js';
import { j as joinGroup } from './shared/sortable-cEOIcAfx.js';
import './glk-menu.js';
import './glk-menu-item.js';
import './glk-breadcrumb.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// The path through nested levels (since 1.32.0) — GlassKit's
// .glass-breadcrumbs: My app › Main menu › Services › Online booking. The
// levels are <glk-breadcrumb> children; the element draws them as
// <nav aria-label><ol><li>, each crumb a link (href) or a button, the
// current one — `current`, else the last — plain text with
// aria-current="page". The separators are CSS, hidden from assistive
// technology and mirrored right to left.
//
// glk-navigate { item, value, href, index } is cancelable: cancelled on a
// link it stops the browser's navigation, so a single-page app routes by
// itself; a link without a listener just works, in a new tab too.
//
// Where the path does not fit, the middle levels fold into one "…" crumb
// (collapse="auto", the default): a menu button named like "2 more levels"
// that lists them; the first crumb and the last two stay. Measured on the
// element, so it folds and unfolds with its own width. A long label is cut
// with an ellipsis and shows in full in a tooltip.
//
// As drop targets (drop-target, or the same group as a sortable list or
// tree): a crumb takes a dragged item into its level and lights up while
// the item is over it; hovering the "…" crumb during a drag opens its menu.
// The move itself is the page's: see glk-sort on the list or tree.
//
// Attributes: label (default "Breadcrumb"), collapse (auto | never),
//             drop-target, group, more-label (the "…" crumb's name, with
//             {count}; default "1 more level", "2 more levels"),
//             more-label-one (its singular, where a language needs one)
// Events:     glk-navigate
// Parts:      nav, list, crumb, current, overflow

const CRUMB = 'glk-breadcrumb';

class GlkBreadcrumbs extends GlkElement {
  static get observedAttributes() { return ['label', 'collapse', 'more-label', 'more-label-one', 'drop-target', 'group']; }

  static get observesLightDom() { return true; }

  render() {
    this._nav = this.createElement('nav', ['glass-breadcrumbs'], { part: 'nav' });
    this._list = this.createElement('ol', ['glass-breadcrumbs__list'], { part: 'list' });
    this._nav.appendChild(this._list);
    this._wrapper.appendChild(this._nav);
    this._applyLabel();
    this.projectLightDom();
  }

  _crumbs() { return [...this.children].filter(el => el.localName === CRUMB && !el.hidden); }

  /** Draws the path anew when the crumbs change. */
  projectLightDom() {
    if (!this._list) return;
    const crumbs = this._crumbs();
    const signature = crumbs.map(c => [c.label, c.href, c.getAttribute('value'), c.current].join('\u0001')).join('\u0002');
    if (signature === this._signature) return;
    this._signature = signature;
    this._render(crumbs);
    this._fit();
  }

  _render(crumbs) {
    this._tips?.forEach(t => t.destroy());
    this._tips = [];
    const currentIndex = crumbs.findIndex(c => c.current);
    const current = currentIndex >= 0 ? currentIndex : crumbs.length - 1;
    this._entries = crumbs.map((item, index) => {
      const li = this.createElement('li', ['glass-breadcrumbs__item']);
      let el;
      if (index === current) {
        el = this.createElement('span', ['glass-breadcrumbs__current'], { part: 'current', 'aria-current': 'page' });
      } else if (item.href) {
        el = this.createElement('a', ['glass-breadcrumbs__crumb'], { part: 'crumb', href: item.href });
      } else {
        el = this.createElement('button', ['glass-breadcrumbs__crumb'], { part: 'crumb', type: 'button' });
      }
      el.textContent = item.label;
      li.appendChild(el);
      return { item, index, li, el, current: index === current };
    });
    // The "…" crumb, shown when the middle folds.
    this._more = this.createElement('li', ['glass-breadcrumbs__item', 'glass-breadcrumbs__item--overflow']);
    this._menu = document.createElement('glk-menu');
    this._menuButton = this.createElement('button', ['glass-breadcrumbs__crumb', 'glass-breadcrumbs__overflow'], { part: 'overflow', type: 'button', slot: 'trigger' });
    this._menuButton.textContent = '…';
    this._menu.appendChild(this._menuButton);
    this._more.appendChild(this._menu);
    this._more.hidden = true;
    this._list.replaceChildren(...this._entries.map(e => e.li));
    if (this._entries.length) this._list.insertBefore(this._more, this._entries[1]?.li ?? null);
  }

  /** Folds the middle levels until the path fits, keeping the first and the last two. */
  _fit() {
    const entries = this._entries || [];
    for (const e of entries) e.li.hidden = false;
    this._more.hidden = true;
    const folded = [];
    if (this.getAttribute('collapse') !== 'never' && entries.length > 3) {
      // Measured at their natural width: the crumbs may shrink to their
      // ellipsis, and a path that only shrinks never overflows.
      const items = [...this._list.children];
      for (const li of items) li.style.flexShrink = '0';
      const overflows = () => this._list.scrollWidth > this._nav.clientWidth + 1;
      for (let i = 1; i < entries.length - 2 && overflows(); i++) {
        entries[i].li.hidden = true;
        folded.push(entries[i]);
        this._more.hidden = false;
      }
      for (const li of items) li.style.flexShrink = '';
    }
    this._fillMenu(folded);
    this._applyTips();
  }

  _fillMenu(folded) {
    this._folded = folded;
    const n = folded.length;
    const own = (n === 1 && this.getAttribute('more-label-one')) || this.getAttribute('more-label');
    const label = own ? own.replace('{count}', String(n)) : `${n} more ${n === 1 ? 'level' : 'levels'}`;
    this._menuButton.setAttribute('aria-label', label);
    this._menu.replaceChildren(this._menuButton, ...folded.map(entry => {
      const option = document.createElement('glk-menu-item');
      option.textContent = entry.item.label;
      option.setAttribute('value', String(entry.index));
      return option;
    }));
  }

  /** Cut labels show in full on hover, focus and a long press. */
  _applyTips() {
    this._tips?.forEach(t => t.destroy());
    this._tips = [];
    for (const entry of this._entries || []) {
      if (entry.li.hidden || entry.el.scrollWidth <= entry.el.clientWidth + 1) continue;
      const panel = this.createElement('div', ['glass-tooltip'], { 'aria-hidden': 'true' });
      panel.textContent = entry.item.label;
      this._wrapper.appendChild(panel);
      const tip = tooltipBehaviour(entry.el, panel, { side: () => 'bottom', anchor: () => entry.el });
      this._tips.push({ destroy() { tip.destroy(); panel.remove(); } });
    }
  }

  _applyLabel() {
    this._nav?.setAttribute('aria-label', this.getAttribute('label') || 'Breadcrumb');
  }

  setupEvents() {
    this._onClick = (e) => {
      const el = e.composedPath().find(n => n.classList?.contains('glass-breadcrumbs__crumb') && !n.classList.contains('glass-breadcrumbs__overflow'));
      const entry = el && this._entries?.find(x => x.el === el);
      if (!entry) return;
      if (!this._navigate(entry)) e.preventDefault();
    };
    this._onSelect = (e) => {
      if (!e.composedPath().includes(this._menu)) return;
      const entry = this._entries?.[Number(e.detail.value)];
      if (entry && this._navigate(entry) && entry.item.href) location.assign(entry.item.href);
    };
    this._wrapper.addEventListener('click', this._onClick);
    this._wrapper.addEventListener('glk-select', this._onSelect);
    this._resize = new ResizeObserver(() => {
      if (this._nav.clientWidth !== this._width) {
        this._width = this._nav.clientWidth;
        this._fit();
      }
    });
    this._resize.observe(this);
    this._applyGroup();
  }

  /** Joins the group of its drop-target or group attribute, again when either changes. */
  _applyGroup() {
    this._leaveGroup?.();
    this._leaveGroup = this._acceptsDrops ? joinGroup(this) : null;
  }

  teardownEvents() {
    this._wrapper?.removeEventListener('click', this._onClick);
    this._wrapper?.removeEventListener('glk-select', this._onSelect);
    this._resize?.disconnect();
    this._tips?.forEach(t => t.destroy());
    this._tips = [];
    this._leaveGroup?.();
    this._leaveGroup = null;
  }

  onAttributeChanged(name) {
    if (!this._nav) return;
    if (name === 'label') this._applyLabel();
    else if (name === 'collapse') this._fit();
    else if (name === 'drop-target' || name === 'group') { if (this.isConnected && this._resize) this._applyGroup(); }
    else this._fillMenu(this._folded || []);
  }

  /** glk-navigate; false when a listener cancelled it. */
  _navigate(entry) {
    return this.emit('glk-navigate', { item: entry.item, value: entry.item.value, href: entry.item.href, index: entry.index }, { cancelable: true });
  }

  // ── Drop targets for a sortable list or tree with the same group ──

  get _acceptsDrops() { return this.hasAttribute('drop-target') || this.hasAttribute('group'); }

  /** The crumb at a point of the viewport, with its level: { item, index, el }. */
  _dropTargetAt(x, y) {
    if (!this._acceptsDrops) return null;
    for (const node of this.shadowRoot.elementsFromPoint(x, y)) {
      const entry = this._entries?.find(e => e.el === node);
      if (entry) return { item: entry.item, index: entry.index, el: entry.el, current: entry.current };
      if (node === this._menuButton) return { overflow: true, el: node };
    }
    // The folded levels, while their menu is open during a drag.
    if (this._menu?.open) {
      const option = document.elementsFromPoint(x, y).find(n => n.localName === 'glk-menu-item' && n.parentElement === this._menu);
      if (option) {
        const entry = this._entries[Number(option.getAttribute('value'))];
        return { item: entry.item, index: entry.index, el: option };
      }
    }
    return null;
  }

  /** Lights a crumb as the target, or shows that it refuses the item. */
  _markDrop(el, state) {
    for (const c of this.shadowRoot.querySelectorAll('.is-drop-target, .is-drop-refused')) c.classList.remove('is-drop-target', 'is-drop-refused');
    for (const o of this._menu?.querySelectorAll('glk-menu-item') ?? []) o.classList.remove('is-drop-target');
    if (el && state) el.classList.add(state === 'refused' ? 'is-drop-refused' : 'is-drop-target');
  }

  /** Over the "…" crumb during a drag, its menu opens after a moment. */
  _hoverOverflow(on) {
    clearTimeout(this._openTimer);
    if (on && !this._menu.open) this._openTimer = setTimeout(() => this._menu.show(), 600);
  }

  /** The crumb of the level above the current one, for the keyboard. */
  get _parentTarget() {
    const entries = this._entries || [];
    const current = entries.findIndex(e => e.current);
    const entry = entries[(current >= 0 ? current : entries.length) - 1];
    return entry ? { item: entry.item, index: entry.index, el: entry.el } : null;
  }

  get collapse() { return this.getAttribute('collapse') === 'never' ? 'never' : 'auto'; }
  set collapse(v) { this.setAttribute('collapse', v === 'never' ? 'never' : 'auto'); }

  get label() { return this.getAttribute('label') || 'Breadcrumb'; }
  set label(v) {
    if (v) this.setAttribute('label', v);
    else this.removeAttribute('label');
  }

  get group() { return this.getAttribute('group') || ''; }
  set group(v) {
    if (v) this.setAttribute('group', v);
    else this.removeAttribute('group');
  }
}

customElements.define('glk-breadcrumbs', GlkBreadcrumbs);

export { GlkBreadcrumbs };
