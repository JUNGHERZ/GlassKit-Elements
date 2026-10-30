import { GlkElement } from './base.js';
import { t as tooltipBehaviour } from './shared/overlay-zsSL3Ygw.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// The icon: an inline <svg> child is copied into the shadow root, where
// GlassKit's rules reach it. Anything else — a font icon such as Material
// Icons, an <img>, an element of the page's own — goes into slot="icon"
// (since 1.28.0) and takes the state colour from GlassKit's icon box: active,
// hover, the lens of the drop and the drag. With a slotted icon no SVG is
// copied.
//
// glk-tab-select (cancelable since 1.28.0) comes before `active` changes:
// preventDefault() keeps the current tab — for an item that opens a drawer
// or a link — and the bar then neither moves `active` nor its drop, nor
// emits glk-tab-change. A drag of the drop that ends on the item clicks it,
// so it takes the same path.
//
// Since 1.32.0 the active item carries aria-current="page", so a screen
// reader tells which view is open; badge-label words the count for the
// item's name, "Customers, 3 new" instead of "3 Customers"; with href the
// item is a link, which can open its view in a new tab — a cancelled
// glk-tab-select stops the navigation too. In a rail the label is hidden
// from view and shows as a tooltip on hover, focus and a long press, beside
// the rail — unless the rail keeps its labels (rail="labels", since
// 1.33.0), where it stands under the icon. Part: item.
//
// badge-dot (since 1.38.0) shows a dot without a count — "something needs
// you here", an open payment at the account tab — GlassKit's
// .glass-tab-bar__badge--dot; badge-label says why in the item's name.
// Part badge on the count or the dot (since 1.38.0); GlassKit's
// --gl-tab-bar-badge-size, -top, -end, -ring-width and -ring-color set both.

class GlkTabItem extends GlkElement {
  static get observedAttributes() {
    return ['label', 'active', 'badge', 'badge-label', 'badge-dot', 'href'];
  }

  static get observesLightDom() { return true; }

  // focus() lands on the item, button or link (since 1.33.2).
  static get delegatesFocus() { return true; }

  render() {
    this._btn = this._createItem();

    // Icon — clone SVG from light DOM into shadow DOM so GlassKit CSS applies,
    // or show what is slotted as icon
    this._iconEl = this.createElement('span', ['glass-tab-bar__icon']);
    this._iconEl.appendChild(this.createElement('slot', [], { name: 'icon' }));

    // Label
    this._labelEl = this.createElement('span', ['glass-tab-bar__label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    // Badge inside icon container (position: absolute relative to icon)
    this._applyBadge();

    this._btn.appendChild(this._iconEl);
    this._btn.appendChild(this._labelEl);
    this._applyActive();
    this._applyName();

    this._wrapper.appendChild(this._btn);

    // Defer icon cloning — children may not be parsed yet
    requestAnimationFrame(() => this.projectLightDom());
  }

  projectLightDom() {
    // A slotted icon wins; only without one is an <svg> copied.
    const svg = this.querySelector(':scope > [slot="icon"]') ? null : this.querySelector('svg');
    const signature = svg ? svg.outerHTML : '';
    if (signature === this._iconSignature) return;
    this._iconSignature = signature;

    // Drop the previous clone by hand: the icon container also holds the badge,
    // and inserting without removing would stack a second icon on every update.
    this._iconClone?.remove();
    this._iconClone = null;
    if (!svg) return;

    const clone = svg.cloneNode(true);
    // Remove inline attributes that would override GlassKit styles
    clone.removeAttribute('width');
    clone.removeAttribute('height');
    clone.removeAttribute('stroke');
    clone.removeAttribute('stroke-width');
    clone.removeAttribute('stroke-linecap');
    clone.removeAttribute('stroke-linejoin');
    clone.removeAttribute('fill');
    this._iconEl.insertBefore(clone, this._iconEl.firstChild);
    this._iconClone = clone;
  }

  /** A link with href, else a button. */
  _createItem() {
    const href = this.getAttribute('href');
    return href === null
      ? this.createElement('button', ['glass-tab-bar__item'], { type: 'button', part: 'item' })
      : this.createElement('a', ['glass-tab-bar__item'], { href, part: 'item' });
  }

  /** href came or went: the same content in the other element. */
  _swapItem() {
    this._applyRail(false);                     // bound to the old element; the bar's sync binds it again
    const next = this._createItem();
    next.append(...this._btn.childNodes);
    this._btn.removeEventListener('click', this._onClick);
    this._btn.replaceWith(next);
    this._btn = next;
    this._btn.addEventListener('click', this._onClick);
    this._applyActive();
    this._applyName();
    this._tellBar();
  }

  _applyActive() {
    const active = this.getBoolAttr('active');
    this._btn.classList.toggle('is-active', active);
    if (active) this._btn.setAttribute('aria-current', 'page');
    else this._btn.removeAttribute('aria-current');
  }

  /** The count, or with badge-dot a dot without one; none without either. */
  _applyBadge() {
    const badge = this.getAttribute('badge');
    const dot = this.getBoolAttr('badge-dot');
    if (!badge && !dot) {
      this._badgeEl?.remove();
      this._badgeEl = null;
      return;
    }
    if (!this._badgeEl) {
      this._badgeEl = this.createElement('span', ['glass-tab-bar__badge'], { part: 'badge' });
      this._iconEl.appendChild(this._badgeEl);
    }
    this._badgeEl.classList.toggle('glass-tab-bar__badge--dot', dot);
    this._badgeEl.textContent = dot ? '' : badge;
  }

  /**
   * With a count, the name says it after the label, in words where given;
   * with a dot, badge-label alone says why.
   */
  _applyName() {
    const label = this.getAttribute('label') || '';
    const badge = this.getAttribute('badge');
    const words = this.getAttribute('badge-label');
    const said = this.getBoolAttr('badge-dot') ? words : (words || badge);
    if ((badge || this.getBoolAttr('badge-dot')) && said && label) {
      this._btn.setAttribute('aria-label', `${label}, ${said}`);
    } else {
      this._btn.removeAttribute('aria-label');
    }
  }

  setupEvents() {
    this._onClick = (e) => {
      // A link opened in another tab or window leaves this page's tab as it is.
      if (this._btn.localName === 'a' && (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)) return;
      if (!this.emit('glk-tab-select', null, { cancelable: true })) {
        e.preventDefault();                       // a link stays where it is
        return;
      }
      this.setAttribute('active', '');
      this.closest('glk-tab-bar')?._selected?.(this);
    };
    this._btn.addEventListener('click', this._onClick);
    this._tellBar();
  }

  /**
   * The bar's look reaches the item through its wrapper. GlassKit's rules for
   * floating and droplet items are descendant selectors of the bar's classes,
   * and this button sits in a shadow root of its own, so <glk-tab-bar> hands
   * its state down and the wrapper carries it. Before 1.27.0 the items of a
   * floating bar kept the fixed bar's look: no spotlight, no pill, the dot.
   */
  _syncBar({ floating, droplet, placed, drag, vertical = false, rail = false, labels = false, top = false, dock = null }) {
    if (!this._wrapper) return;
    // A rail that shows its labels needs no tooltip for them.
    this._applyRail(rail && !labels, dock);
    this._wrapper.classList.toggle('glass-tab-bar--floating', floating);
    this._wrapper.classList.toggle('glass-tab-bar--droplet', droplet);
    this._wrapper.classList.toggle('glass-tab-bar--vertical', vertical);
    this._wrapper.classList.toggle('glass-tab-bar--rail', rail);
    this._wrapper.classList.toggle('glass-tab-bar--labels', labels);
    this._wrapper.classList.toggle('glass-tab-bar--top', top);
    this._wrapper.toggleAttribute('data-droplet', placed);
    this._wrapper.toggleAttribute('data-droplet-drag', drag);
  }

  /** Tells the bar that this item rendered or changed its active state. */
  _tellBar() {
    this.closest('glk-tab-bar')?._itemChanged?.();
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
    this._applyRail(false);
  }

  /**
   * In a rail the label shows as a tooltip beside the rail — the other side
   * than the edge it is docked at. Only seen: the hidden label is the name.
   */
  _applyRail(on, dock) {
    this._railSide = dock === 'end' ? 'start' : 'end';
    if (on && !this._railTip && this._btn) {
      this._railPanel = this.createElement('div', ['glass-tooltip'], { 'aria-hidden': 'true' });
      this._railPanel.textContent = this.getAttribute('label') || '';
      this._wrapper.appendChild(this._railPanel);
      this._railTip = tooltipBehaviour(this._btn, this._railPanel, {
        side: () => this._railSide,
        anchor: () => this._btn,
        offset: () => parseFloat(getComputedStyle(this._railPanel).getPropertyValue('--gl-tooltip-offset')) || 8,
      });
    } else if (!on && this._railTip) {
      this._railTip.destroy();
      this._railPanel.remove();
      this._railTip = this._railPanel = null;
    }
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    switch (name) {
      case 'active':
        this._applyActive();
        this._tellBar();
        break;
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        if (this._railPanel) this._railPanel.textContent = this.getAttribute('label') || '';
        this._applyName();
        break;
      case 'badge-label':
        this._applyName();
        break;
      case 'href':
        if ((this.getAttribute('href') === null) !== (this._btn.localName === 'button')) this._swapItem();
        else if (this._btn.localName === 'a') this._btn.setAttribute('href', this.getAttribute('href'));
        break;
      case 'badge':
      case 'badge-dot':
        this._applyBadge();
        this._applyName();
        break;
    }
  }
}

customElements.define('glk-tab-item', GlkTabItem);

export { GlkTabItem };
