import { GlkFormElement } from '../../base.js';

// glk-input on every key; glk-change { value } once a value is done (since
// 1.35.0) — on leaving the field with a changed value, as <glk-input>, and
// on Ctrl+Enter or Cmd+Enter, where Enter alone breaks the line. Once per
// value: a change already reported by the keys is not reported again on
// leaving. A native change goes out with it.

class GlkTextarea extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'placeholder', 'rows', 'readonly', 'name', 'value', 'required'];
  }

  render() {
    const group = this.createElement('div', ['glass-input-group']);

    // Tied to the field by an id that only has to be unique in this shadow root.
    this._labelEl = this.createElement('label', ['glass-label'], { for: 'field', part: 'label' });
    this._labelEl.textContent = this.getAttribute('label') || '';

    this._textarea = this.createElement('textarea', ['glass-textarea'], { id: 'field' });
    const placeholder = this.getAttribute('placeholder');
    if (placeholder) this._textarea.setAttribute('placeholder', placeholder);

    const rows = this.getAttribute('rows');
    if (rows) this._textarea.setAttribute('rows', rows);

    const name = this.getAttribute('name');
    if (name) this._textarea.setAttribute('name', name);

    // A value set as a property before render() has waited for it.
    const value = this._pendingValue ?? this.getAttribute('value');
    this._pendingValue = undefined;
    if (value) this._textarea.value = value;

    if (this.getBoolAttr('readonly')) this._textarea.readOnly = true;
    if (this.getBoolAttr('required')) this._textarea.required = true;

    group.appendChild(this._labelEl);
    group.appendChild(this._textarea);
    // A link at the end of the label row, slot="label-end" (since 1.33.0).
    group.appendChild(this._labelEndPlace(group));

    this._wrapper.appendChild(group);
    this._syncFormValue();
  }

  setupEvents() {
    this._onInput = () => {
      this._syncFormValue();
      this.emit('glk-input', { value: this._textarea.value });
      this.dispatchEvent(new Event('input', { bubbles: true }));
    };
    this._onFocus = () => { this._committed = this._textarea.value; };
    this._onChangeNative = () => this._commit();
    this._onKeydown = (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !e.isComposing) this._commit();
    };
    this._textarea.addEventListener('input', this._onInput);
    this._textarea.addEventListener('focus', this._onFocus);
    this._textarea.addEventListener('change', this._onChangeNative);
    this._textarea.addEventListener('keydown', this._onKeydown);
  }

  teardownEvents() {
    this._textarea?.removeEventListener('input', this._onInput);
    this._textarea?.removeEventListener('focus', this._onFocus);
    this._textarea?.removeEventListener('change', this._onChangeNative);
    this._textarea?.removeEventListener('keydown', this._onKeydown);
  }

  /** glk-change and a native change, once for each value that is done. */
  _commit() {
    const value = this._textarea.value;
    if (value === this._committed) return;
    this._committed = value;
    this.emit('glk-change', { value });
    this.dispatchEvent(new Event('change', { bubbles: true }));
  }

  onAttributeChanged(name) {
    if (!this._textarea) return;
    switch (name) {
      case 'label':
        this._labelEl.textContent = this.getAttribute('label') || '';
        break;
      case 'placeholder':
        this._textarea.setAttribute('placeholder', this.getAttribute('placeholder') || '');
        break;
      case 'rows':
        this._textarea.setAttribute('rows', this.getAttribute('rows') || '');
        break;
      case 'readonly':
        this._textarea.readOnly = this.getBoolAttr('readonly');
        break;
      case 'name':
        this._textarea.setAttribute('name', this.getAttribute('name') || '');
        break;
      case 'value':
        this._textarea.value = this.getAttribute('value') || '';
        this._syncFormValue();
        break;
      case 'required':
        this._textarea.required = this.getBoolAttr('required');
        break;
    }
  }

  applyDisabled(disabled) { this._textarea.disabled = disabled; }

  get _validityField() { return this._textarea; }

  _syncFormValue() {
    this.setFormValue(this._textarea.value);
  }

  resetValue() {
    this._textarea.value = this.getAttribute('value') || '';
    this._syncFormValue();
  }

  get value() { return this._textarea ? this._textarea.value : (this._pendingValue ?? this.getAttribute('value') ?? ''); }
  set value(v) {
    const value = v == null ? '' : String(v);
    // Frameworks set properties right after creating the element. Before
    // render() the value waits for it — it used to throw.
    if (!this._textarea) { this._pendingValue = value; return; }
    this._textarea.value = value;
    this._syncFormValue();
  }

  get readOnly() { return this.getBoolAttr('readonly'); }
  set readOnly(v) { this.setBoolAttr('readonly', v); }
}

customElements.define('glk-textarea', GlkTextarea);
export { GlkTextarea };
