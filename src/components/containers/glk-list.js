import { GlkElement } from '../../base.js';

class GlkList extends GlkElement {
  static get observedAttributes() {
    return ['flush', 'bare', 'header'];
  }

  render() {
    // Optional section header — sits before the <ul>.
    this._header = this.createElement('div', ['glass-list__section-header']);
    const initialHeader = this.getAttribute('header') || '';
    this._header.textContent = initialHeader;
    this._header.hidden = !initialHeader;
    this._wrapper.appendChild(this._header);

    this._ul = this.createElement('ul', ['glass-list']);
    if (this.getBoolAttr('flush')) this._ul.classList.add('glass-list--flush');
    if (this.getBoolAttr('bare')) this._ul.classList.add('glass-list--bare');
    this._ul.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._ul);
  }

  setupEvents() {
    this._syncLast();
    this._mutObserver = new MutationObserver(() => this._syncLast());
    this._mutObserver.observe(this, { childList: true });
  }

  teardownEvents() {
    this._mutObserver?.disconnect();
  }

  _syncLast() {
    const items = this.querySelectorAll(':scope > glk-list-item');
    const lastIndex = items.length - 1;
    items.forEach((item, i) => {
      if (i === lastIndex) item.setAttribute('data-last', '');
      else item.removeAttribute('data-last');
    });
  }

  onAttributeChanged(name) {
    if (!this._ul) return;
    switch (name) {
      case 'flush':
        this._ul.classList.toggle('glass-list--flush', this.getBoolAttr('flush'));
        break;
      case 'bare':
        this._ul.classList.toggle('glass-list--bare', this.getBoolAttr('bare'));
        break;
      case 'header': {
        const value = this.getAttribute('header') || '';
        this._header.textContent = value;
        this._header.hidden = !value;
        break;
      }
    }
  }

  get flush() { return this.getBoolAttr('flush'); }
  set flush(v) { this.setBoolAttr('flush', v); }

  get bare() { return this.getBoolAttr('bare'); }
  set bare(v) { this.setBoolAttr('bare', v); }

  get header() { return this.getAttribute('header') || ''; }
  set header(v) {
    if (v) this.setAttribute('header', v);
    else this.removeAttribute('header');
  }
}

customElements.define('glk-list', GlkList);
export { GlkList };
