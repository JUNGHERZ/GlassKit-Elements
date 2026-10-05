import { GlkFormElement, checkControlSheet, forwardHostClicks } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

class GlkToggle extends GlkFormElement {
  static get observedAttributes() {
    return ['checked', 'disabled', 'label', 'name', 'value', 'required'];
  }

  static get hostStyles() { return checkControlSheet; }

  render() {
    const label = this.createElement('label', ['glass-toggle']);

    // The native checkbox is the switch: role, checked state and name (from
    // the label around it) all sit on one control. The host has no role of
    // its own — it used to carry role="switch" as well, and screen readers met
    // a switch with a checkbox inside.
    this._input = this.createElement('input', ['glass-toggle__input'], {
      type: 'checkbox',
      role: 'switch'
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
    if (this.getBoolAttr('required')) this._input.required = true;

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
    this._unforwardClicks = forwardHostClicks(this, () => this._input);
  }

  teardownEvents() {
    this._input?.removeEventListener('change', this._onChange);
    this._unforwardClicks?.();
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
      case 'required':
        this._input.required = this.getBoolAttr('required');
        break;
    }
  }

  get _validityField() { return this._input; }

  _syncFormValue() {
    const val = this.getAttribute('value') || 'on';
    this.setFormValue(this._input.checked ? val : null);
  }

  resetValue() {
    this._input.checked = this._defaultChecked;
    this.setBoolAttr('checked', this._defaultChecked);
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
