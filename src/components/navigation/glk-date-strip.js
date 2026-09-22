import { GlkElement } from '../../base.js';
import { isoDate, parseIso, addDays, parseJsonObject, resolveLocale, formatters, weekdayShort, isTone } from '../../dates.js';

// A row of day chips that scrolls sideways — a booking horizon, the days
// around today. Came back from EhrenPfoten in 1.16.0.
//
// Attributes: start (YYYY-MM-DD, default today), days (count, default 7),
//             value (YYYY-MM-DD), today (YYYY-MM-DD, default the browser's
//             day), marks (JSON {date: tone | {tone, disabled}}), locale
//             (default the browser language), label (aria-label of the group)
// Properties: value, marks (object or JSON text), locale, label
// Event:      glk-change { value } — only on a change made by the user
// Part:       strip
//
// The chips are buttons in a role="group" with aria-pressed on the chosen
// one, like <glk-segmented>; each chip is named with its full date, so a
// screen reader hears "Monday, 22 September 2026" rather than "Mo 22". One
// tab stop: arrow keys move between chips, Home/End jump to the ends, Enter
// or Space presses. The chosen chip is scrolled to the middle of the strip
// after the first layout and on every value change — the strip alone
// scrolls, never the page. A value change only re-sets state; the chips are
// rebuilt for start, days, today, marks and locale.

const KEYS = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity };

function readMark(entry) {
  if (isTone(entry)) return { tone: entry, disabled: false };
  if (entry && typeof entry === 'object') return { tone: isTone(entry.tone) ? entry.tone : '', disabled: Boolean(entry.disabled) };
  return { tone: '', disabled: false };
}

class GlkDateStrip extends GlkElement {
  static get observedAttributes() { return ['start', 'days', 'value', 'today', 'marks', 'locale', 'label']; }

  render() {
    this._strip = this.createElement('div', ['glass-date-strip'], { role: 'group', part: 'strip' });
    this._wrapper.appendChild(this._strip);
    this._build();
    this._applyLabel();
  }

  _build() {
    const f = formatters(resolveLocale(this.getAttribute('locale')));
    const marks = parseJsonObject(this.getAttribute('marks'));
    const start = parseIso(this.getAttribute('start')) ?? new Date();
    const today = this.getAttribute('today') || isoDate(new Date());
    const count = Math.max(1, Math.floor(Number(this.getAttribute('days'))) || 7);
    this._strip.replaceChildren();
    for (let i = 0; i < count; i += 1) {
      const date = addDays(start, i);
      const iso = isoDate(date);
      const mark = readMark(marks[iso]);
      const chip = this.createElement('button', ['glass-date-strip__day'], { type: 'button', 'data-value': iso, 'aria-label': f.day.format(date) });
      if (iso === today) chip.classList.add('glass-date-strip__day--today');
      if (mark.disabled) chip.disabled = true;
      const wd = this.createElement('span', ['glass-date-strip__wd']);
      wd.textContent = weekdayShort(f, date);
      const num = this.createElement('span', ['glass-date-strip__num']);
      num.textContent = String(date.getDate());
      const dot = this.createElement('span', ['glass-date-strip__mark']);
      if (mark.tone) dot.classList.add(`glass-date-strip__mark--${mark.tone}`);
      chip.append(wd, num, dot);
      this._strip.appendChild(chip);
    }
    this._syncValue();
  }

  _chips() { return [...this._strip.querySelectorAll('button[data-value]')]; }

  _syncValue() {
    const value = this.value;
    let chosen = null;
    for (const chip of this._chips()) {
      const pressed = chip.dataset.value === value;
      chip.setAttribute('aria-pressed', String(pressed));
      if (pressed) chosen = chip;
    }
    const chips = this._chips();
    this._setTabStop(chosen ?? chips.find(chip => !chip.disabled) ?? chips[0]);
    this._reveal(this._revealedAt ? 'smooth' : 'instant');
  }

  _setTabStop(target) {
    for (const chip of this._chips()) chip.tabIndex = chip === target ? 0 : -1;
  }

  // Scroll the chosen chip to the middle of the strip. Computed from client
  // rects and applied to the strip's own scrollLeft, so the page never moves —
  // scrollIntoView would scroll every ancestor. Before the first layout the
  // strip has no width; the ResizeObserver in setupEvents centres then, and
  // again whenever the strip's width changes — a parent that upgrades later
  // and adds its padding, a window resize, a strip that starts out hidden. A
  // value change glides unless the user asked for reduced motion; a size
  // change snaps, so a settling layout never animates.
  _reveal(behavior = 'instant') {
    const chip = this._strip.querySelector('[aria-pressed="true"]');
    const width = this._strip.clientWidth;
    if (!chip || !width) return;
    const strip = this._strip.getBoundingClientRect();
    const box = chip.getBoundingClientRect();
    const left = this._strip.scrollLeft + (box.left - strip.left) - (strip.width - box.width) / 2;
    const smooth = behavior === 'smooth' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._strip.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'instant' });
    this._revealedAt = width;
  }

  _applyLabel() {
    const label = this.getAttribute('label');
    if (label) this._strip.setAttribute('aria-label', label);
    else this._strip.removeAttribute('aria-label');
  }

  setupEvents() {
    this._onClick = (event) => {
      const chip = event.target.closest('button[data-value]');
      if (!chip || chip.disabled || chip.getAttribute('aria-disabled') === 'true') return;
      this._setTabStop(chip);
      const { value } = chip.dataset;
      if (value === this.value) return;
      this.value = value;
      this.emit('glk-change', { value });
    };
    this._onKeydown = (event) => {
      const step = KEYS[event.key];
      if (step === undefined) return;
      const chips = this._chips().filter(chip => !chip.disabled);
      const from = chips.indexOf(event.target.closest('button[data-value]'));
      if (from < 0) return;
      const to = Number.isFinite(step) ? Math.min(chips.length - 1, Math.max(0, from + step)) : (step < 0 ? 0 : chips.length - 1);
      event.preventDefault();
      this._setTabStop(chips[to]);
      chips[to].focus();
    };
    this._onResize = () => { if (this._strip.clientWidth !== this._revealedAt) this._reveal('instant'); };
    this._strip.addEventListener('click', this._onClick);
    this._strip.addEventListener('keydown', this._onKeydown);
    this._resizeObserver = new ResizeObserver(this._onResize);
    this._resizeObserver.observe(this._strip);
  }

  teardownEvents() {
    this._strip?.removeEventListener('click', this._onClick);
    this._strip?.removeEventListener('keydown', this._onKeydown);
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  onAttributeChanged(name) {
    if (!this._strip) return;
    if (name === 'value') this._syncValue();
    else if (name === 'label') this._applyLabel();
    else this._build();
  }

  get value() { return this.getAttribute('value') ?? ''; }
  set value(v) {
    if (v == null || v === '') this.removeAttribute('value');
    else this.setAttribute('value', String(v));
  }

  get marks() { return parseJsonObject(this.getAttribute('marks')); }
  set marks(v) { this.setAttribute('marks', typeof v === 'string' ? v : JSON.stringify(v ?? {})); }

  get locale() { return resolveLocale(this.getAttribute('locale')); }
  set locale(v) {
    if (v) this.setAttribute('locale', v);
    else this.removeAttribute('locale');
  }

  get label() { return this.getAttribute('label') || ''; }
  set label(v) {
    if (v) this.setAttribute('label', v);
    else this.removeAttribute('label');
  }
}

customElements.define('glk-date-strip', GlkDateStrip);
export { GlkDateStrip };
