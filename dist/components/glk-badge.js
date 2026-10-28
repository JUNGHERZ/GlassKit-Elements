import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// warning since 1.18.0 (needs GlassKit 1.18.0). Any other value falls back to
// the neutral badge, as an unknown value of an enumerated attribute does.
//
// size="md" (since 1.33.0) makes a chip to choose with, 36px high in the
// small text of a form — GlassKit's .glass-badge--md; interactive, it takes
// taps on 44px. Part badge (since 1.33.0): the span, or the button.
const VARIANTS = ['primary', 'success', 'warning', 'error'];

class GlkBadge extends GlkElement {
  static get displayInline() { return true; }
  static get observedAttributes() {
    return ['variant', 'interactive', 'selected', 'size'];
  }

  render() {
    // One slot for the lifetime of the element — it moves between hosts when
    // the badge turns into a chip and back, so the light-DOM children never
    // have to be re-assigned.
    this._slot = document.createElement('slot');
    this._mount();
  }

  // A chip is a real <button>, so the keyboard, the focus ring and the
  // aria-pressed announcement come for free; a plain badge stays a <span>.
  // Toggling `interactive` therefore swaps the element, not just a class.
  _mount() {
    const interactive = this.getBoolAttr('interactive');
    const el = this.createElement(interactive ? 'button' : 'span', this._computeClasses(), { part: 'badge' });
    if (interactive) {
      el.type = 'button';
      el.setAttribute('aria-pressed', String(this.getBoolAttr('selected')));
    }
    el.appendChild(this._slot);

    if (this._badge) {
      this._badge.removeEventListener('click', this._onClick);
      this._badge.replaceWith(el);
    } else {
      this._wrapper.appendChild(el);
    }
    this._badge = el;
    // setupEvents() has not run yet on the very first mount; it attaches then.
    if (this._onClick) el.addEventListener('click', this._onClick);
  }

  setupEvents() {
    // Forward clicks as glk-click — only for chips, like glk-list-item.
    this._onClick = () => {
      if (this.getBoolAttr('interactive')) {
        this.emit('glk-click');
      }
    };
    this._badge.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    this._badge?.removeEventListener('click', this._onClick);
    // Forget the handler, or a swap while disconnected would re-attach it and
    // the next connect would add a second one — two glk-click per click.
    this._onClick = null;
  }

  onAttributeChanged(name) {
    if (!this._badge) return;
    switch (name) {
      case 'interactive':
        this._mount();
        break;
      case 'variant':
      case 'selected':
      case 'size':
        this._badge.className = this._computeClasses().join(' ');
        if (this._badge.tagName === 'BUTTON') {
          this._badge.setAttribute('aria-pressed', String(this.getBoolAttr('selected')));
        }
        break;
    }
  }

  _computeClasses() {
    const classes = ['glass-badge'];
    const variant = this.getAttribute('variant');
    if (variant && VARIANTS.includes(variant)) {
      classes.push(`glass-badge--${variant}`);
    }
    if (this.getAttribute('size') === 'md') classes.push('glass-badge--md');
    if (this.getBoolAttr('interactive')) classes.push('glass-badge--interactive');
    if (this.getBoolAttr('selected')) classes.push('glass-badge--selected');
    return classes;
  }

  /**
   * A chip takes the focus on its button (since 1.33.2). Not delegated: a
   * plain badge has nothing to focus, and a click on it must still reach a
   * row or card around it that takes the focus.
   */
  focus(options) {
    if (this._badge?.localName === 'button') this._badge.focus(options);
    else super.focus(options);
  }

  get variant() { return this.getAttribute('variant'); }
  set variant(v) { this.setAttribute('variant', v); }

  get interactive() { return this.getBoolAttr('interactive'); }
  set interactive(v) { this.setBoolAttr('interactive', v); }

  get selected() { return this.getBoolAttr('selected'); }
  set selected(v) { this.setBoolAttr('selected', v); }

  /** "sm" (the default) or "md", a chip to choose with. */
  get size() { return this.getAttribute('size') === 'md' ? 'md' : 'sm'; }
  set size(v) {
    if (v === 'md') this.setAttribute('size', 'md');
    else this.removeAttribute('size');
  }
}

customElements.define('glk-badge', GlkBadge);

export { GlkBadge };
