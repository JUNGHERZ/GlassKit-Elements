import { GlkFormElement } from '../../base.js';

class GlkRange extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'min', 'max', 'value', 'step', 'name'];
  }

  render() {
    const group = this.createElement('div', ['glass-range-group']);

    const header = this.createElement('div', ['glass-range-header']);

    // Tied to the slider by an id that only has to be unique in this shadow root.
    this._labelEl = this.createElement('label', [], { for: 'field' });
    this._labelEl.textContent = this.getAttribute('label') || '';

    this._valueEl = this.createElement('span', ['glass-range-value']);

    header.appendChild(this._labelEl);
    header.appendChild(this._valueEl);

    this._input = this.createElement('input', ['glass-range'], {
      id: 'field',
      type: 'range',
      min: this.getAttribute('min') || '0',
      max: this.getAttribute('max') || '100',
      value: this.getAttribute('value') || '50'
    });

    const step = this.getAttribute('step');
    if (step) this._input.setAttribute('step', step);

    const name = this.getAttribute('name');
    if (name) this._input.setAttribute('name', name);

    // The reset value is the attribute's; a value set as a property before
    // render() has waited for it and comes on top.
    this._defaultValue = this._input.value;
    if (this._pendingValue !== undefined) this._input.value = this._pendingValue;
    this._pendingValue = undefined;
    this._updateValueDisplay();

    group.appendChild(header);
    group.appendChild(this._input);

    this._wrapper.appendChild(group);
    this._syncFormValue();
  }

  setupEvents() {
    this._onInput = () => {
      this._updateValueDisplay();
      this._syncFormValue();
      this.emit('glk-input', { value: this._input.value });
      this.dispatchEvent(new Event('input', { bubbles: true }));
    };
    this._input.addEventListener('input', this._onInput);
  }

  teardownEvents() {
    this._input?.removeEventListener('input', this._onInput);
  }

  onAttributeChanged(name) {
    if (!this._input) return;
    switch (name) {
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        break;
      case 'min':
        this._input.min = this.getAttribute('min') || '0';
        break;
      case 'max':
        this._input.max = this.getAttribute('max') || '100';
        break;
      case 'value':
        this._input.value = this.getAttribute('value') || '50';
        this._updateValueDisplay();
        this._syncFormValue();
        break;
      case 'step':
        this._input.step = this.getAttribute('step') || '';
        break;
      case 'name':
        this._input.setAttribute('name', this.getAttribute('name') || '');
        break;
    }
  }

  applyDisabled(disabled) { this._input.disabled = disabled; }

  _updateValueDisplay() {
    this._valueEl.textContent = `${this._input.value}%`;
  }

  _syncFormValue() {
    this.setFormValue(this._input.value);
  }

  resetValue() {
    this._input.value = this._defaultValue;
    this._updateValueDisplay();
    this._syncFormValue();
  }

  get value() { return this._input ? this._input.value : (this._pendingValue ?? this.getAttribute('value') ?? '50'); }
  set value(v) {
    const value = v == null ? '' : String(v);
    // Frameworks set properties right after creating the element. Before
    // render() the value waits for it — it used to throw.
    if (!this._input) { this._pendingValue = value; return; }
    this._input.value = value;
    this._updateValueDisplay();
    this._syncFormValue();
  }
}

customElements.define('glk-range', GlkRange);
export { GlkRange };
