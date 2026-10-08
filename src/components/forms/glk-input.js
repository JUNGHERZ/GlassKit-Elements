import { GlkFormElement } from '../../base.js';

// Attributes that belong to the inner <input> and are handed down unchanged:
// the picker's range and step, the typing limits, the pattern, autofill and
// the on-screen keyboard. Absent on the host means absent inside (since
// 1.17.0 — before, a date field with min still offered every past day).
const FORWARDED = ['min', 'max', 'step', 'minlength', 'maxlength', 'pattern', 'autocomplete', 'inputmode'];

// Prefix and suffix (since 1.22.0): two slots inside the field's box, on
// GlassKit's .glass-input-wrap. An affix shows only while something is
// slotted into it, and its width is measured, so the text keeps clear of a
// unit of any length. As in GlassKit, a click on text, an icon or a disabled
// control goes through to the field, and what can be used takes its own: an
// enabled control (<glk-button>, <glk-select> … are form-associated, so they
// count), a link, an element with tabindex. GlassKit's own rule cannot reach
// slotted elements, hence this one. ::slotted() sees the slotted element,
// not what is inside it: a button wrapped in a slotted <span> needs
// pointer-events: auto from the page. Until 1.22.1 every slotted element took
// the pointer — a unit caught the click meant for the field, a disabled
// button took it and moved the focus into the field, read-only and locked
// or not. Simple selectors only inside ::slotted(), so that no browser drops
// the rule.
const affixSheet = new CSSStyleSheet();
affixSheet.replaceSync(`
  .glass-input-wrap__prefix ::slotted(:enabled),
  .glass-input-wrap__prefix ::slotted(a[href]),
  .glass-input-wrap__prefix ::slotted([tabindex]:not(:disabled)),
  .glass-input-wrap__suffix ::slotted(:enabled),
  .glass-input-wrap__suffix ::slotted(a[href]),
  .glass-input-wrap__suffix ::slotted([tabindex]:not(:disabled)) { pointer-events: auto; }
`);

class GlkInput extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'type', 'placeholder', 'error', 'hint', 'readonly', 'name', 'value', 'required', ...FORWARDED];
  }

  static get hostStyles() { return affixSheet; }

  render() {
    const group = this.createElement('div', ['glass-input-group']);

    // Label — tied to the field by id, which only has to be unique inside
    // this shadow root. That gives the field its accessible name, and a click
    // on the label text focuses it.
    this._labelEl = this.createElement('label', ['glass-label'], { for: 'field' });
    this._labelEl.textContent = this.getAttribute('label') || '';

    // Input
    this._input = this.createElement('input', this._computeInputClasses(), {
      id: 'field',
      type: this.getAttribute('type') || 'text'
    });

    const placeholder = this.getAttribute('placeholder');
    if (placeholder) this._input.setAttribute('placeholder', placeholder);

    const name = this.getAttribute('name');
    if (name) this._input.setAttribute('name', name);

    // A value set as a property before render() has waited for it.
    const value = this._pendingValue ?? this.getAttribute('value');
    this._pendingValue = undefined;
    if (value) this._input.value = value;

    if (this.getBoolAttr('readonly')) this._input.readOnly = true;
    if (this.getBoolAttr('required')) this._input.required = true;
    for (const attr of FORWARDED) this._forward(attr);

    // The field's box: the input, a prefix and a suffix slot on top of it
    this._box = this.createElement('div', ['glass-input-wrap'], { part: 'box' });
    this._prefix = this._createAffix('prefix');
    this._suffix = this._createAffix('suffix');
    this._box.append(this._prefix, this._input, this._suffix);

    // Hint — read out with the field as its description
    this._hintEl = this.createElement('span', this._computeHintClasses(), { id: 'hint' });
    this._hintEl.textContent = this.getAttribute('hint') || '';

    group.appendChild(this._labelEl);
    group.appendChild(this._box);
    if (this.getAttribute('hint')) group.appendChild(this._hintEl);

    this._group = group;
    this._wrapper.appendChild(group);

    this._applyDescription();
    this._syncFormValue();
  }

  _createAffix(name) {
    const affix = this.createElement('span', [`glass-input-wrap__${name}`], { id: name, part: name, hidden: '' });
    affix.appendChild(this.createElement('slot', [], { name }));
    return affix;
  }

  setupEvents() {
    this._onInput = () => {
      this._syncFormValue();
      this.emit('glk-input', { value: this._input.value });
      this.dispatchEvent(new Event('input', { bubbles: true }));
    };
    this._onChangeNative = () => {
      this.emit('glk-change', { value: this._input.value });
      this.dispatchEvent(new Event('change', { bubbles: true }));
    };
    this._input.addEventListener('input', this._onInput);
    this._input.addEventListener('change', this._onChangeNative);

    // Affixes: shown while something is slotted, measured while shown.
    this._onSlotChange = () => this._applyAffixes();
    this._box.addEventListener('slotchange', this._onSlotChange);
    this._affixObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const size = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        this._box.style.setProperty(`--gl-input-${entry.target.id}-size`, `${size}px`);
      }
    });
    this._affixObserver.observe(this._prefix);
    this._affixObserver.observe(this._suffix);
    this._applyAffixes();
  }

  teardownEvents() {
    this._input?.removeEventListener('input', this._onInput);
    this._input?.removeEventListener('change', this._onChangeNative);
    this._box?.removeEventListener('slotchange', this._onSlotChange);
    this._affixObserver?.disconnect();
  }

  onAttributeChanged(name) {
    if (!this._input) return;
    switch (name) {
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        break;
      case 'type':
        this._input.setAttribute('type', this.getAttribute('type') || 'text');
        break;
      case 'placeholder':
        this._input.setAttribute('placeholder', this.getAttribute('placeholder') || '');
        break;
      case 'error':
        this._input.className = this._computeInputClasses().join(' ');
        this._hintEl.className = this._computeHintClasses().join(' ');
        this._applyDescription();
        break;
      case 'hint':
        this._hintEl.textContent = this.getAttribute('hint') || '';
        if (this.getAttribute('hint') && !this._hintEl.parentNode) {
          this._group.appendChild(this._hintEl);
        }
        this._applyDescription();
        break;
      case 'readonly':
        this._input.readOnly = this.getBoolAttr('readonly');
        break;
      case 'name':
        this._input.setAttribute('name', this.getAttribute('name') || '');
        break;
      case 'value':
        this._input.value = this.getAttribute('value') || '';
        this._syncFormValue();
        break;
      case 'required':
        this._input.required = this.getBoolAttr('required');
        break;
      default:
        if (FORWARDED.includes(name)) this._forward(name);
    }
  }

  applyDisabled(disabled) { this._input.disabled = disabled; }

  /** An affix shows, and makes room in the field, only while something is slotted. */
  _applyAffixes() {
    for (const affix of [this._prefix, this._suffix]) {
      const filled = affix.firstElementChild.assignedNodes().length > 0;
      affix.hidden = !filled;
      this._box.classList.toggle(`glass-input-wrap--${affix.id}`, filled);
    }
    this._applyDescription();
  }

  /**
   * Prefix, suffix and hint describe the field — a unit belongs to the value
   * it stands next to. With `error` set the hint is the error message and the
   * field is marked invalid. Server-side errors arrive this way, so `error`
   * stays a marker for assistive technology and does not block the form —
   * only the field's own constraints (required, pattern …) do.
   */
  _applyDescription() {
    const ids = [this._prefix, this._suffix].filter(affix => affix && !affix.hidden).map(affix => affix.id);
    if (this.getAttribute('hint')) ids.push('hint');
    if (ids.length) this._input.setAttribute('aria-describedby', ids.join(' '));
    else this._input.removeAttribute('aria-describedby');
    if (this.getBoolAttr('error')) this._input.setAttribute('aria-invalid', 'true');
    else this._input.removeAttribute('aria-invalid');
  }

  _forward(attr) {
    const value = this.getAttribute(attr);
    if (value === null) this._input.removeAttribute(attr);
    else this._input.setAttribute(attr, value);
  }

  _computeInputClasses() {
    const classes = ['glass-input'];
    if (this.getBoolAttr('error')) classes.push('glass-input--error');
    return classes;
  }

  _computeHintClasses() {
    const classes = ['glass-hint'];
    if (this.getBoolAttr('error')) classes.push('glass-hint--error');
    return classes;
  }

  get _validityField() { return this._input; }

  _syncFormValue() {
    this.setFormValue(this._input.value);
  }

  resetValue() {
    this._input.value = this.getAttribute('value') || '';
    this._syncFormValue();
  }

  get value() { return this._input ? this._input.value : (this._pendingValue ?? this.getAttribute('value') ?? ''); }
  set value(v) {
    const value = v == null ? '' : String(v);
    // Frameworks set properties right after creating the element. Before
    // render() the value waits for it — it used to throw.
    if (!this._input) { this._pendingValue = value; return; }
    this._input.value = value;
    this._syncFormValue();
  }

  get readOnly() { return this.getBoolAttr('readonly'); }
  set readOnly(v) { this.setBoolAttr('readonly', v); }

  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
}

customElements.define('glk-input', GlkInput);
export { GlkInput };
