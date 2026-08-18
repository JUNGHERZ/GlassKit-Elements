import { GlkFormElement } from '../../base.js';

class GlkSelect extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'disabled', 'name', 'value', 'required'];
  }

  static get observesLightDom() { return true; }

  render() {
    const group = this.createElement('div', ['glass-input-group']);

    this._labelEl = this.createElement('label', ['glass-label']);
    this._labelEl.textContent = this.getAttribute('label') || '';

    this._select = this.createElement('select', ['glass-select']);

    const name = this.getAttribute('name');
    if (name) this._select.setAttribute('name', name);

    if (this.getBoolAttr('disabled')) this._select.disabled = true;
    if (this.getBoolAttr('required')) this._select.required = true;

    group.appendChild(this._labelEl);
    group.appendChild(this._select);

    this._wrapper.appendChild(group);

    // Defer option copying — children may not be parsed yet in connectedCallback
    requestAnimationFrame(() => this.projectLightDom());
  }

  projectLightDom() {
    // The options are pure data — the clones carry no listeners — so skipping an
    // unchanged rebuild is safe, and it keeps an open dropdown from snapping shut
    // on light-DOM churn elsewhere.
    const signature = [...this.querySelectorAll('option')].map(o => o.outerHTML).join('');
    if (signature === this._optionSignature) return;
    this._optionSignature = signature;

    // innerHTML = '' below drops the selection, so remember it first. A
    // selectedIndex of -1 means "nothing is selected", which is not the same as
    // an option whose value happens to be the empty string.
    const previous = this._select.selectedIndex >= 0 ? this._select.value : null;

    this._moveOptions();

    // Keep the live selection when it survived the rebuild; otherwise fall back
    // to the value attribute. Without this the selection jumps back to the first
    // entry every time the list is updated.
    if (!this._applyValue(previous)) this._applyValue(this.getAttribute('value'));
    this._syncFormValue();
  }

  _moveOptions() {
    this._select.innerHTML = '';
    const options = this.querySelectorAll('option');
    options.forEach(opt => {
      this._select.appendChild(opt.cloneNode(true));
    });
  }

  /**
   * Selects `value` if an option carries it, and reports whether it did. The
   * empty string is a value like any other — "" is a real option in plenty of
   * forms ("detect automatically", "enter your own below").
   */
  _applyValue(value) {
    if (value === null) return false;
    if (![...this._select.options].some(o => o.value === value)) return false;
    this._select.value = value;
    return true;
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
        this._applyValue(this.getAttribute('value'));
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
