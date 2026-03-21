import { GlkFormElement } from '../../base.js';

class GlkToggle extends GlkFormElement {
  static get observedAttributes() {
    return ['checked', 'disabled', 'label', 'name', 'value'];
  }

  render() {
    const label = this.createElement('label', ['glass-toggle']);

    this._input = this.createElement('input', ['glass-toggle__input'], {
      type: 'checkbox'
    });

    const name = this.getAttribute('name');
    if (name) this._input.setAttribute('name', name);

    const track = this.createElement('span', ['glass-toggle__track']);
    const thumb = this.createElement('span', ['glass-toggle__thumb']);
    track.appendChild(thumb);

    this._labelEl = this.createElement('span', ['glass-toggle__label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    label.appendChild(this._input);
    label.appendChild(track);
    label.appendChild(this._labelEl);

    if (this.getBoolAttr('checked')) this._input.checked = true;
    if (this.getBoolAttr('disabled')) this._input.disabled = true;

    this._defaultChecked = this.getBoolAttr('checked');
    this._wrapper.appendChild(label);

    this._syncFormValue();
    this.setAttribute('role', 'switch');
    this.setAttribute('aria-checked', String(this._input.checked));
    if (this.getBoolAttr('disabled')) this.setAttribute('aria-disabled', 'true');
  }

  setupEvents() {
    this._onChange = () => {
      this._syncing = true;
      this.setBoolAttr('checked', this._input.checked);
      this._syncing = false;
      this.setAttribute('aria-checked', String(this._input.checked));
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
        this.setAttribute('aria-checked', String(this._input.checked));
        this._syncFormValue();
        break;
      case 'disabled':
        this._input.disabled = this.getBoolAttr('disabled');
        this.setAttribute('aria-disabled', String(this.getBoolAttr('disabled')));
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
    this.setAttribute('aria-checked', String(this._defaultChecked));
    this._syncFormValue();
  }

  restoreValue(state) {
    if (state) {
      this._input.checked = true;
      this.setBoolAttr('checked', true);
    }
  }

  get checked() { return this._input?.checked ?? false; }
  set checked(v) {
    if (this._input) this._input.checked = v;
    this.setBoolAttr('checked', v);
    this.setAttribute('aria-checked', String(v));
    this._syncFormValue();
  }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }

  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }

  get value() { return this.getAttribute('value') || 'on'; }
  set value(v) { this.setAttribute('value', v); }

  get label() { return this.getAttribute('label'); }
  set label(v) { this.setAttribute('label', v); }
}

customElements.define('glk-toggle', GlkToggle);
export { GlkToggle };
