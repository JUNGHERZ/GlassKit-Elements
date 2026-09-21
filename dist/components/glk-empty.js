import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// Empty state for lists and result pages. Came back from EhrenPfoten in 1.15.0.
//
// Attributes: title, text — an empty one hides its element instead of
//             leaving an empty paragraph
// Slots:      default (icon, with a plain circle as slot fallback), action
// Parts:      empty, icon, title, text, action

const FALLBACK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>';

class GlkEmpty extends GlkElement {
  static get observedAttributes() { return ['title', 'text']; }

  render() {
    const root = this.createElement('div', ['glass-empty'], { part: 'empty' });
    const icon = this.createElement('span', ['glass-empty__icon'], { part: 'icon' });
    const iconSlot = document.createElement('slot');
    iconSlot.innerHTML = FALLBACK_ICON;
    icon.appendChild(iconSlot);
    this._titleEl = this.createElement('p', ['glass-empty__title'], { part: 'title' });
    this._textEl = this.createElement('p', ['glass-empty__text'], { part: 'text' });
    const action = this.createElement('div', ['glass-empty__action'], { part: 'action' });
    action.appendChild(this.createElement('slot', [], { name: 'action' }));
    root.append(icon, this._titleEl, this._textEl, action);
    this._wrapper.appendChild(root);
    this._update();
  }

  _update() {
    const title = this.getAttribute('title') || '';
    const text = this.getAttribute('text') || '';
    this._titleEl.textContent = title;
    this._titleEl.hidden = !title;
    this._textEl.textContent = text;
    this._textEl.hidden = !text;
  }

  onAttributeChanged() {
    if (this._titleEl) this._update();
  }

  get text() { return this.getAttribute('text') || ''; }
  set text(v) {
    if (v) this.setAttribute('text', v);
    else this.removeAttribute('text');
  }
}

customElements.define('glk-empty', GlkEmpty);

export { GlkEmpty };
