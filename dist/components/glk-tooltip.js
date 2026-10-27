import { GlkElement } from './base.js';
import { t as tooltipBehaviour, f as focusTarget } from './shared/overlay-COVSRs-B.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// A short name or hint for a control, on hover and focus (since 1.32.0) —
// GlassKit's .glass-tooltip. The control is the element in slot="trigger",
// or the one `for` names by its id in the same document or shadow root, so
// a tooltip can serve a control rendered elsewhere. The text is the
// tooltip's own content.
//
// It shows on hover after show-delay (400 ms), on keyboard focus at once,
// and on touch while a finger rests on the control (a long press of 500 ms;
// a tap never shows it). It hides when the pointer leaves the control and
// the tooltip — the pointer may move onto it — on blur, on a press, and on
// Escape, which leaves the focus where it is and a dialog around open. In
// the top layer (popover="hint"), placed by placement and flipped and
// shifted to stay in the viewport, --gl-tooltip-offset (8px) from the
// control.
//
// The text describes the control: it becomes the aria-description of the
// element that takes the focus — inside <glk-button>, <glk-pill> or
// <glk-tab-item> their native button. With as-label it is the control's
// name instead (aria-label), for an icon-only control.
//
// Attributes: for, placement (top | bottom | start | end), show-delay,
//             as-label
// Slots:      default (the text), trigger
// Part:       tooltip
// Methods:    show(), hide()

const PLACEMENTS = ['top', 'bottom', 'start', 'end'];

const sheet = new CSSStyleSheet();
sheet.replaceSync(`:host { display: contents; }`);

class GlkTooltip extends GlkElement {
  static get observedAttributes() { return ['for', 'placement', 'as-label']; }

  static get hostStyles() { return sheet; }

  render() {
    this._triggerSlot = this.createElement('slot', [], { name: 'trigger' });
    this._panel = this.createElement('div', ['glass-tooltip'], { part: 'tooltip', role: 'tooltip' });
    this._panel.appendChild(document.createElement('slot'));
    this._wrapper.append(this._triggerSlot, this._panel);
  }

  setupEvents() {
    this._onSlotChange = () => this._bind();
    this._triggerSlot.addEventListener('slotchange', this._onSlotChange);
    this._textObserver = new MutationObserver(() => this._applyText());
    this._textObserver.observe(this, { childList: true, subtree: true, characterData: true });
    this._bind();
  }

  teardownEvents() {
    this._triggerSlot?.removeEventListener('slotchange', this._onSlotChange);
    this._textObserver?.disconnect();
    this._unbind();
  }

  onAttributeChanged(name) {
    if (name === 'for') this._bind();
    else if (name === 'as-label') { this._clearText(); this._applyText(); }
  }

  /** The control: slotted, or named by `for`. */
  get _trigger() {
    const id = this.getAttribute('for');
    if (id) return this.getRootNode().getElementById?.(id) ?? null;
    return this._triggerSlot?.assignedElements()[0] ?? null;
  }

  _bind() {
    const trigger = this._trigger;
    if (trigger === this._bound) { this._applyText(); return; }
    this._unbind();
    if (!trigger) return;
    this._bound = trigger;
    this._behaviour = tooltipBehaviour(trigger, this._panel, {
      side: () => PLACEMENTS.includes(this.getAttribute('placement')) ? this.getAttribute('placement') : 'top',
      delay: () => {
        const ms = parseFloat(this.getAttribute('show-delay'));
        return Number.isFinite(ms) && ms >= 0 ? ms : 400;
      },
      offset: () => parseFloat(getComputedStyle(this._panel).getPropertyValue('--gl-tooltip-offset')) || 8,
    });
    this._applyText();
  }

  _unbind() {
    this._behaviour?.destroy();
    this._behaviour = null;
    this._clearText();
    this._bound = null;
  }

  /** The text, without a slotted control's own text. */
  get _text() {
    return [...this.childNodes]
      .filter(n => !(n.nodeType === Node.ELEMENT_NODE && n.getAttribute('slot') === 'trigger'))
      .map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
  }

  _applyText() {
    const bound = this._bound;
    if (!bound) return;
    // An element not defined yet has no inner button: once it is.
    if (bound.localName.includes('-') && !customElements.get(bound.localName)) {
      customElements.whenDefined(bound.localName).then(() => requestAnimationFrame(() => this._applyText()));
      return;
    }
    const target = focusTarget(bound);
    const attr = this.getBoolAttr('as-label') ? 'aria-label' : 'aria-description';
    if (target !== this._target || attr !== this._attr) {
      this._clearText();
      // What the control said before, given back when the tooltip goes.
      this._previous = target.getAttribute(attr);
      this._target = target;
      this._attr = attr;
    }
    target.setAttribute(attr, this._text);
  }

  _clearText() {
    if (!this._target) return;
    if (this._previous == null) this._target.removeAttribute(this._attr);
    else this._target.setAttribute(this._attr, this._previous);
    this._target = null;
    this._previous = null;
  }

  show() { this._behaviour?.show(); }
  hide() { this._behaviour?.hide(); }

  get placement() { return PLACEMENTS.includes(this.getAttribute('placement')) ? this.getAttribute('placement') : 'top'; }
  set placement(v) { if (PLACEMENTS.includes(v)) this.setAttribute('placement', v); }

  get htmlFor() { return this.getAttribute('for') || ''; }
  set htmlFor(v) {
    if (v) this.setAttribute('for', v);
    else this.removeAttribute('for');
  }
}

customElements.define('glk-tooltip', GlkTooltip);

export { GlkTooltip };
