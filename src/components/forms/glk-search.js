import { GlkFormElement } from '../../base.js';

const SEARCH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;

class GlkSearch extends GlkFormElement {
  static get observedAttributes() {
    return ['placeholder', 'name', 'value', 'disabled'];
  }

  render() {
    const container = this.createElement('div', ['glass-search']);

    const icon = this.createElement('span', ['glass-search__icon']);
    icon.innerHTML = SEARCH_SVG;

    this._input = this.createElement('input', ['glass-input'], {
      type: 'search'
    });

    const placeholder = this.getAttribute('placeholder');
    if (placeholder) this._input.setAttribute('placeholder', placeholder);

    const name = this.getAttribute('name');
    if (name) this._input.setAttribute('name', name);

    const value = this.getAttribute('value');
    if (value) this._input.value = value;

    if (this.getBoolAttr('disabled')) this._input.disabled = true;

    container.appendChild(icon);
    container.appendChild(this._input);

    this._wrapper.appendChild(container);
    this._syncFormValue();
  }

  setupEvents() {
    this._onInput = () => {
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
      case 'placeholder':
        this._input.setAttribute('placeholder', this.getAttribute('placeholder') || '');
        break;
      case 'name':
        this._input.setAttribute('name', this.getAttribute('name') || '');
        break;
      case 'value':
        this._input.value = this.getAttribute('value') || '';
        this._syncFormValue();
        break;
      case 'disabled':
        this._input.disabled = this.getBoolAttr('disabled');
        break;
    }
  }

  _syncFormValue() {
    this.setFormValue(this._input.value);
  }

  resetValue() {
    this._input.value = this.getAttribute('value') || '';
    this._syncFormValue();
  }

  get value() { return this._input?.value ?? ''; }
  set value(v) {
    if (this._input) this._input.value = v;
    this._syncFormValue();
  }
}

customElements.define('glk-search', GlkSearch);
export { GlkSearch };
