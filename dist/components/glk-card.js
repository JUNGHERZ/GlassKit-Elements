import { G as GlkElement } from './shared/base-Bm9Z714o.js';

// <glk-card fill> stretches the visible card to the height of its grid or flex
// cell. The host must become a grid for this: it is stretched by the outer
// layout but keeps height:auto, so a percentage height on the inner card has
// nothing definite to resolve against. Making the host a grid stretches its
// single child instead, which needs no percentage at all. The card also becomes
// a flex column so a footer can be pushed down with margin-top:auto.
const fillSheet = new CSSStyleSheet();
fillSheet.replaceSync(`
  :host([fill]) { display: grid; }
  :host([fill]) .glass-card { display: flex; flex-direction: column; }
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
