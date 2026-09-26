import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// A short message at the top of the screen that hides itself — and, since
// 1.19.0, one that offers something: "A new version · Reload".
//
// Attributes: message, variant (success | error | warning), duration (ms;
//             0 keeps it up), visible, action-label, action-value (reported
//             in glk-action; the label when missing), dismissible (an ×
//             without an action), close-label (name of the ×, "Close" by
//             default)
// Slot:       icon — replaces the built-in icon; leave its stroke unset and
//             it takes the variant colour
// Methods:    show(message, variant, duration)
//             show(message, { variant, duration, action: { label, value }, dismissible })
//             dismiss()
// Events:     glk-dismiss — hidden after its duration
//             glk-action { action, label } — the action was used; the toast
//             closes unless a listener calls preventDefault() or shows the
//             next message from the handler
//             glk-close — closed with the × or Escape
//
// A toast with an action brings an × and stays until one of them is used,
// unless a duration is set; while the pointer or the focus is on a toast
// with buttons, it does not time out. It is a polite live region, so the
// message is announced; hidden, its buttons are inert. Closing it from the
// keyboard hands the focus back to where it came from.

const VARIANTS = ['success', 'error', 'warning'];
const DEFAULT_DURATION = 3000;

// Stroke, fill and caps come from .glass-toast__icon, so the variant colours
// the icon — an own stroke attribute here would win over the inherited one.
const ICONS = {
  success: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  error: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
};
const CLOSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

class GlkToast extends GlkElement {
  static get observedAttributes() {
    return ['message', 'variant', 'duration', 'visible', 'action-label', 'action-value', 'dismissible', 'close-label'];
  }

  render() {
    this._toast = this.createElement('div', this._computeClasses(), { role: 'status', 'aria-live': 'polite' });

    this._iconEl = this.createElement('span', ['glass-toast__icon']);
    this._iconSlot = this.createElement('slot', [], { name: 'icon' });
    this._iconEl.appendChild(this._iconSlot);
    this._textEl = this.createElement('span', ['glass-toast__text']);
    this._textEl.textContent = this.getAttribute('message') || '';
    this._actionBtn = this.createElement('button', ['glass-toast__action'], { type: 'button' });
    this._closeBtn = this.createElement('button', ['glass-toast__close'], { type: 'button' });
    this._closeBtn.innerHTML = CLOSE_ICON;

    this._updateIcon();
    this._toast.append(this._iconEl, this._textEl);
    this._wrapper.appendChild(this._toast);
    this._syncControls();

    if (this.getBoolAttr('visible')) this._show();
  }

  setupEvents() {
    this._onClick = (event) => {
      const path = event.composedPath();
      if (path.includes(this._closeBtn)) this._close();
      else if (path.includes(this._actionBtn)) this._takeAction();
    };
    this._onKeydown = (event) => {
      if (event.key === 'Escape' && this._hasButtons()) { event.stopPropagation(); this._close(); }
    };
    // While the pointer or the focus is on a toast with buttons, it waits.
    this._onHold = (event) => {
      if (event.type === 'focusin' && !this._toast.contains(event.relatedTarget)) this._returnFocus = event.relatedTarget;
      if (!this._hasButtons()) return;
      this._held = true;
      clearTimeout(this._timer);
    };
    this._onRelease = (event) => {
      if (event.type === 'focusout' && this._toast.contains(event.relatedTarget)) return;
      this._held = this._toast.matches(':hover') || this._toast.contains(this._shadow.activeElement);
      if (!this._held) this._arm();
    };
    this._toast.addEventListener('click', this._onClick);
    this._toast.addEventListener('keydown', this._onKeydown);
    this._toast.addEventListener('pointerenter', this._onHold);
    this._toast.addEventListener('focusin', this._onHold);
    this._toast.addEventListener('pointerleave', this._onRelease);
    this._toast.addEventListener('focusout', this._onRelease);
  }

  teardownEvents() {
    clearTimeout(this._timer);
    if (!this._toast) return;
    this._toast.removeEventListener('click', this._onClick);
    this._toast.removeEventListener('keydown', this._onKeydown);
    this._toast.removeEventListener('pointerenter', this._onHold);
    this._toast.removeEventListener('focusin', this._onHold);
    this._toast.removeEventListener('pointerleave', this._onRelease);
    this._toast.removeEventListener('focusout', this._onRelease);
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
        if (this.getBoolAttr('visible')) this._show();
        else this._hide();
        break;
      case 'action-label':
      case 'action-value':
      case 'dismissible':
      case 'close-label':
        this._syncControls();
        break;
    }
  }

  _computeClasses() {
    const classes = ['glass-toast'];
    const variant = this.getAttribute('variant');
    if (variant && VARIANTS.includes(variant)) classes.push(`glass-toast--${variant}`);
    if (this.getBoolAttr('visible')) classes.push('is-visible');
    return classes;
  }

  _updateIcon() {
    // Fallback content of the icon slot: shown while nothing is slotted.
    this._iconSlot.innerHTML = ICONS[this.getAttribute('variant')] || ICONS.success;
  }

  _hasButtons() { return this._actionBtn.isConnected || this._closeBtn.isConnected; }

  // The action and the × sit in the tree only when they are wanted: an
  // action brings its ×, `dismissible` brings the × alone.
  _syncControls() {
    const label = this.getAttribute('action-label');
    if (label) {
      this._actionBtn.textContent = label;
      if (!this._actionBtn.isConnected) this._textEl.after(this._actionBtn);
    } else {
      this._actionBtn.remove();
    }
    if (label || this.getBoolAttr('dismissible')) {
      if (!this._closeBtn.isConnected) this._toast.appendChild(this._closeBtn);
    } else {
      this._closeBtn.remove();
    }
    this._closeBtn.setAttribute('aria-label', this.getAttribute('close-label') || 'Close');
    this._syncInert();
  }

  _syncInert() {
    const hidden = !this.getBoolAttr('visible');
    this._actionBtn.inert = hidden;
    this._closeBtn.inert = hidden;
  }

  // Effective duration: the attribute when set; otherwise none for a toast
  // with an action, the default for a plain one.
  _duration() {
    const attr = this.getAttribute('duration');
    if (attr !== null && attr.trim() !== '' && Number.isFinite(Number(attr))) return Number(attr);
    return this.getAttribute('action-label') ? 0 : DEFAULT_DURATION;
  }

  _arm() {
    clearTimeout(this._timer);
    const duration = this._duration();
    if (duration > 0 && !this._held && this.getBoolAttr('visible')) {
      this._timer = setTimeout(() => {
        this.removeAttribute('visible');
        this.emit('glk-dismiss');
      }, duration);
    }
  }

  _show() {
    this._toast.classList.add('is-visible');
    this._syncInert();
    this._arm();
  }

  _hide() {
    this._toast.classList.remove('is-visible');
    clearTimeout(this._timer);
    this._held = false;
    // A hidden toast must not keep the focus: hand it back, else let it go.
    if (this._toast.contains(this._shadow.activeElement)) {
      const back = this._returnFocus;
      if (back?.isConnected) back.focus({ preventScroll: true });
      if (this._toast.contains(this._shadow.activeElement)) this._shadow.activeElement.blur();
    }
    this._returnFocus = null;
    this._syncInert();
  }

  _close() {
    this.removeAttribute('visible');
    this.emit('glk-close');
  }

  _takeAction() {
    const label = this.getAttribute('action-label') || '';
    const action = this.getAttribute('action-value') ?? label;
    const shown = this._shown;
    // A listener that shows the next message ("Restored") keeps the toast up,
    // and so does one that calls preventDefault().
    if (this.emit('glk-action', { action, label }, { cancelable: true }) && this._shown === shown) {
      this.removeAttribute('visible');
    }
  }

  /**
   * show(message, variant, duration) — as before.
   * show(message, { variant, duration, action: { label, value }, dismissible })
   * — keys that are left out keep their attribute, except action: a message
   * without one shows no button, and one with an action but no duration stays.
   */
  show(message, variantOrOptions, duration) {
    this._shown = (this._shown ?? 0) + 1;
    if (message) this.setAttribute('message', message);
    if (variantOrOptions && typeof variantOrOptions === 'object') {
      const o = variantOrOptions;
      if ('variant' in o) this._setOrRemove('variant', o.variant);
      if (o.action) {
        this.setAttribute('action-label', String(o.action.label ?? o.action.value ?? ''));
        this._setOrRemove('action-value', o.action.value);
      } else {
        this.removeAttribute('action-label');
        this.removeAttribute('action-value');
      }
      if ('duration' in o) this._setOrRemove('duration', o.duration);
      else if (o.action) this.removeAttribute('duration');
      if ('dismissible' in o) this.setBoolAttr('dismissible', o.dismissible);
    } else {
      if (variantOrOptions) this.setAttribute('variant', variantOrOptions);
      if (duration) this.setAttribute('duration', String(duration));
    }
    // Already visible: the attribute does not change, so restart by hand.
    if (this.getBoolAttr('visible')) this._show();
    else this.setAttribute('visible', '');
  }

  _setOrRemove(name, value) {
    if (value == null || value === '') this.removeAttribute(name);
    else this.setAttribute(name, String(value));
  }

  dismiss() {
    this.removeAttribute('visible');
  }

  get dismissible() { return this.getBoolAttr('dismissible'); }
  set dismissible(v) { this.setBoolAttr('dismissible', v); }
}

customElements.define('glk-toast', GlkToast);

export { GlkToast };
