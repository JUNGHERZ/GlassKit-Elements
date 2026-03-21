import { GlkFormElement } from '../../base.js';

class GlkInput extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'type', 'placeholder', 'error', 'hint', 'disabled', 'name', 'value', 'required'];
  }

  render() {
    const group = this.createElement('div', ['glass-input-group']);

    // Label
    this._labelEl = this.createElement('label', ['glass-label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    // Input
    this._input = this.createElement('input', this._computeInputClasses(), {
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

    // Hint
    this._hintEl = this.createElement('span', this._computeHintClasses());
    this._hintEl.textContent = this.getAttribute('hint') || '';

    group.appendChild(this._labelEl);
    group.appendChild(this._input);
    if (this.getAttribute('hint')) group.appendChild(this._hintEl);

    this._group = group;
    this._wrapper.appendChild(group);

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
        break;
      case 'hint':
        this._hintEl.textContent = this.getAttribute('hint') || '';
        if (this.getAttribute('hint') && !this._hintEl.parentNode) {
          this._group.appendChild(this._hintEl);
        }
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
    }
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
