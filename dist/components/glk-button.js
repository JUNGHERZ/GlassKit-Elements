import { GlkElement, forwardHostClicks } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

const VARIANTS = ['primary', 'secondary', 'tertiary'];
const SIZES = ['sm', 'md', 'lg', 'auto'];

// States that whoever owns the element sets on it — <glk-popover> sets
// aria-expanded on its trigger. Assistive technology reads the native button
// inside, so they are handed down to it.
const FORWARDED_ARIA = ['aria-expanded', 'aria-haspopup', 'aria-pressed'];

class GlkButton extends GlkElement {
  static get observedAttributes() {
    return ['variant', 'size', 'disabled', 'type', ...FORWARDED_ARIA];
  }

  // The native button sits in the shadow root, outside every form. Form
  // association gives the element its form, so type="submit" and "reset"
  // can act on it (see _activateForm).
  static formAssociated = true;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  render() {
    this._btn = this.createElement('button', this._computeClasses(), {
      type: this.getAttribute('type') || 'button'
    });

    if (this.getBoolAttr('disabled')) {
      this._btn.disabled = true;
    }
    for (const attr of FORWARDED_ARIA) this._forward(attr);

    this._btn.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._btn);
  }

  setupEvents() {
    this._onClick = (e) => {
      if (this.getBoolAttr('disabled')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      this.emit('glk-click');
      this._activateForm(e);
    };
    this._btn.addEventListener('click', this._onClick);
    // host.click() and a <label> for the element reach the host only.
    this._unforwardClicks = forwardHostClicks(this, () => this._btn);
  }

  teardownEvents() {
    this._btn?.removeEventListener('click', this._onClick);
    this._unforwardClicks?.();
  }

  /**
   * type="submit" submits the element's form, type="reset" resets it. Both
   * wait until the click has finished bubbling, so a listener that calls
   * preventDefault() on the click stops them — as on a native button.
   */
  _activateForm(click) {
    const type = this.getAttribute('type');
    const form = this._internals.form;
    if (!form || (type !== 'submit' && type !== 'reset')) return;
    // Through the prototype: a control with id or name "reset" or
    // "requestSubmit" in the form shadows the methods on the form itself.
    const { reset, requestSubmit } = HTMLFormElement.prototype;
    setTimeout(() => {
      if (click.defaultPrevented || this._internals.form !== form) return;
      if (type === 'reset') {
        reset.call(form);
        return;
      }
      // requestSubmit() accepts native buttons only as the submitter, so the
      // submit event is told about this element instead. The listener goes
      // again right away: a form that fails validation fires no submit event,
      // and the next submit must not inherit this submitter.
      const nameSubmitter = (e) => {
        Object.defineProperty(e, 'submitter', { configurable: true, get: () => this });
      };
      form.addEventListener('submit', nameSubmitter, { capture: true });
      try {
        requestSubmit.call(form);
      } finally {
        form.removeEventListener('submit', nameSubmitter, { capture: true });
      }
    });
  }

  onAttributeChanged(name) {
    if (!this._btn) return;
    switch (name) {
      case 'variant':
      case 'size':
        this._btn.className = this._computeClasses().join(' ');
        break;
      case 'disabled':
        this._btn.disabled = this.getBoolAttr('disabled');
        break;
      case 'type':
        this._btn.setAttribute('type', this.getAttribute('type') || 'button');
        break;
      default:
        if (FORWARDED_ARIA.includes(name)) this._forward(name);
    }
  }

  _forward(attr) {
    const value = this.getAttribute(attr);
    if (value === null) this._btn.removeAttribute(attr);
    else this._btn.setAttribute(attr, value);
  }

  _computeClasses() {
    const classes = ['glass-btn'];
    const variant = this.getAttribute('variant');
    if (variant && VARIANTS.includes(variant)) {
      classes.push(`glass-btn--${variant}`);
    }
    const size = this.getAttribute('size');
    if (size && SIZES.includes(size)) {
      classes.push(`glass-btn--${size}`);
    }
    return classes;
  }

  get variant() { return this.getAttribute('variant'); }
  set variant(v) { this.setAttribute('variant', v); }

  get size() { return this.getAttribute('size'); }
  set size(v) { this.setAttribute('size', v); }

  get disabled() { return this.getBoolAttr('disabled'); }
  set disabled(v) { this.setBoolAttr('disabled', v); }

  get type() { return this.getAttribute('type') || 'button'; }
  set type(v) { this.setAttribute('type', v); }

  get form() { return this._internals.form; }
}

customElements.define('glk-button', GlkButton);

export { GlkButton };
