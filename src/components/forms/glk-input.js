import { GlkFormElement } from '../../base.js';

// Attributes that belong to the inner <input> and are handed down unchanged:
// the picker's range and step, the typing limits, the pattern, autofill and
// the on-screen keyboard. Absent on the host means absent inside (since
// 1.17.0 — before, a date field with min still offered every past day).
const FORWARDED = ['min', 'max', 'step', 'minlength', 'maxlength', 'pattern', 'autocomplete', 'inputmode'];

class GlkInput extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'type', 'placeholder', 'error', 'hint', 'disabled', 'name', 'value', 'required', ...FORWARDED];
  }

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

    const value = this.getAttribute('value');
    if (value) this._input.value = value;

    if (this.getBoolAttr('disabled')) this._input.disabled = true;
    if (this.getBoolAttr('required')) this._input.required = true;
    for (const attr of FORWARDED) this._forward(attr);

    // Hint — read out with the field as its description
    this._hintEl = this.createElement('span', this._computeHintClasses(), { id: 'hint' });
    this._hintEl.textContent = this.getAttribute('hint') || '';

    group.appendChild(this._labelEl);
    group.appendChild(this._input);
    if (this.getAttribute('hint')) group.appendChild(this._hintEl);

    this._group = group;
    this._wrapper.appendChild(group);

    this._applyDescription();
    this._syncFormValue();
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
  }

  teardownEvents() {
    this._input?.removeEventListener('input', this._onInput);
    this._input?.removeEventListener('change', this._onChangeNative);
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
      case 'disabled':
        this._input.disabled = this.getBoolAttr('disabled');
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

  /**
   * The hint describes the field; with `error` set it is the error message
   * and the field is marked invalid. Server-side errors arrive this way, so
   * `error` stays a marker for assistive technology and does not block the
   * form — only the field's own constraints (required, pattern …) do.
   */
  _applyDescription() {
    if (this.getAttribute('hint')) this._input.setAttribute('aria-describedby', 'hint');
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

  get value() { return this._input?.value ?? ''; }
  set value(v) {
    if (this._input) this._input.value = v;
    this._syncFormValue();
  }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }

  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }
}

customElements.define('glk-input', GlkInput);
export { GlkInput };
