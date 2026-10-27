import { GlkElement } from '../../base.js';

// Items of <glk-menu> that belong together (since 1.32.0): role="group",
// named by `label`, which also shows above them — GlassKit's
// .glass-menu__group-label. Radio items check one of their own group.

class GlkMenuGroup extends GlkElement {
  static get observedAttributes() { return ['label']; }

  constructor() {
    super();
    this._internals = this.attachInternals();
    this._internals.role = 'group';
  }

  render() {
    this._labelEl = this.createElement('div', ['glass-menu__group-label'], { 'aria-hidden': 'true' });
    this._wrapper.append(this._labelEl, document.createElement('slot'));
    this._apply();
  }

  onAttributeChanged() { if (this._labelEl) this._apply(); }

  _apply() {
    const label = this.getAttribute('label') || '';
    this._labelEl.textContent = label;
    this._labelEl.hidden = !label;
    this._internals.ariaLabel = label || null;
  }

  get label() { return this.getAttribute('label') || ''; }
  set label(v) {
    if (v) this.setAttribute('label', v);
    else this.removeAttribute('label');
  }
}

customElements.define('glk-menu-group', GlkMenuGroup);
export { GlkMenuGroup };
