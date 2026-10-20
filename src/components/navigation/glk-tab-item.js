import { GlkElement } from '../../base.js';

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

class GlkTabItem extends GlkElement {
  static get observedAttributes() {
    return ['label', 'active', 'badge'];
  }

  static get observesLightDom() { return true; }

  render() {
    this._btn = this.createElement('button', ['glass-tab-bar__item']);
    if (this.getBoolAttr('active')) this._btn.classList.add('is-active');

    // Icon — clone SVG from light DOM into shadow DOM so GlassKit CSS applies,
    // or show what is slotted as icon
    this._iconEl = this.createElement('span', ['glass-tab-bar__icon']);
    this._iconEl.appendChild(this.createElement('slot', [], { name: 'icon' }));

    // Label
    this._labelEl = this.createElement('span', ['glass-tab-bar__label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    // Badge inside icon container (position: absolute relative to icon)
    const badge = this.getAttribute('badge');
    if (badge) {
      this._badgeEl = this.createElement('span', ['glass-tab-bar__badge']);
      this._badgeEl.textContent = badge;
      this._iconEl.appendChild(this._badgeEl);
    }

    this._btn.appendChild(this._iconEl);
    this._btn.appendChild(this._labelEl);

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

  setupEvents() {
    this._onClick = () => {
      if (!this.emit('glk-tab-select', null, { cancelable: true })) return;
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
  _syncBar({ floating, droplet, placed, drag }) {
    if (!this._wrapper) return;
    this._wrapper.classList.toggle('glass-tab-bar--floating', floating);
    this._wrapper.classList.toggle('glass-tab-bar--droplet', droplet);
    this._wrapper.toggleAttribute('data-droplet', placed);
    this._wrapper.toggleAttribute('data-droplet-drag', drag);
  }

  /** Tells the bar that this item rendered or changed its active state. */
  _tellBar() {
    this.closest('glk-tab-bar')?._itemChanged?.();
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    switch (name) {
      case 'active':
        this._btn.classList.toggle('is-active', this.getBoolAttr('active'));
        this._tellBar();
        break;
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        break;
      case 'badge': {
        const badge = this.getAttribute('badge');
        if (badge) {
          if (!this._badgeEl) {
            this._badgeEl = this.createElement('span', ['glass-tab-bar__badge']);
            this._iconEl.appendChild(this._badgeEl);
          }
          this._badgeEl.textContent = badge;
        } else if (this._badgeEl) {
          this._badgeEl.remove();
          this._badgeEl = null;
        }
        break;
      }
    }
  }
}

customElements.define('glk-tab-item', GlkTabItem);
export { GlkTabItem };
