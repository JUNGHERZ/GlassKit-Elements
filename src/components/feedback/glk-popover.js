import { GlkElement } from '../../base.js';

const PLACEMENTS = ['top', 'bottom', 'start', 'end'];

class GlkPopover extends GlkElement {
  static get observedAttributes() {
    return ['open', 'placement'];
  }

  render() {
    this._anchor = this.createElement('div', ['glass-popover-anchor']);

    const triggerSlot = document.createElement('slot');
    triggerSlot.setAttribute('name', 'trigger');
    this._anchor.appendChild(triggerSlot);

    this._popover = this.createElement('div', ['glass-popover']);
    this._applyPlacement();
    if (this.getBoolAttr('open')) {
      this._popover.classList.add('is-open');
    }

    const contentSlot = document.createElement('slot');
    this._popover.appendChild(contentSlot);

    this._anchor.appendChild(this._popover);
    this._wrapper.appendChild(this._anchor);
  }

  _applyPlacement() {
    if (!this._popover) return;
    PLACEMENTS.forEach(p => this._popover.classList.remove(`glass-popover--${p}`));
    const placement = this.getAttribute('placement') || 'bottom';
    if (placement !== 'bottom' && PLACEMENTS.includes(placement)) {
      this._popover.classList.add(`glass-popover--${placement}`);
    }
  }

  setupEvents() {
    // Toggle when the slotted trigger is clicked.
    this._onTriggerClick = (e) => {
      const path = e.composedPath();
      const hitTrigger = path.some(node => {
        return node instanceof Element && node.getAttribute && node.getAttribute('slot') === 'trigger';
      });
      if (!hitTrigger) return;
      e.stopPropagation();
      this.toggle();
    };
    this.addEventListener('click', this._onTriggerClick);

    // Close on outside click.
    this._onDocClick = (e) => {
      if (!this.getBoolAttr('open')) return;
      const path = e.composedPath();
      if (path.includes(this)) return;
      this.close();
    };
    document.addEventListener('click', this._onDocClick);

    // Close on Escape.
    this._onKeydown = (e) => {
      if (e.key === 'Escape' && this.getBoolAttr('open')) {
        this.close();
      }
    };
    document.addEventListener('keydown', this._onKeydown);
  }

  teardownEvents() {
    this.removeEventListener('click', this._onTriggerClick);
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('keydown', this._onKeydown);
  }

  onAttributeChanged(name) {
    if (!this._popover) return;
    switch (name) {
      case 'open': {
        const isOpen = this.getBoolAttr('open');
        this._popover.classList.toggle('is-open', isOpen);
        this.emit(isOpen ? 'glk-open' : 'glk-close');
        break;
      }
      case 'placement':
        this._applyPlacement();
        break;
    }
  }

  show() { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }
  toggle() {
    if (this.getBoolAttr('open')) this.close();
    else this.show();
  }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }

  get placement() { return this.getAttribute('placement') || 'bottom'; }
  set placement(v) {
    if (PLACEMENTS.includes(v)) this.setAttribute('placement', v);
  }
}

customElements.define('glk-popover', GlkPopover);
export { GlkPopover };
