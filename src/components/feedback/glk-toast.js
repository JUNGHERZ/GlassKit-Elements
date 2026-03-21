import { GlkElement } from '../../base.js';

const VARIANTS = ['success', 'error', 'warning'];

const ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
};

class GlkToast extends GlkElement {
  static get observedAttributes() {
    return ['message', 'variant', 'duration', 'visible'];
  }

  render() {
    this._toast = this.createElement('div', this._computeClasses());

    this._iconEl = this.createElement('span', ['glass-toast__icon']);
    this._textEl = this.createElement('span', ['glass-toast__text']);
    this._textEl.textContent = this.getAttribute('message') || '';

    this._updateIcon();

    this._toast.appendChild(this._iconEl);
    this._toast.appendChild(this._textEl);
    this._wrapper.appendChild(this._toast);

    if (this.getBoolAttr('visible')) {
      this._show();
    }
  }

  onAttributeChanged(name) {
    if (!this._toast) return;
    switch (name) {
      case 'message':
        this._textEl.textContent = this.getAttribute('message') || '';
        break;
      case 'variant':
        this._toast.className = this._computeClasses().join(' ');
        this._updateIcon();
        break;
      case 'visible':
        if (this.getBoolAttr('visible')) {
          this._show();
        } else {
          this._hide();
        }
        break;
    }
  }

  _computeClasses() {
    const classes = ['glass-toast'];
    const variant = this.getAttribute('variant');
    if (variant && VARIANTS.includes(variant)) {
      classes.push(`glass-toast--${variant}`);
    }
    return classes;
  }

  _updateIcon() {
    const variant = this.getAttribute('variant');
    this._iconEl.innerHTML = ICONS[variant] || ICONS.success;
  }

  _show() {
    this._toast.classList.add('is-visible');
    const duration = parseInt(this.getAttribute('duration') || '3000', 10);
    if (duration > 0) {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.removeAttribute('visible');
        this.emit('glk-dismiss');
      }, duration);
    }
  }

  _hide() {
    this._toast.classList.remove('is-visible');
    clearTimeout(this._timer);
  }

  /** Programmatic show */
  show(message, variant, duration) {
    if (message) this.setAttribute('message', message);
    if (variant) this.setAttribute('variant', variant);
    if (duration) this.setAttribute('duration', String(duration));
    this.setAttribute('visible', '');
  }

  dismiss() {
    this.removeAttribute('visible');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }
}

customElements.define('glk-toast', GlkToast);
export { GlkToast };
