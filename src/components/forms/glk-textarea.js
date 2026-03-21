import { GlkFormElement } from '../../base.js';

class GlkTextarea extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'placeholder', 'rows', 'disabled', 'name', 'value', 'required'];
  }

  render() {
    const group = this.createElement('div', ['glass-input-group']);

    this._labelEl = this.createElement('label', ['glass-label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    this._textarea = this.createElement('textarea', ['glass-textarea']);
    const placeholder = this.getAttribute('placeholder');
    if (placeholder) this._textarea.setAttribute('placeholder', placeholder);

    const rows = this.getAttribute('rows');
    if (rows) this._textarea.setAttribute('rows', rows);

    const name = this.getAttribute('name');
    if (name) this._textarea.setAttribute('name', name);

    const value = this.getAttribute('value');
    if (value) this._textarea.value = value;

    if (this.getBoolAttr('disabled')) this._textarea.disabled = true;
    if (this.getBoolAttr('required')) this._textarea.required = true;

    group.appendChild(this._labelEl);
    group.appendChild(this._textarea);

    this._wrapper.appendChild(group);
    this._syncFormValue();
  }

  setupEvents() {
    this._onInput = () => {
      this._syncFormValue();
      this.emit('glk-input', { value: this._textarea.value });
      this.dispatchEvent(new Event('input', { bubbles: true }));
    };
    this._textarea.addEventListener('input', this._onInput);
  }

  teardownEvents() {
    this._textarea?.removeEventListener('input', this._onInput);
  }

  onAttributeChanged(name) {
    if (!this._textarea) return;
    switch (name) {
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        break;
      case 'placeholder':
        this._textarea.setAttribute('placeholder', this.getAttribute('placeholder') || '');
        break;
      case 'rows':
        this._textarea.setAttribute('rows', this.getAttribute('rows') || '');
        break;
      case 'disabled':
        this._textarea.disabled = this.getBoolAttr('disabled');
        break;
      case 'name':
        this._textarea.setAttribute('name', this.getAttribute('name') || '');
        break;
      case 'value':
        this._textarea.value = this.getAttribute('value') || '';
        this._syncFormValue();
        break;
    }
  }

  _syncFormValue() {
    this.setFormValue(this._textarea.value);
  }

  resetValue() {
    this._textarea.value = this.getAttribute('value') || '';
    this._syncFormValue();
  }

  get value() { return this._textarea?.value ?? ''; }
  set value(v) {
    if (this._textarea) this._textarea.value = v;
    this._syncFormValue();
  }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
}

customElements.define('glk-textarea', GlkTextarea);
export { GlkTextarea };
