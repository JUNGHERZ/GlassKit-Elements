import { GlkFormElement } from '../../base.js';

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
  }

  setupEvents() {
    this._onChange = () => {
      this._syncing = true;
      this.setBoolAttr('checked', this._input.checked);
      this._syncing = false;
      this._syncFormValue();
      this.emit('glk-change', { checked: this._input.checked, value: this._input.value });
      this.dispatchEvent(new Event('change', { bubbles: true }));
    };
    this._input.addEventListener('change', this._onChange);
  }

  teardownEvents() {
    this._input?.removeEventListener('change', this._onChange);
  }

  onAttributeChanged(name) {
    if (this._syncing) return;
    if (!this._input) return;
    switch (name) {
      case 'checked':
        this._input.checked = this.getBoolAttr('checked');
        this._syncFormValue();
        break;
      case 'disabled':
        this._input.disabled = this.getBoolAttr('disabled');
        break;
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        break;
      case 'name':
        this._input.setAttribute('name', this.getAttribute('name') || '');
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
  }

  get checked() { return this._input?.checked ?? false; }
  set checked(v) {
    if (this._input) this._input.checked = v;
    this.setBoolAttr('checked', v);
    this._syncFormValue();
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
