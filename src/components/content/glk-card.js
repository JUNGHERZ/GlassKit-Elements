import { GlkElement } from '../../base.js';

class GlkCard extends GlkElement {
  static get observedAttributes() {
    return ['glow'];
  }

  render() {
    this._card = this.createElement('div', this._computeClasses());
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
}

customElements.define('glk-card', GlkCard);
export { GlkCard };
