import { GlkFormElement, CONTROL_NAME_ATTRS, fieldLabelSheet, applyControlName } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// glk-input on every key; glk-change { value } once a value is done (since
// 1.35.0) — on leaving the field with a changed value, as <glk-input>, and
// on Ctrl+Enter or Cmd+Enter, where Enter alone breaks the line. Once per
// value: a change already reported by the keys is not reported again on
// leaving. A native change goes out with it.
//
// label-hidden, aria-label and aria-labelledby as on <glk-input> (since
// 1.36.0): the label stays the name out of sight, or the host names the
// field instead.
//
// The browser's input event is composed: it reaches the host by itself,
// retargeted. Until 1.36.0 the element sent one of its own on top, and a
// listener on the host got every key twice. One that is not composed is
// still handed on.
//
// The field's limits and hints are handed down as on <glk-input> (since
// 1.37.0): minlength, maxlength, autocomplete and inputmode — before, a
// text area took any number of characters. counter shows the length at the
// end of the label row, "12/145" with maxlength.

const FORWARDED = ['minlength', 'maxlength', 'autocomplete', 'inputmode'];

class GlkTextarea extends GlkFormElement {
  static get observedAttributes() {
    return ['label', 'placeholder', 'rows', 'readonly', 'name', 'value', 'required', 'counter', ...FORWARDED, ...CONTROL_NAME_ATTRS];
  }

  static get hostStyles() { return fieldLabelSheet; }

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
    for (const attr of FORWARDED) this._forward(attr);

    group.appendChild(this._labelEl);
    group.appendChild(this._textarea);
    // A link at the end of the label row, slot="label-end" (since 1.33.0).
    group.appendChild(this._labelEndPlace(group));

    this._wrapper.appendChild(group);
    applyControlName(this, this._textarea);
    this._applyDescription();
    this._syncFormValue();
  }

  setupEvents() {
    // aria-labelledby may name an element parsed after this one.
    requestAnimationFrame(() => applyControlName(this, this._textarea));
    this._onInput = (e) => {
      this._syncFormValue();
      this.emit('glk-input', { value: this._textarea.value });
      if (!e.composed) this.dispatchEvent(new Event('input', { bubbles: true }));
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
      case 'aria-label':
      case 'aria-labelledby':
        applyControlName(this, this._textarea);
        break;
      case 'counter':
        this._applyDescription();
        this._applyCounter(this._textarea);
        break;
      default:
        if (FORWARDED.includes(name)) {
          this._forward(name);
          this._applyCounter(this._textarea);
        }
    }
  }

  applyDisabled(disabled) { this._textarea.disabled = disabled; }

  get _validityField() { return this._textarea; }

  _forward(attr) {
    const value = this.getAttribute(attr);
    if (value === null) this._textarea.removeAttribute(attr);
    else this._textarea.setAttribute(attr, value);
  }

  /** The counter describes the field while it shows. */
  _applyDescription() {
    if (this.getBoolAttr('counter')) this._textarea.setAttribute('aria-describedby', 'counter');
    else this._textarea.removeAttribute('aria-describedby');
  }

  _syncFormValue() {
    this.setFormValue(this._textarea.value);
    this._applyCounter(this._textarea);
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

  get labelHidden() { return this.getBoolAttr('label-hidden'); }
  set labelHidden(v) { this.setBoolAttr('label-hidden', v); }
}

customElements.define('glk-textarea', GlkTextarea);

export { GlkTextarea };
