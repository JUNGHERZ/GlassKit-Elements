import { GlkFormElement } from '../../base.js';

// The wanted value. A select can show a value only once an option carries it,
// and the options arrive late: they are copied in a frame after connecting,
// and a framework may add them later still — while it sets `value` as a
// property right after creating the element. So the value the attribute or
// the property asks for is kept as wanted until an option carries it; a
// choice of the user replaces it. Before 1.22.0 only the attribute was kept:
// a property set before connecting threw, and one set before the options
// were copied was lost — the select showed its first option while the app
// held the other value.

class GlkSelect extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'disabled', 'name', 'value', 'required'];
  }

  static get observesLightDom() { return true; }

  render() {
    const group = this.createElement('div', ['glass-input-group']);

    // Tied to the field by an id that only has to be unique in this shadow root.
    this._labelEl = this.createElement('label', ['glass-label'], { for: 'field' });
    this._labelEl.textContent = this.getAttribute('label') || '';

    this._select = this.createElement('select', ['glass-select'], { id: 'field' });
    // A value set as a property before render() is wanted already.
    if (this._wanted === undefined) this._wanted = this.getAttribute('value');

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

    // The wanted value first, then the live selection if it survived the
    // rebuild — without that, the selection would jump back to the first entry
    // every time the list is updated.
    if (!this._applyValue(this._wanted)) this._applyValue(previous);
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
      this._wanted = null;            // the user's choice replaces it
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
        this._wanted = this.getAttribute('value');
        this._applyValue(this._wanted);
        this._syncFormValue();
        break;
      case 'required':
        this._select.required = this.getBoolAttr('required');
        break;
    }
  }

  get _validityField() { return this._select; }

  _syncFormValue() {
    this.setFormValue(this._select.value);
  }

  resetValue() {
    // Back to what the markup asked for, else the first option.
    this._wanted = this.getAttribute('value');
    if (!this._applyValue(this._wanted)) this._select.selectedIndex = 0;
    this._syncFormValue();
  }

  get value() {
    // Until options are there, the wanted value is the answer: a framework
    // reads back what it has just set.
    if (!this._select?.options.length) return this._wanted ?? this.getAttribute('value') ?? '';
    return this._select.value;
  }
  set value(v) {
    this._wanted = v == null ? '' : String(v);
    if (!this._select) return;        // render() takes it from here
    this._applyValue(this._wanted);
    this._syncFormValue();
  }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }
}

customElements.define('glk-select', GlkSelect);
export { GlkSelect };
