import { GlkFormElement, checkControlSheet, forwardHostClicks, applyControlName, CONTROL_NAME_ATTRS } from '../../base.js';

// A name without a visible label (since 1.33.1), for a control at the end of
// a row whose title stands on the left: aria-label or aria-labelledby on the
// host name the native control inside, or label-hidden keeps the label's
// text as the name, out of sight. label-position="start" puts the text
// before the control. Parts: label, and the control's circle.

// ── Grouping ──
// Every <glk-radio> keeps its <input type="radio"> in its own shadow root, and
// native radio grouping works per tree — it does not reach across shadow
// boundaries. Two <glk-radio name="x"> would therefore both stay checked. So
// the group is kept here instead, following the native definition as closely
// as we can: same `name`, same containing tree, same form owner.

const ARROW_KEYS = {
  ArrowDown:  1, ArrowRight:  1,
  ArrowUp:   -1, ArrowLeft:  -1
};

/** Form owner, also for a peer that has not been upgraded yet. */
function ownerForm(el) {
  return (el.form !== undefined ? el.form : el.closest('form')) ?? null;
}

/** Only the selected radio is a tab stop; arrow keys move within the group. */
function syncGroupTabIndex(group) {
  const enabled = group.filter(el => !el._actuallyDisabled);
  if (!enabled.length) return;
  const focusable = enabled.find(el => el.checked) || enabled[0];
  for (const el of group) {
    if (el._input) el._input.tabIndex = el === focusable ? 0 : -1;
  }
}

class GlkRadio extends GlkFormElement {
  static get observedAttributes() {
    return ['checked', 'label', 'name', 'value', 'required', ...CONTROL_NAME_ATTRS];
  }

  static get hostStyles() { return checkControlSheet; }

  render() {
    const label = this.createElement('label', ['glass-radio']);

    this._input = this.createElement('input', ['glass-radio__input'], {
      type: 'radio'
    });

    const name = this.getAttribute('name');
    if (name) this._input.setAttribute('name', name);

    const val = this.getAttribute('value');
    if (val) this._input.setAttribute('value', val);

    const circle = this.createElement('span', ['glass-radio__circle'], { part: 'circle' });
    const dot = this.createElement('span', ['glass-radio__dot']);
    circle.appendChild(dot);

    this._labelEl = this.createElement('span', ['glass-radio__label'], { part: 'label' });
    this._labelEl.textContent = this.getAttribute('label') || '';

    label.appendChild(this._input);
    label.appendChild(circle);
    label.appendChild(this._labelEl);

    if (this.getBoolAttr('checked')) this._input.checked = true;

    this._defaultChecked = this.getBoolAttr('checked');
    this._wrapper.appendChild(label);
    applyControlName(this, this._input);
    this._syncFormValue();

    // Elements upgrade in document order, so the last `checked` one in the
    // markup wins the group — the same outcome native radios produce.
    if (this._input.checked) this._uncheckPeers();
    syncGroupTabIndex(this._group());
  }

  setupEvents() {
    // aria-labelledby may name an element parsed after this one.
    requestAnimationFrame(() => applyControlName(this, this._input));
    this._onChange = () => this._applyChange();

    this._onKeyDown = (e) => {
      const dir = ARROW_KEYS[e.key];
      if (!dir || e.ctrlKey || e.metaKey || e.altKey) return;
      const group = this._group().filter(el => !el._actuallyDisabled);
      if (group.length < 2) return;
      e.preventDefault();
      const next = group[(group.indexOf(this) + dir + group.length) % group.length];
      next._input.focus();
      next._input.checked = true;
      next._applyChange();
    };

    this._input.addEventListener('change', this._onChange);
    this._input.addEventListener('keydown', this._onKeyDown);
    this._unforwardClicks = forwardHostClicks(this, () => this._input);
  }

  teardownEvents() {
    this._input?.removeEventListener('change', this._onChange);
    this._input?.removeEventListener('keydown', this._onKeyDown);
    this._unforwardClicks?.();
  }

  /** Shared by user change and arrow-key selection, so both look identical. */
  _applyChange() {
    if (this._input.checked) this._uncheckPeers();
    this._syncing = true;
    this.setBoolAttr('checked', this._input.checked);
    this._syncing = false;
    this._syncFormValue();
    syncGroupTabIndex(this._group());
    this.emit('glk-change', { checked: this._input.checked, value: this._input.value });
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * The radio group per the HTML definition: same name, same tree, same form
   * owner — in document order, this element included.
   */
  _group() {
    const name = this.getAttribute('name');
    const root = this.getRootNode();
    if (!name || typeof root?.querySelectorAll !== 'function') return [this];
    const form = ownerForm(this);
    return [...root.querySelectorAll('glk-radio')].filter(
      el => el.getAttribute('name') === name && ownerForm(el) === form
    );
  }

  _uncheckPeers() {
    for (const el of this._group()) {
      if (el !== this && el.checked) el.checked = false;
    }
  }

  get _validityField() { return this._input; }

  /**
   * Radios are missing a value as a group: one required radio makes the
   * whole group required, and any checked one satisfies it. Each input here
   * sits alone in its shadow root, so the group's verdict is worked out across
   * the elements and handed to every member. The inner input carries
   * `required` only while the group lacks a value — that way it produces the
   * browser's own message for it.
   */
  syncValidity() {
    const group = this._group();
    const missing = group.some(el => el.hasAttribute('required')) && !group.some(el => el.checked);
    for (const el of group) {
      if (!el._input) continue;            // not rendered yet; syncs when it is
      el._input.required = missing;
      super.syncValidity.call(el);
    }
  }

  onAttributeChanged(name) {
    if (this._syncing) return;
    if (!this._input) return;
    switch (name) {
      case 'aria-label':
      case 'aria-labelledby':
        applyControlName(this, this._input);
        break;
      case 'checked':
        this._input.checked = this.getBoolAttr('checked');
        if (this._input.checked) this._uncheckPeers();
        this._syncFormValue();
        syncGroupTabIndex(this._group());
        break;
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        break;
      case 'name':
        this._input.setAttribute('name', this.getAttribute('name') || '');
        syncGroupTabIndex(this._group());
        break;
      case 'value':
        this._input.setAttribute('value', this.getAttribute('value') || '');
        this._syncFormValue();
        break;
    }
  }

  applyDisabled(disabled) {
    this._input.disabled = disabled;
    syncGroupTabIndex(this._group());
  }

  _syncFormValue() {
    const val = this.getAttribute('value') || '';
    this.setFormValue(this._input.checked ? val : null);
  }

  resetValue() {
    this._input.checked = this._defaultChecked;
    this.setBoolAttr('checked', this._defaultChecked);
    this._syncFormValue();
    syncGroupTabIndex(this._group());
  }

  // Before render() the attribute carries the state: render() reads it.
  get checked() { return this._input ? this._input.checked : this.getBoolAttr('checked'); }
  set checked(v) {
    if (this._input) this._input.checked = v;
    // Also covers the case where the attribute is already present, so
    // setBoolAttr stays silent and onAttributeChanged never runs.
    if (v) this._uncheckPeers();
    this.setBoolAttr('checked', v);
    if (this._input) this._syncFormValue();
    syncGroupTabIndex(this._group());
  }

  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }

  get value() { return this.getAttribute('value'); }
  set value(v) { this.setAttribute('value', v); }

  get labelHidden() { return this.getBoolAttr('label-hidden'); }
  set labelHidden(v) { this.setBoolAttr('label-hidden', v); }

  /** "end" (the default) or "start". */
  get labelPosition() { return this.getAttribute('label-position') === 'start' ? 'start' : 'end'; }
  set labelPosition(v) {
    if (v === 'start') this.setAttribute('label-position', 'start');
    else this.removeAttribute('label-position');
  }
}

customElements.define('glk-radio', GlkRadio);
export { GlkRadio };
