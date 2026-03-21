import { GlkFormElement } from '../../base.js';

const CHECKMARK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

class GlkCheckbox extends GlkFormElement {
  static get observedAttributes() {
    return ['checked', 'disabled', 'label', 'name', 'value'];
  }

  render() {
    const label = this.createElement('label', ['glass-checkbox']);

    this._input = this.createElement('input', ['glass-checkbox__input'], {
      type: 'checkbox'
    });

    const name = this.getAttribute('name');
    if (name) this._input.setAttribute('name', name);

    const box = this.createElement('span', ['glass-checkbox__box']);
    box.innerHTML = CHECKMARK_SVG;

    this._labelEl = this.createElement('span', ['glass-checkbox__label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    label.appendChild(this._input);
    label.appendChild(box);
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
      this.emit('glk-change', { checked: this._input.checked });
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
    }
  }

  _syncFormValue() {
    const val = this.getAttribute('value') || 'on';
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

  get value() { return this.getAttribute('value') || 'on'; }
  set value(v) { this.setAttribute('value', v); }
}

customElements.define('glk-checkbox', GlkCheckbox);
export { GlkCheckbox };
