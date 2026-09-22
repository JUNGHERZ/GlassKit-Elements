import { GlkFormElement } from './base.js';
import { i as isoDate, r as resolveLocale, f as formatters, p as parseIso, a as firstWeekday, b as parseJsonObject, w as weekdayShort, c as addDays, d as isTone } from './shared/dates-CNWaJf09.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// One month with a day to pick. Came back from EhrenPfoten in 1.16.0.
//
// Attributes: month (YYYY-MM; without it the month of the value, else of
//             today), value (YYYY-MM-DD), today (YYYY-MM-DD), min, max
//             (YYYY-MM-DD; days outside cannot be picked), marks (JSON
//             {date: tone | [tone, …]}, up to three dots), locale (default
//             the browser language), week-start (0 = Sunday … 6 = Saturday;
//             default from the locale, Monday where the browser cannot say),
//             label (aria-label of the day group), prev-label / next-label
//             (names of the nav buttons, English by default)
// Properties: month, value, marks, locale, label
// Form:       associated — a surrounding <form> receives name=value, reset
//             restores the initial value, like <glk-segmented>
// Events:     glk-change { value } — on a pick by the user
//             glk-month { month } — when the user moves to another month
// Parts:      calendar, head, title, grid
//
// The days are buttons in a role="group" with aria-pressed on the chosen
// one, each named with its full date; the weekday row is decorative. One tab
// stop (roving tabindex): arrows move by a day or a week, Home/End to the
// ends of the week, PageUp/PageDown by a month; moving past the month's edge
// shows that month and emits glk-month. Arrows only move focus — Enter or
// Space picks — so a calendar that opens a sheet on every pick stays quiet
// while the user looks around. Days outside min/max carry aria-disabled
// rather than disabled: they stay in the arrow path and are announced, but
// neither click nor Enter picks them. A value set to another month flips the
// calendar to that month.

const CHEVRON_LEFT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
const CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
const STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
const CELLS = 42;
const MONTH = /^\d{4}-\d{2}$/;

function tonesOf(entry) {
  const list = Array.isArray(entry) ? entry : [entry];
  return list.filter(isTone).slice(0, 3);
}

class GlkCalendar extends GlkFormElement {
  static get observedAttributes() {
    return ['month', 'value', 'today', 'min', 'max', 'marks', 'locale', 'week-start', 'label', 'prev-label', 'next-label'];
  }

  render() {
    this._root = this.createElement('div', ['glass-calendar'], { part: 'calendar' });
    const head = this.createElement('div', ['glass-calendar__head'], { part: 'head' });
    this._prev = this.createElement('button', ['glass-calendar__nav'], { type: 'button' });
    this._prev.innerHTML = CHEVRON_LEFT;
    this._title = this.createElement('div', ['glass-calendar__title'], { part: 'title', 'aria-live': 'polite' });
    this._next = this.createElement('button', ['glass-calendar__nav'], { type: 'button' });
    this._next.innerHTML = CHEVRON_RIGHT;
    head.append(this._prev, this._title, this._next);
    this._grid = this.createElement('div', ['glass-calendar__grid'], { role: 'group', part: 'grid' });
    this._root.append(head, this._grid);
    this._wrapper.appendChild(this._root);
    this._initialValue = this.value;
    this._applyLabels();
    this._build();
  }

  get _todayIso() { return this.getAttribute('today') || isoDate(new Date()); }

  _build() {
    const locale = resolveLocale(this.getAttribute('locale'));
    const f = formatters(locale);
    const month = this.month;
    const first = parseIso(month);
    const weekStartAttr = this.hasAttribute('week-start') ? Number(this.getAttribute('week-start')) : NaN;
    this._weekStart = Number.isInteger(weekStartAttr) && weekStartAttr >= 0 && weekStartAttr <= 6 ? weekStartAttr : firstWeekday(locale);
    const marks = parseJsonObject(this.getAttribute('marks'));
    const today = this._todayIso;
    const min = this.getAttribute('min') || '';
    const max = this.getAttribute('max') || '';
    this._shown = month;
    this._title.textContent = f.month.format(first);
    this._grid.replaceChildren();
    const offset = (first.getDay() - this._weekStart + 7) % 7;   // cells before the 1st
    for (let i = 0; i < 7; i += 1) {
      const wd = this.createElement('span', ['glass-calendar__wd'], { 'aria-hidden': 'true' });
      wd.textContent = weekdayShort(f, addDays(first, i - offset));
      this._grid.appendChild(wd);
    }
    for (let i = 0; i < CELLS; i += 1) {
      const date = addDays(first, i - offset);
      const iso = isoDate(date);
      const day = this.createElement('button', ['glass-calendar__day'], { type: 'button', 'data-value': iso, 'aria-label': f.day.format(date) });
      if (date.getMonth() !== first.getMonth()) day.classList.add('glass-calendar__day--other');
      if (iso === today) day.classList.add('glass-calendar__day--today');
      if ((min && iso < min) || (max && iso > max)) day.setAttribute('aria-disabled', 'true');
      const num = this.createElement('span');
      num.textContent = String(date.getDate());
      const dots = this.createElement('span', ['glass-calendar__marks']);
      for (const tone of tonesOf(marks[iso])) {
        dots.appendChild(this.createElement('span', ['glass-calendar__mark', `glass-calendar__mark--${tone}`]));
      }
      day.append(num, dots);
      this._grid.appendChild(day);
    }
    this._syncValue();
  }

  _days() { return [...this._grid.querySelectorAll('button[data-value]')]; }
  _dayFor(iso) { return this._grid.querySelector(`button[data-value="${iso}"]`); }

  _syncValue() {
    const value = this.value;
    let pressed = null;
    for (const day of this._days()) {
      const on = day.dataset.value === value;
      day.setAttribute('aria-pressed', String(on));
      if (on) pressed = day;
    }
    const today = this._todayIso;
    const fallback = today.startsWith(this._shown) ? this._dayFor(today) : this._dayFor(`${this._shown}-01`);
    this._setTabStop(pressed ?? fallback ?? this._days()[0]);
    this.setFormValue(value);
  }

  _setTabStop(target) {
    for (const day of this._days()) day.tabIndex = day === target ? 0 : -1;
  }

  _applyLabels() {
    const label = this.getAttribute('label');
    if (label) this._grid.setAttribute('aria-label', label);
    else this._grid.removeAttribute('aria-label');
    this._prev.setAttribute('aria-label', this.getAttribute('prev-label') || 'Previous month');
    this._next.setAttribute('aria-label', this.getAttribute('next-label') || 'Next month');
  }

  // Show another month because the user asked for it — nav buttons or a key
  // that crossed the month's edge. Setting the attribute rebuilds the grid.
  _show(month) {
    this.month = month;
    this.emit('glk-month', { month });
  }

  _shift(delta) {
    const first = parseIso(this.month);
    const next = new Date(first.getFullYear(), first.getMonth() + delta, 1);
    this._show(isoDate(next).slice(0, 7));
  }

  _focusDay(date) {
    const iso = isoDate(date);
    if (!iso.startsWith(this._shown)) this._show(iso.slice(0, 7));
    const day = this._dayFor(iso);
    if (!day) return;
    this._setTabStop(day);
    day.focus();
  }

  _pick(value) {
    if (value === this.value) return;
    this.value = value;
    this.emit('glk-change', { value });
  }

  setupEvents() {
    this._onPrev = () => this._shift(-1);
    this._onNext = () => this._shift(1);
    this._onClick = (event) => {
      const day = event.target.closest('button[data-value]');
      if (!day) return;
      this._setTabStop(day);
      if (day.getAttribute('aria-disabled') === 'true') return;
      this._pick(day.dataset.value);
    };
    this._onKeydown = (event) => {
      const from = event.target.closest('button[data-value]');
      if (!from) return;
      const date = parseIso(from.dataset.value);
      const weekday = (date.getDay() - this._weekStart + 7) % 7;
      let target;
      if (event.key in STEPS) target = addDays(date, STEPS[event.key]);
      else if (event.key === 'Home') target = addDays(date, -weekday);
      else if (event.key === 'End') target = addDays(date, 6 - weekday);
      else if (event.key === 'PageUp' || event.key === 'PageDown') {
        const months = event.key === 'PageUp' ? -1 : 1;
        const last = new Date(date.getFullYear(), date.getMonth() + months + 1, 0).getDate();
        target = new Date(date.getFullYear(), date.getMonth() + months, Math.min(date.getDate(), last));
      } else return;
      event.preventDefault();
      this._focusDay(target);
    };
    this._prev.addEventListener('click', this._onPrev);
    this._next.addEventListener('click', this._onNext);
    this._grid.addEventListener('click', this._onClick);
    this._grid.addEventListener('keydown', this._onKeydown);
  }

  teardownEvents() {
    this._prev?.removeEventListener('click', this._onPrev);
    this._next?.removeEventListener('click', this._onNext);
    this._grid?.removeEventListener('click', this._onClick);
    this._grid?.removeEventListener('keydown', this._onKeydown);
  }

  onAttributeChanged(name) {
    if (!this._grid) return;
    switch (name) {
      case 'value': {
        const value = this.value;
        if (value && !value.startsWith(this._shown)) this.month = value.slice(0, 7);   // rebuilds via 'month'
        else this._syncValue();
        break;
      }
      case 'label':
      case 'prev-label':
      case 'next-label':
        this._applyLabels();
        break;
      default:
        this._build();
    }
  }

  resetValue() { this.value = this._initialValue; }
  restoreValue(state) { if (typeof state === 'string') this.value = state; }

  get month() {
    const attr = this.getAttribute('month');
    if (attr && MONTH.test(attr) && parseIso(attr)) return attr;
    const value = this.value;
    return (value && parseIso(value) ? value : this._todayIso).slice(0, 7);
  }
  set month(v) {
    if (v && MONTH.test(String(v))) this.setAttribute('month', String(v));
    else this.removeAttribute('month');
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

customElements.define('glk-calendar', GlkCalendar);

export { GlkCalendar };
