import { GlkFormElement, fieldLabelSheet, applyControlName, CONTROL_NAME_ATTRS } from '../../base.js';

// The wanted value. A select can show a value only once an option carries it,
// and the options arrive late: they are copied in a frame after connecting,
// and a framework may add them later still — while it sets `value` as a
// property right after creating the element. So the value the attribute or
// the property asks for is kept as wanted until an option carries it; a
// choice of the user replaces it. Before 1.22.0 only the attribute was kept:
// a property set before connecting threw, and one set before the options
// were copied was lost — the select showed its first option while the app
// held the other value.
//
// label-hidden, aria-label and aria-labelledby as on <glk-input> (since
// 1.36.0): the label stays the name out of sight, or the host names the
// field instead.
//
// placeholder (since 1.37.0) is the native pattern: a first option with an
// empty value, disabled and hidden, chosen while no value matches an
// option, in GlassKit's placeholder colour. It cannot be picked, required
// keeps the form from submitting while it shows, and the form gets no
// value for it, as from a native select. Before, a value that matched no
// option showed the first real one as chosen, and picking it changed
// nothing. With a placeholder the empty value means "nothing chosen",
// unless an option of the page carries it.

class GlkSelect extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'name', 'value', 'required', 'placeholder', ...CONTROL_NAME_ATTRS];
  }

  static get hostStyles() { return fieldLabelSheet; }

  static get observesLightDom() { return true; }

  render() {
    const group = this.createElement('div', ['glass-input-group']);

    // Tied to the field by an id that only has to be unique in this shadow root.
    this._labelEl = this.createElement('label', ['glass-label'], { for: 'field', part: 'label' });
    this._labelEl.textContent = this.getAttribute('label') || '';

    this._select = this.createElement('select', ['glass-select'], { id: 'field' });
    // A value set as a property before render() is wanted already.
    if (this._wanted === undefined) this._wanted = this.getAttribute('value');

    const name = this.getAttribute('name');
    if (name) this._select.setAttribute('name', name);

    if (this.getBoolAttr('required')) this._select.required = true;

    group.appendChild(this._labelEl);
    group.appendChild(this._select);
    // A link at the end of the label row, slot="label-end" (since 1.33.0).
    group.appendChild(this._labelEndPlace(group));

    this._wrapper.appendChild(group);
    applyControlName(this, this._select);

    // Defer option copying — children may not be parsed yet in connectedCallback
    requestAnimationFrame(() => this.projectLightDom());
  }

  projectLightDom() {
    // The options are pure data — the clones carry no listeners — so skipping an
    // unchanged rebuild is safe, and it keeps an open dropdown from snapping shut
    // on light-DOM churn elsewhere.
    const signature = `${this.getAttribute('placeholder') ?? ''}\n${[...this.querySelectorAll('option')].map(o => o.outerHTML).join('')}`;
    if (signature === this._optionSignature) return;
    this._optionSignature = signature;

    // innerHTML = '' below drops the selection, so remember it first. A
    // selectedIndex of -1 means "nothing is selected", which is not the same as
    // an option whose value happens to be the empty string.
    const previous = this._select.selectedIndex >= 0 ? this._select.value : null;

    this._moveOptions();

    // The wanted value first, then the live selection if it survived the
    // rebuild — without that, the selection would jump back to the first entry
    // every time the list is updated. With neither, the placeholder shows.
    if (!this._applyValue(this._wanted) && !this._applyValue(previous) && this._placeholderOption) {
      this._placeholderOption.selected = true;
    }
    this._syncFormValue();
  }

  _moveOptions() {
    this._select.innerHTML = '';
    const placeholder = this.getAttribute('placeholder');
    this._placeholderOption = null;
    if (placeholder !== null) {
      this._placeholderOption = this.createElement('option', [], { value: '', disabled: '', hidden: '' });
      this._placeholderOption.textContent = placeholder;
      this._select.appendChild(this._placeholderOption);
    }
    const options = this.querySelectorAll('option');
    options.forEach(opt => {
      this._select.appendChild(opt.cloneNode(true));
    });
  }

  /** The options of the page, the placeholder left out. */
  get _realOptions() {
    return [...this._select.options].filter(o => o !== this._placeholderOption);
  }

  /**
   * Selects `value` if an option carries it, and reports whether it did. The
   * empty string is a value like any other — "" is a real option in plenty of
   * forms ("detect automatically", "enter your own below").
   */
  _applyValue(value) {
    if (value === null) return false;
    const option = this._realOptions.find(o => o.value === value);
    if (option) {
      option.selected = true;
      return true;
    }
    // With a placeholder the empty value is "nothing chosen" — after an
    // option of the page that carries it.
    if (value === '' && this._placeholderOption) {
      this._placeholderOption.selected = true;
      return true;
    }
    return false;
  }

  setupEvents() {
    // aria-labelledby may name an element parsed after this one.
    requestAnimationFrame(() => applyControlName(this, this._select));
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
      case 'name':
        this._select.setAttribute('name', this.getAttribute('name') || '');
        break;
      case 'value':
        this._wanted = this.getAttribute('value');
        this._showWanted();
        this._syncFormValue();
        break;
      case 'required':
        this._select.required = this.getBoolAttr('required');
        break;
      case 'placeholder':
        this.projectLightDom();
        break;
      case 'aria-label':
      case 'aria-labelledby':
        applyControlName(this, this._select);
        break;
    }
  }

  applyDisabled(disabled) { this._select.disabled = disabled; }

  get _validityField() { return this._select; }

  _syncFormValue() {
    // The placeholder is no value: a native select sends none for it.
    const placeholder = this._placeholderOption?.selected;
    this.setFormValue(placeholder ? null : this._select.value);
  }

  resetValue() {
    // Back to what the markup asked for, else the placeholder or the first option.
    this._wanted = this.getAttribute('value');
    if (!this._applyValue(this._wanted)) this._select.selectedIndex = 0;
    this._syncFormValue();
  }

  get value() {
    // Until options are there, the wanted value is the answer: a framework
    // reads back what it has just set.
    if (!this._select || !this._realOptions.length) return this._wanted ?? this.getAttribute('value') ?? '';
    return this._select.value;
  }
  set value(v) {
    this._wanted = v == null ? '' : String(v);
    if (!this._select) return;        // render() takes it from here
    this._showWanted();
    this._syncFormValue();
  }

  /**
   * The wanted value, or with a placeholder the placeholder while no option
   * carries it — without one the selection stays, as before.
   */
  _showWanted() {
    if (!this._applyValue(this._wanted) && this._placeholderOption && this._realOptions.length) {
      this._placeholderOption.selected = true;
    }
  }

  get labelHidden() { return this.getBoolAttr('label-hidden'); }
  set labelHidden(v) { this.setBoolAttr('label-hidden', v); }
}

customElements.define('glk-select', GlkSelect);
export { GlkSelect };
