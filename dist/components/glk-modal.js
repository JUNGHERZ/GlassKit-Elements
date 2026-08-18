import { G as GlkElement } from './shared/base-BoN33KPe.js';

class GlkModal extends GlkElement {
  static get observedAttributes() {
    return ['open', 'title'];
  }

  static get observesLightDom() { return true; }

  render() {
    this._overlay = this.createElement('div', ['glass-modal-overlay'], { part: 'overlay' });

    const modal = this.createElement('div', ['glass-modal'], { part: 'modal' });

    // Header
    const header = this.createElement('div', ['glass-modal__header'], { part: 'header' });
    this._titleEl = this.createElement('h2', ['glass-modal__title']);
    this._titleEl.textContent = this.getAttribute('title') || '';
    header.appendChild(this._titleEl);

    // Body
    const body = this.createElement('div', ['glass-modal__body'], { part: 'body' });
    body.appendChild(document.createElement('slot'));

    // Footer — clone action buttons from light DOM into shadow DOM
    this._footer = this.createElement('div', ['glass-modal__footer'], { part: 'footer' });

    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(this._footer);

    // Defer footer population — children may not be parsed yet
    requestAnimationFrame(() => this.projectLightDom());

    this._overlay.appendChild(modal);
    this._wrapper.appendChild(this._overlay);

    if (this.getBoolAttr('open')) {
      this._overlay.classList.add('is-active');
    }
  }

  projectLightDom() {
    const buttons = [...this.querySelectorAll('[slot="actions"] button')];
    const signature = buttons.map(b => b.outerHTML).join('');
    if (signature === this._footerSignature) return;
    this._footerSignature = signature;

    this._footer.innerHTML = '';
    buttons.forEach((btn, i) => {
      const clone = btn.cloneNode(true);
      // Look the original up again at click time instead of closing over it: a
      // framework that re-renders replaces the node, and a captured reference
      // would then forward the click to a button no longer in the document.
      clone.addEventListener('click', () => {
        this.querySelectorAll('[slot="actions"] button')[i]?.click();
      });
      this._footer.appendChild(clone);
    });
  }

  setupEvents() {
    // Close on overlay click (outside modal)
    this._onOverlayClick = (e) => {
      if (e.target === this._overlay) {
        this.removeAttribute('open');
        this.emit('glk-close');
      }
    };
    this._overlay.addEventListener('click', this._onOverlayClick);

    // Close on Escape
    this._onKeydown = (e) => {
      if (e.key === 'Escape' && this.getBoolAttr('open')) {
        this.removeAttribute('open');
        this.emit('glk-close');
      }
    };
    document.addEventListener('keydown', this._onKeydown);
  }

  teardownEvents() {
    this._overlay?.removeEventListener('click', this._onOverlayClick);
    document.removeEventListener('keydown', this._onKeydown);
  }

  onAttributeChanged(name) {
    if (!this._overlay) return;
    switch (name) {
      case 'open':
        this._overlay.classList.toggle('is-active', this.getBoolAttr('open'));
        break;
      case 'title':
        this._titleEl.textContent = this.getAttribute('title') || '';
        break;
    }
  }

  show() { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
}

customElements.define('glk-modal', GlkModal);

export { GlkModal };
