import { GlkElement } from '../../base.js';

class GlkList extends GlkElement {
  static get observedAttributes() {
    return ['flush', 'bare'];
  }

  render() {
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
    }
  }

  get flush() { return this.getBoolAttr('flush'); }
  set flush(v) { this.setBoolAttr('flush', v); }

  get bare() { return this.getBoolAttr('bare'); }
  set bare(v) { this.setBoolAttr('bare', v); }
}

customElements.define('glk-list', GlkList);
export { GlkList };
