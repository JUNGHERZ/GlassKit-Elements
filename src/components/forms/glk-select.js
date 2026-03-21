import { GlkFormElement } from '../../base.js';

class GlkSelect extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'disabled', 'name', 'value', 'required'];
  }

  render() {
    const group = this.createElement('div', ['glass-input-group']);

    this._labelEl = this.createElement('label', ['glass-label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    this._select = this.createElement('select', ['glass-select']);

    const name = this.getAttribute('name');
    if (name) this._select.setAttribute('name', name);

    if (this.getBoolAttr('disabled')) this._select.disabled = true;
    if (this.getBoolAttr('required')) this._select.required = true;

    // Move slotted <option> elements into the shadow select
    this._moveOptions();

    group.appendChild(this._labelEl);
    group.appendChild(this._select);

    this._wrapper.appendChild(group);

    const value = this.getAttribute('value');
    if (value) this._select.value = value;

    this._syncFormValue();
  }

  _moveOptions() {
    // Copy <option> children from the light DOM into the shadow <select>
    const options = this.querySelectorAll('option');
    options.forEach(opt => {
      this._select.appendChild(opt.cloneNode(true));
    });
  }

  setupEvents() {
    this._onChange = () => {
      this._syncFormValue();
      this.emit('glk-change', { value: this._select.value });
      this.dispatchEvent(new Event('change', { bubbles: true }));
    };
    this._select.addEventListener('change', this._onChange);
  }

  teardownEvents() {
    this._select?.removeEventListener('change', this._onChange);
  }

  onAttributeChanged(name) {
    if (!this._select) return;
    switch (name) {
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        break;
      case 'disabled':
        this._select.disabled = this.getBoolAttr('disabled');
        break;
      case 'name':
        this._select.setAttribute('name', this.getAttribute('name') || '');
        break;
      case 'value':
        this._select.value = this.getAttribute('value') || '';
        this._syncFormValue();
        break;
    }
  }

  _syncFormValue() {
    this.setFormValue(this._select.value);
  }

  resetValue() {
    this._select.selectedIndex = 0;
    this._syncFormValue();
  }

  get value() { return this._select?.value ?? ''; }
  set value(v) {
    if (this._select) this._select.value = v;
    this._syncFormValue();
  }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
}

customElements.define('glk-select', GlkSelect);
export { GlkSelect };
