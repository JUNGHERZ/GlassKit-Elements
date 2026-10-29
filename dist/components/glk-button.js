import { GlkElement, CONTROL_NAME_ATTRS, applyControlName, applyControlDescription, forwardHostClicks } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

const VARIANTS = ['primary', 'secondary', 'tertiary'];
// size takes a height, auto, or since 1.31.0 both: "sm auto" for a small
// button as wide as its text. Until then it took one word, and "sm auto"
// gave no size at all. Of two heights the first counts.
const HEIGHTS = ['sm', 'md', 'lg'];

// States that whoever owns the element sets on it — <glk-popover> sets
// aria-expanded on its trigger. Assistive technology reads the native button
// inside, so they are handed down to it.
const FORWARDED_ARIA = ['aria-expanded', 'aria-haspopup', 'aria-pressed'];

// A name and a description from the host (since 1.36.0): aria-label and
// aria-labelledby name the native button instead of its content — an icon
// alone, or "Restore" that should say "Restore Info page 55" —, as on the
// check controls, and aria-describedby describes it. Before, they stayed on
// the host, which has no role, and named nothing.
const DESCRIBED = 'aria-describedby';

class GlkButton extends GlkElement {
  static get observedAttributes() {
    return ['variant', 'size', 'type', ...FORWARDED_ARIA, ...CONTROL_NAME_ATTRS, DESCRIBED];
  }

  // focus() and autofocus land on the native button (since 1.33.2; until
  // then the element could not take the focus from outside).
  static get delegatesFocus() { return true; }

  // The native button sits in the shadow root, outside every form. Form
  // association gives the element its form, so type="submit" and "reset"
  // can act on it (see _activateForm), and a disabled fieldset around it
  // disables it (since 1.22.3; before, it still sent the form).
  static formAssociated = true;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  render() {
    this._btn = this.createElement('button', this._computeClasses(), {
      type: this.getAttribute('type') || 'button',
      part: 'button'
    });

    for (const attr of FORWARDED_ARIA) this._forward(attr);
    applyControlName(this, this._btn);
    applyControlDescription(this, this._btn);

    this._btn.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._btn);
  }

  setupEvents() {
    // aria-labelledby and aria-describedby may name elements parsed after this one.
    requestAnimationFrame(() => {
      applyControlName(this, this._btn);
      applyControlDescription(this, this._btn);
    });
    this._onClick = (e) => {
      if (this._actuallyDisabled) {
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
      case 'type':
        this._btn.setAttribute('type', this.getAttribute('type') || 'button');
        break;
      case 'aria-label':
      case 'aria-labelledby':
        applyControlName(this, this._btn);
        break;
      case DESCRIBED:
        applyControlDescription(this, this._btn);
        break;
      default:
        if (FORWARDED_ARIA.includes(name)) this._forward(name);
    }
  }

  applyDisabled(disabled) { this._btn.disabled = disabled; }

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
    const words = (this.getAttribute('size') || '').split(/\s+/);
    const height = words.find(word => HEIGHTS.includes(word));
    if (height) classes.push(`glass-btn--${height}`);
    if (words.includes('auto')) classes.push('glass-btn--auto');
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
