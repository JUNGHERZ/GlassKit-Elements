import { GlkFormElement, checkControlSheet, forwardHostClicks, applyControlName, CONTROL_NAME_ATTRS } from '../../base.js';

// A name without a visible label (since 1.33.1), for a control at the end of
// a row whose title stands on the left: aria-label or aria-labelledby on the
// host name the native control inside, or label-hidden keeps the label's
// text as the name, out of sight. label-position="start" puts the text
// before the control. Parts: label, and the control's track.

class GlkToggle extends GlkFormElement {
  static get observedAttributes() {
    return ['checked', 'label', 'name', 'value', 'required', ...CONTROL_NAME_ATTRS];
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

    const track = this.createElement('span', ['glass-toggle__track'], { part: 'track' });
    const thumb = this.createElement('span', ['glass-toggle__thumb']);
    track.appendChild(thumb);

    this._labelEl = this.createElement('span', ['glass-toggle__label'], { part: 'label' });
    this._labelEl.textContent = this.getAttribute('label') || '';

    label.appendChild(this._input);
    label.appendChild(track);
    label.appendChild(this._labelEl);

    if (this.getBoolAttr('checked')) this._input.checked = true;
    if (this.getBoolAttr('required')) this._input.required = true;

    this._defaultChecked = this.getBoolAttr('checked');
    this._wrapper.appendChild(label);
    applyControlName(this, this._input);

    this._syncFormValue();
  }

  setupEvents() {
    // aria-labelledby may name an element parsed after this one.
    requestAnimationFrame(() => applyControlName(this, this._input));
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
      case 'aria-label':
      case 'aria-labelledby':
        applyControlName(this, this._input);
        break;
      case 'checked':
        this._input.checked = this.getBoolAttr('checked');
        this._syncFormValue();
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

  applyDisabled(disabled) { this._input.disabled = disabled; }

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

  // Before render() the attribute carries the state: render() reads it.
  get checked() { return this._input ? this._input.checked : this.getBoolAttr('checked'); }
  set checked(v) {
    if (this._input) this._input.checked = v;
    this.setBoolAttr('checked', v);
    if (this._input) this._syncFormValue();
  }

  get name() { return this.getAttribute('name'); }
  set name(v) { this.setAttribute('name', v); }

  get value() { return this.getAttribute('value') || 'on'; }
  set value(v) { this.setAttribute('value', v); }

  get label() { return this.getAttribute('label'); }
  set label(v) { this.setAttribute('label', v); }

  get labelHidden() { return this.getBoolAttr('label-hidden'); }
  set labelHidden(v) { this.setBoolAttr('label-hidden', v); }

  /** "end" (the default) or "start". */
  get labelPosition() { return this.getAttribute('label-position') === 'start' ? 'start' : 'end'; }
  set labelPosition(v) {
    if (v === 'start') this.setAttribute('label-position', 'start');
    else this.removeAttribute('label-position');
  }
}

customElements.define('glk-toggle', GlkToggle);
export { GlkToggle };
