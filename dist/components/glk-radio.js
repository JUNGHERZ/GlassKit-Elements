import { a as GlkFormElement } from './shared/base-BoN33KPe.js';

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
  const enabled = group.filter(el => !el.disabled);
  if (!enabled.length) return;
  const focusable = enabled.find(el => el.checked) || enabled[0];
  for (const el of group) {
    if (el._input) el._input.tabIndex = el === focusable ? 0 : -1;
  }
}

class GlkRadio extends GlkFormElement {
  static get observedAttributes() {
    return ['checked', 'disabled', 'label', 'name', 'value'];
  }

  render() {
    const label = this.createElement('label', ['glass-radio']);

    this._input = this.createElement('input', ['glass-radio__input'], {
      type: 'radio'
    });

    const name = this.getAttribute('name');
    if (name) this._input.setAttribute('name', name);

    const val = this.getAttribute('value');
    if (val) this._input.setAttribute('value', val);

    const circle = this.createElement('span', ['glass-radio__circle']);
    const dot = this.createElement('span', ['glass-radio__dot']);
    circle.appendChild(dot);

    this._labelEl = this.createElement('span', ['glass-radio__label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    label.appendChild(this._input);
    label.appendChild(circle);
    label.appendChild(this._labelEl);

    if (this.getBoolAttr('checked')) this._input.checked = true;
    if (this.getBoolAttr('disabled')) this._input.disabled = true;

    this._defaultChecked = this.getBoolAttr('checked');
    this._wrapper.appendChild(label);
    this._syncFormValue();

    // Elements upgrade in document order, so the last `checked` one in the
    // markup wins the group — the same outcome native radios produce.
    if (this._input.checked) this._uncheckPeers();
    syncGroupTabIndex(this._group());
  }

  setupEvents() {
    this._onChange = () => this._applyChange();

    this._onKeyDown = (e) => {
      const dir = ARROW_KEYS[e.key];
      if (!dir || e.ctrlKey || e.metaKey || e.altKey) return;
      const group = this._group().filter(el => !el.disabled);
      if (group.length < 2) return;
      e.preventDefault();
      const next = group[(group.indexOf(this) + dir + group.length) % group.length];
      next._input.focus();
      next._input.checked = true;
      next._applyChange();
    };

    this._input.addEventListener('change', this._onChange);
    this._input.addEventListener('keydown', this._onKeyDown);
  }

  teardownEvents() {
    this._input?.removeEventListener('change', this._onChange);
    this._input?.removeEventListener('keydown', this._onKeyDown);
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

  onAttributeChanged(name) {
    if (this._syncing) return;
    if (!this._input) return;
    switch (name) {
      case 'checked':
        this._input.checked = this.getBoolAttr('checked');
        if (this._input.checked) this._uncheckPeers();
        this._syncFormValue();
        syncGroupTabIndex(this._group());
        break;
      case 'disabled':
        this._input.disabled = this.getBoolAttr('disabled');
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

  get checked() { return this._input?.checked ?? false; }
  set checked(v) {
    if (this._input) this._input.checked = v;
    // Also covers the case where the attribute is already present, so
    // setBoolAttr stays silent and onAttributeChanged never runs.
    if (v) this._uncheckPeers();
    this.setBoolAttr('checked', v);
    this._syncFormValue();
    syncGroupTabIndex(this._group());
  }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }

  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }

  get value() { return this.getAttribute('value'); }
  set value(v) { this.setAttribute('value', v); }
}

customElements.define('glk-radio', GlkRadio);

export { GlkRadio };
