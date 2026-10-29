import { GlkElement } from '../../base.js';

// Progress through a short flow — purely presentational. Came back from
// EhrenPfoten in 1.15.0.
//
// Attributes: steps (comma-separated labels, or since 1.35.0 a JSON array
//             of labels or of { label, state } with state "done",
//             "current" or "todo"), current (0-based), label (aria-label
//             of the list, optional), done-label (since 1.35.0: what a
//             screen reader hears after a done step; default "done")
// Property:   current, steps (array or comma-separated text), doneLabel
// Part:       steps
//
// A state per step (since 1.35.0) for steps done in any order — in a
// publication flow the address may be approved while the app is still
// untested. A step without a state takes it from `current`, the short form
// for steps in order: before it done, at it current, after it todo.
//
// The narrowing in tight frames is the CSS block's container query; the
// element knows nothing about it. Done steps show an SVG check, not a text
// glyph, so the mark does not depend on the font.

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
const STATES = ['done', 'current', 'todo'];
const SR_ONLY = 'position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';

class GlkSteps extends GlkElement {
  static get observedAttributes() { return ['steps', 'current', 'label', 'done-label']; }

  render() {
    this._list = this.createElement('ol', ['glass-steps'], { part: 'steps' });
    this._wrapper.appendChild(this._list);
    this._build();
    this._applyLabel();
  }

  _build() {
    const items = this._entries();
    const current = this.current;
    this._list.replaceChildren();
    items.forEach(({ label, state: own }, i) => {
      const state = STATES.includes(own) ? own : i < current ? 'done' : i === current ? 'current' : 'todo';
      const item = this.createElement('li', ['glass-steps__item']);
      if (state === 'done') item.classList.add('glass-steps__item--done');
      if (state === 'current') {
        item.classList.add('glass-steps__item--current');
        item.setAttribute('aria-current', 'step');
      }
      const num = this.createElement('span', ['glass-steps__num']);
      if (state === 'done') num.innerHTML = CHECK;
      else num.textContent = String(i + 1);
      const text = this.createElement('span', ['glass-steps__label']);
      text.textContent = label;
      item.append(num, text);
      // Done says so in words: out of order, the position no longer tells.
      if (state === 'done') {
        const said = this.createElement('span', [], { style: SR_ONLY });
        said.textContent = `, ${this.doneLabel}`;
        item.appendChild(said);
      }
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

  /** The steps as { label, state }: from JSON where the attribute is an array, else from the comma list. */
  _entries() {
    const raw = (this.getAttribute('steps') || '').trim();
    if (raw.startsWith('[')) {
      try {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          return list.map(entry => (entry && typeof entry === 'object')
            ? { label: String(entry.label ?? ''), state: entry.state }
            : { label: String(entry ?? '') }).filter(entry => entry.label);
        }
      } catch { /* not JSON: a comma list after all */ }
    }
    return raw.split(',').map(s => s.trim()).filter(Boolean).map(label => ({ label }));
  }

  /** The labels; set an array of labels or of { label, state }, or comma-separated text. */
  get steps() { return this._entries().map(entry => entry.label); }
  set steps(v) {
    if (Array.isArray(v)) {
      this.setAttribute('steps', v.some(entry => entry && typeof entry === 'object') ? JSON.stringify(v) : v.join(','));
    } else {
      this.setAttribute('steps', String(v ?? ''));
    }
  }

  get doneLabel() { return this.getAttribute('done-label') || 'done'; }
  set doneLabel(v) {
    if (v) this.setAttribute('done-label', v);
    else this.removeAttribute('done-label');
  }
}

customElements.define('glk-steps', GlkSteps);
export { GlkSteps };
