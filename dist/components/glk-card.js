import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// <glk-card fill> stretches the visible card to the height of its grid or flex
// cell. The host must become a grid for this: it is stretched by the outer
// layout but keeps height:auto, so a percentage height on the inner card has
// nothing definite to resolve against. Making the host a grid stretches its
// single child instead, which needs no percentage at all. The card also becomes
// a flex column so a footer can be pushed down with margin-top:auto.
//
// Both boxes are grid items now, and a grid item's min-width:auto is its
// min-content width — content that cannot wrap (a nowrap list subtitle) would
// widen the card past its cell instead of being truncated. min-width:0 lets the
// card and the host yield to the cell; min-height:0 does the same for a cell of
// fixed height, so a scrollable child inside the card can shrink and scroll.
const fillSheet = new CSSStyleSheet();
fillSheet.replaceSync(`
  :host([fill]) { display: grid; min-width: 0; }
  :host([fill]) .glass-card { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
`);

class GlkCard extends GlkElement {
  static get observedAttributes() {
    return ['glow', 'fill'];
  }

  static get hostStyles() { return fillSheet; }

  render() {
    this._card = this.createElement('div', this._computeClasses(), { part: 'card' });
    this._card.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._card);
  }

  onAttributeChanged(name) {
    if (name === 'glow' && this._card) {
      this._card.className = this._computeClasses().join(' ');
    }
  }

  _computeClasses() {
    const classes = ['glass-card'];
    if (this.getBoolAttr('glow')) {
      classes.push('glass-card--glow');
    }
    return classes;
  }

  get glow() { return this.getBoolAttr('glow'); }
  set glow(v) { this.setBoolAttr('glow', v); }

  get fill() { return this.getBoolAttr('fill'); }
  set fill(v) { this.setBoolAttr('fill', v); }
}

customElements.define('glk-card', GlkCard);

export { GlkCard };
