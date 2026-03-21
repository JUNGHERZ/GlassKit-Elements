import { GlkElement } from '../../base.js';

const CHEVRON_SVG = `<span class="glass-accordion__trigger-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg></span>`;

class GlkAccordionItem extends GlkElement {
  static get observedAttributes() {
    return ['title', 'open'];
  }

  render() {
    this._item = this.createElement('div', ['glass-accordion__item']);
    if (this.getBoolAttr('open')) this._item.classList.add('is-open');

    // Trigger button
    this._trigger = this.createElement('button', ['glass-accordion__trigger']);
    this._triggerText = document.createTextNode(this.getAttribute('title') || '');
    this._trigger.appendChild(this._triggerText);
    this._trigger.insertAdjacentHTML('beforeend', CHEVRON_SVG);

    // Content
    this._content = this.createElement('div', ['glass-accordion__content']);
    const body = this.createElement('div', ['glass-accordion__body']);
    body.appendChild(document.createElement('slot'));
    this._content.appendChild(body);

    this._item.appendChild(this._trigger);
    this._item.appendChild(this._content);

    this._wrapper.appendChild(this._item);
  }

  setupEvents() {
    this._onClick = () => {
      this.setBoolAttr('open', !this.getBoolAttr('open'));
      this.emit('glk-toggle', { open: this.getBoolAttr('open') });
    };
    this._trigger.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    this._trigger?.removeEventListener('click', this._onClick);
  }

  onAttributeChanged(name) {
    if (!this._item) return;
    switch (name) {
      case 'open':
        this._item.classList.toggle('is-open', this.getBoolAttr('open'));
        break;
      case 'title':
        this._triggerText.textContent = this.getAttribute('title') || '';
        break;
    }
  }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
}

customElements.define('glk-accordion-item', GlkAccordionItem);
export { GlkAccordionItem };
