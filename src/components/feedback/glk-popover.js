import { GlkElement } from '../../base.js';
import { openPanel, focusTarget } from '../../overlay.js';

// A panel that opens from the element in slot="trigger" (a click toggles
// it) and closes on a click outside or Escape.
//
// Since 1.32.0 it opens in the top layer (the popover API) and is placed by
// script: below the trigger, or above it with placement="top", centred —
// start and end align it at the trigger's start or end edge — flipped to
// the other side where the viewport leaves no room and shifted along it to
// stay inside. Before, it hung absolutely below the trigger: an overflow:
// hidden around it cut it off, at the screen's edges it left the screen,
// and closed it still widened the page by its box. Escape gives the focus
// back to the trigger when it was inside the panel.
//
// Attributes: open, placement (bottom | top | start | end)
// Slots:      trigger, default (content)
// Events:     glk-open, glk-close
// Methods:    show(), close(), toggle()

const PLACEMENTS = ['top', 'bottom', 'start', 'end'];

class GlkPopover extends GlkElement {
  static get observedAttributes() {
    return ['open', 'placement'];
  }

  render() {
    this._anchor = this.createElement('div', ['glass-popover-anchor']);

    this._triggerSlot = document.createElement('slot');
    this._triggerSlot.setAttribute('name', 'trigger');
    this._anchor.appendChild(this._triggerSlot);

    this._popover = this.createElement('div', ['glass-popover'], { popover: 'manual' });
    this._applyPlacement();

    const contentSlot = document.createElement('slot');
    this._popover.appendChild(contentSlot);

    this._anchor.appendChild(this._popover);
    this._wrapper.appendChild(this._anchor);
  }

  _applyPlacement() {
    if (!this._popover) return;
    PLACEMENTS.forEach(p => this._popover.classList.remove(`glass-popover--${p}`));
    const placement = this.placement;
    if (placement !== 'bottom') this._popover.classList.add(`glass-popover--${placement}`);
  }

  /**
   * The trigger says whether the popover is open. It lives in the light DOM,
   * so aria-expanded goes on it directly; <glk-button> and <glk-pill> hand
   * it on to their native button. Runs again when the trigger is swapped.
   */
  _applyExpanded() {
    const open = String(this.getBoolAttr('open'));
    for (const trigger of this._triggerSlot.assignedElements()) {
      trigger.setAttribute('aria-expanded', open);
    }
  }

  /** Shows or hides the panel to match `open`. */
  _applyOpen() {
    const open = this.getBoolAttr('open') && this.isConnected;
    if (open && !this._handle) {
      const trigger = this._triggerSlot.assignedElements()[0];
      const placement = this.placement;
      this._handle = openPanel(this._popover, trigger ? focusTarget(trigger) : this._anchor, {
        side: placement === 'top' ? 'top' : 'bottom',
        align: placement === 'start' ? 'start' : placement === 'end' ? 'end' : 'center',
      });
    } else if (!open && this._handle) {
      this._handle.close();
      this._handle = null;
    }
    this._popover.classList.toggle('is-open', open);
  }

  setupEvents() {
    this._onSlotChange = () => this._applyExpanded();
    this._triggerSlot.addEventListener('slotchange', this._onSlotChange);
    this._applyExpanded();

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

    // Close on Escape; focus inside the panel goes back to the trigger. The
    // key is marked as handled (since 1.35.0): a dialog around — a sheet, a
    // modal — no longer closes with the popover, and a container can tell
    // from defaultPrevented that the popover took it. The key's path tells
    // where the focus was (since 1.38.0): document.activeElement is only the
    // outermost host when the popover lies in a shadow root, and the focus
    // stayed behind in the hidden panel.
    this._onKeydown = (e) => {
      if (e.key !== 'Escape' || !this.getBoolAttr('open') || e.defaultPrevented) return;
      e.preventDefault();
      const path = e.composedPath();
      const triggers = this._triggerSlot.assignedElements();
      const inside = path.includes(this._popover) && !triggers.some(t => path.includes(t));
      this.close();
      if (inside && triggers[0]) focusTarget(triggers[0]).focus();
    };
    document.addEventListener('keydown', this._onKeydown);
    this._applyOpen();
  }

  teardownEvents() {
    this._triggerSlot?.removeEventListener('slotchange', this._onSlotChange);
    this.removeEventListener('click', this._onTriggerClick);
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('keydown', this._onKeydown);
    this._handle?.close();
    this._handle = null;
  }

  onAttributeChanged(name) {
    if (!this._popover) return;
    switch (name) {
      case 'open': {
        const isOpen = this.getBoolAttr('open');
        this._applyOpen();
        this._applyExpanded();
        this.emit(isOpen ? 'glk-open' : 'glk-close', null, { bubbles: false });
        break;
      }
      case 'placement':
        this._applyPlacement();
        if (this._handle) {
          this._handle.close();
          this._handle = null;
          this._applyOpen();
        }
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

  get placement() {
    const v = this.getAttribute('placement');
    return PLACEMENTS.includes(v) ? v : 'bottom';
  }
  set placement(v) {
    if (PLACEMENTS.includes(v)) this.setAttribute('placement', v);
  }
}

customElements.define('glk-popover', GlkPopover);
export { GlkPopover };
