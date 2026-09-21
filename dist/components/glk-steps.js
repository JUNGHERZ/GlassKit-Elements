import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// Progress through a short flow — purely presentational. Came back from
// EhrenPfoten in 1.15.0.
//
// Attributes: steps (comma-separated labels), current (0-based), label
//             (aria-label of the list, optional)
// Property:   current, steps (array or comma-separated text)
// Part:       steps
//
// The narrowing in tight frames is the CSS block's container query; the
// element knows nothing about it. Done steps show an SVG check, not a text
// glyph, so the mark does not depend on the font.

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';

class GlkSteps extends GlkElement {
  static get observedAttributes() { return ['steps', 'current', 'label']; }

  render() {
    this._list = this.createElement('ol', ['glass-steps'], { part: 'steps' });
    this._wrapper.appendChild(this._list);
    this._build();
    this._applyLabel();
  }

  _build() {
    const items = this.steps;
    const current = this.current;
    this._list.replaceChildren();
    items.forEach((label, i) => {
      const item = this.createElement('li', ['glass-steps__item']);
      if (i < current) item.classList.add('glass-steps__item--done');
      if (i === current) {
        item.classList.add('glass-steps__item--current');
        item.setAttribute('aria-current', 'step');
      }
      const num = this.createElement('span', ['glass-steps__num']);
      if (i < current) num.innerHTML = CHECK;
      else num.textContent = String(i + 1);
      const text = this.createElement('span', ['glass-steps__label']);
      text.textContent = label;
      item.append(num, text);
      this._list.appendChild(item);
      if (i < items.length - 1) {
        this._list.appendChild(this.createElement('li', ['glass-steps__line'], { 'aria-hidden': 'true' }));
      }
    });
  }

  _applyLabel() {
    const label = this.getAttribute('label');
    if (label) this._list.setAttribute('aria-label', label);
    else this._list.removeAttribute('aria-label');
  }

  onAttributeChanged(name) {
    if (!this._list) return;
    if (name === 'label') this._applyLabel();
    else this._build();
  }

  get current() { return Number(this.getAttribute('current')) || 0; }
  set current(v) { this.setAttribute('current', String(Number(v) || 0)); }

  get steps() {
    return (this.getAttribute('steps') || '').split(',').map(s => s.trim()).filter(Boolean);
  }
  set steps(v) { this.setAttribute('steps', Array.isArray(v) ? v.join(',') : String(v ?? '')); }
}

customElements.define('glk-steps', GlkSteps);

export { GlkSteps };
