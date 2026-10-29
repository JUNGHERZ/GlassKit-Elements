import { GlkElement } from '../../base.js';
import { scrollLock } from '../../scroll-lock.js';

// Bottom sheet — the mobile sibling of <glk-modal>. Came back from
// EhrenPfoten in 1.15.0.
//
// Attributes: open, inline (no overlay, always visible), title; since
//             1.35.0 label (the name without a visible title), dismissible
//             and close-label (a close button in the head; default
//             "Close"), placement (bottom | start | end) and modeless
// Properties: open, inline, label, dismissible, closeLabel, placement,
//             modeless · Methods: show(), close() — close() returns a
//             promise that settles with glk-closed (since 1.32.0)
// Slots:      default (content), actions; since 1.35.0 eyebrow (a short
//             line above the title), leading and trailing (before and
//             after it, in the head)
// Events:     glk-open — whenever it opens: attribute, property or show()
//             (since 1.30.0); glk-close — only when the user closes it
//             (scrim click, Escape), like <glk-modal>; glk-closed — once
//             the sheet has slid out and its dialog closed, however it
//             closed, at once under prefers-reduced-motion (since 1.32.0):
//             a page that renders the sheet from state drops it there, and
//             the slide-out shows
// Parts:      overlay, sheet, title, body, actions; since 1.35.0 grip,
//             head, eyebrow, leading, trailing, close
//
// Since 1.35.0 the events glk-open, glk-close and glk-closed stay at the
// element: they do not bubble, so a sheet's listener no longer takes the
// glk-close of a popover inside it for its own.
//
// placement="start" or "end" (since 1.35.0) puts the panel at that side of
// the window, full height, without a grip and with its actions side by
// side — a side panel on a desktop. modeless opens it with show() instead
// of showModal(): no scrim, the page stays usable and other dialogs open
// above it; Escape inside it closes it, a click outside does not, and the
// focus moves into it on opening and back where it came from on closing.
//
// Since 1.30.0 the overlay is a native <dialog> opened with showModal(), as
// <glk-modal>'s. It lies in the top layer, above every fixed or transformed
// element of the page whatever its z-index — a fixed tab bar with a
// backdrop filter landed above the old fixed div now and then on iOS — the
// page behind it is inert and does not scroll, and Escape arrives as the
// dialog's cancel event. Inline, the panel sits in the flow and the dialog
// stays closed.
//
// Opening and closing are animated by the CSS block: .is-active is added one
// frame after showModal(), and on closing the dialog closes only after the
// panel's transitionend (safety net 400 ms). Under prefers-reduced-motion it
// switches at once.

const HIDE_FALLBACK_MS = 400;
const PLACEMENTS = ['start', 'end'];
const CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';

/** The element that has the focus, through shadow roots. */
function deepActive() {
  let a = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a;
}

function reducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class GlkSheet extends GlkElement {
  static get observedAttributes() {
    return ['open', 'inline', 'title', 'label', 'dismissible', 'close-label', 'placement', 'modeless'];
  }

  render() {
    this._overlay = this.createElement('dialog', ['glass-sheet-overlay'], { part: 'overlay' });
    this._panel = this.createElement('div', ['glass-sheet'], { part: 'sheet' });
    this._panel.appendChild(this.createElement('div', ['glass-sheet__grip'], { 'aria-hidden': 'true', part: 'grip' }));
    // The head (since 1.35.0): leading, eyebrow over the title, trailing, ×.
    // With only a title it lays the title out as before.
    this._head = this.createElement('div', ['glass-sheet__head'], { part: 'head' });
    this._places = {};
    const place = (name, tag = 'span') => {
      const el = this.createElement(tag, [`glass-sheet__${name}`], { part: name, hidden: '' });
      const slot = this.createElement('slot', [], { name });
      slot.addEventListener('slotchange', () => this._applyHead());
      el.appendChild(slot);
      this._places[name] = { el, slot };
      return el;
    };
    const heading = this.createElement('div', ['glass-sheet__heading']);
    this._titleEl = this.createElement('h2', ['glass-sheet__title'], { id: 'title', part: 'title' });
    heading.append(place('eyebrow'), this._titleEl);
    this._closeBtn = this.createElement('button', ['glass-sheet__close'], { type: 'button', part: 'close', hidden: '' });
    this._closeBtn.innerHTML = CLOSE;
    this._head.append(place('leading'), heading, place('trailing'), this._closeBtn);
    const body = this.createElement('div', ['glass-sheet__body'], { part: 'body' });
    body.appendChild(document.createElement('slot'));
    const actions = this.createElement('div', ['glass-sheet__actions'], { part: 'actions' });
    actions.appendChild(this.createElement('slot', [], { name: 'actions' }));
    this._panel.append(this._head, body, actions);
    this._wrapper.appendChild(this._overlay);
    this._scrollLock = scrollLock();
    this.takeTitle();
    this._applyMode();
    this._applyPlacement();
    this._applyClose();
    // `open` is applied in setupEvents, which also runs when a moved element
    // comes back.
  }

  /**
   * The title names the dialog, or the inline panel; without one, `label`
   * does (since 1.35.0). Before, a sheet without a title had no name.
   */
  _applyTitle() {
    if (!this._titleEl) return;
    const title = this._title || '';
    this._titleEl.textContent = title;
    this._titleEl.hidden = !title;
    const named = this.inline ? this._panel : this._overlay;
    const other = this.inline ? this._overlay : this._panel;
    other.removeAttribute('aria-labelledby');
    other.removeAttribute('aria-label');
    if (title) named.setAttribute('aria-labelledby', 'title');
    else named.removeAttribute('aria-labelledby');
    const label = this.getAttribute('label');
    if (label) named.setAttribute('aria-label', label);
    else named.removeAttribute('aria-label');
    this._applyHead();
  }

  /** Each place of the head shows while it holds something; the head while any does. */
  _applyHead() {
    if (!this._head) return;
    let any = Boolean(this._title) || this.dismissible;
    for (const { el, slot } of Object.values(this._places)) {
      el.hidden = slot.assignedNodes().length === 0;
      if (!el.hidden) any = true;
    }
    this._head.hidden = !any;
  }

  /** dismissible: a close button at the end of the head, named by close-label. */
  _applyClose() {
    this._closeBtn.hidden = !this.dismissible;
    this._closeBtn.setAttribute('aria-label', this.closeLabel);
    this._applyHead();
  }

  /** placement and modeless: the overlay's side and whether it holds the page. */
  _applyPlacement() {
    for (const p of PLACEMENTS) this._overlay.classList.toggle(`glass-sheet-overlay--${p}`, this.placement === p);
    this._overlay.classList.toggle('glass-sheet-overlay--modeless', this.modeless);
    // Modeless, the panel takes the focus when nothing inside asks for it.
    if (this.modeless) this._panel.tabIndex = -1;
    else this._panel.removeAttribute('tabindex');
  }

  /** Inline the panel sits in the flow; else it lives in the dialog. */
  _applyMode() {
    const inline = this.inline;
    this._panel.classList.toggle('glass-sheet--inline', inline);
    if (inline) {
      this._settle();
      this._overlay.classList.remove('is-active');
      if (this._overlay.open) this._overlay.close();
      this._scrollLock.release();
      this._panel.setAttribute('role', 'dialog');
      this._wrapper.appendChild(this._panel);
    } else {
      this._panel.removeAttribute('role');
      this._overlay.appendChild(this._panel);
    }
    this._applyTitle();
  }

  /** Drops a pending close. */
  _settle() {
    clearTimeout(this._hideTimer);
    if (this._onHidden) this._panel.removeEventListener('transitionend', this._onHidden);
  }

  _show() {
    const dialog = this._overlay;
    this._settle();
    if (!dialog.open) {
      if (this.modeless) {
        // In the page, not over it: where the focus was, it goes back to.
        this._returnFocus = deepActive();
        dialog.show();
      } else {
        dialog.showModal();
        this._scrollLock.hold();
      }
      // Modal, the dialog puts the focus on what it holds first; modeless, the
      // browsers differ, so the panel takes it — or what asks with autofocus.
      const autofocus = this.querySelector('[autofocus]');
      if (autofocus) autofocus.focus();
      else if (this.modeless) this._panel.focus({ preventScroll: true });
      this.emit('glk-open', null, { bubbles: false });
    }
    void dialog.offsetHeight; // reflow, so the transition starts from the closed state
    requestAnimationFrame(() => {
      if (this.open && !this.inline) dialog.classList.add('is-active');
    });
  }

  _hide() {
    const dialog = this._overlay;
    dialog.classList.remove('is-active');
    this._onHidden = (event) => {
      if (event && event.target !== this._panel) return;   // a transition inside the panel
      this._settle();
      if (!this.open && dialog.open) dialog.close();
    };
    if (!dialog.open || reducedMotion()) {
      this._onHidden();
      return;
    }
    this._panel.addEventListener('transitionend', this._onHidden);
    this._hideTimer = setTimeout(this._onHidden, HIDE_FALLBACK_MS);
  }

  /** Closed by the user — a click outside, Escape. */
  _dismiss() {
    if (!this.open) return;
    this.removeAttribute('open');
    this.emit('glk-close', null, { bubbles: false });
  }

  setupEvents() {
    this._onOverlayClick = (event) => {
      if (event.target === this._overlay && !this.modeless) this._dismiss();
    };
    this._onCloseClick = () => this._dismiss();
    // A modeless sheet has no cancel event: Escape inside it closes it,
    // unless something inside — a popover, a menu — took the key.
    this._onKeydown = (event) => {
      if (event.key !== 'Escape' || !this.modeless || event.defaultPrevented) return;
      event.preventDefault();
      this._dismiss();
    };
    // Escape: the dialog would close at once; it slides out like a click outside.
    this._onCancel = (event) => {
      event.preventDefault();
      this._dismiss();
    };
    // Every close ends the lock. The browser may also close the dialog by
    // itself — Chrome does on a second Escape without user activation.
    this._onClose = () => {
      if (this._overlay.open) return;       // a late event from an earlier close
      this._overlay.classList.remove('is-active');
      this._scrollLock.release();
      // Modeless, the browser leaves the focus where it was: on the panel
      // that is gone. It goes back to where it was before the sheet opened.
      const back = this._returnFocus;
      this._returnFocus = null;
      if (back?.isConnected && (this._overlay.contains(deepActive()) || document.activeElement === document.body)) back.focus({ preventScroll: true });
      if (this.open && !this.inline) this._dismiss();
      if (!this.open) this._closed();       // not when it turned inline
    };
    this._overlay.addEventListener('click', this._onOverlayClick);
    this._overlay.addEventListener('cancel', this._onCancel);
    this._overlay.addEventListener('close', this._onClose);
    this._overlay.addEventListener('keydown', this._onKeydown);
    this._closeBtn.addEventListener('click', this._onCloseClick);
    if (this.open && !this.inline) this._show();
  }

  teardownEvents() {
    this._overlay?.removeEventListener('click', this._onOverlayClick);
    this._overlay?.removeEventListener('cancel', this._onCancel);
    this._overlay?.removeEventListener('close', this._onClose);
    this._overlay?.removeEventListener('keydown', this._onKeydown);
    this._closeBtn?.removeEventListener('click', this._onCloseClick);
    // Taken out of the document, the dialog leaves the top layer but stays
    // open. Closed now, it opens as a modal again when the element comes back.
    this._settle();
    this._overlay?.classList.remove('is-active');
    if (this._overlay?.open) this._overlay.close();
    this._scrollLock?.release();
    this._settleClosing();
  }

  /** The dialog has closed: glk-closed, and the promises of close() settle. */
  _closed() {
    this.emit('glk-closed', null, { bubbles: false });
    this._settleClosing();
  }

  _settleClosing() {
    for (const resolve of this._closing?.splice(0) ?? []) resolve();
  }

  onAttributeChanged(name, _old, value) {
    if (!this._overlay) return;
    switch (name) {
      case 'open':
        if (this.inline || !this.isConnected) return;   // setupEvents applies it on connect
        if (this.open) this._show();
        else this._hide();
        break;
      case 'inline':
        this._applyMode();
        if (!this.inline && this.open && this.isConnected) this._show();
        break;
      case 'title': if (this.takeTitle(value)) this._applyTitle(); break;
      case 'label': this._applyTitle(); break;
      case 'dismissible':
      case 'close-label': this._applyClose(); break;
      case 'placement': this._applyPlacement(); break;
      case 'modeless':
        this._applyPlacement();
        // Open, it reopens in the other mode.
        if (this.open && !this.inline && this.isConnected && this._overlay.open) {
          this._settle();
          this._overlay.close();
          this._show();
        }
        break;
    }
  }

  show() { this.setAttribute('open', ''); }

  /** Settles once the sheet has slid out — at once when nothing is shown. */
  close() {
    const shown = !this.inline && Boolean(this._overlay?.open) && this.isConnected;
    this.removeAttribute('open');
    if (!shown) return Promise.resolve();
    return new Promise(resolve => (this._closing ??= []).push(resolve));
  }

  // `title` is the heading, never a tooltip — see GlkElement.takeTitle().
  get title() { return this._title ?? ''; }
  set title(v) {
    this._title = v == null ? '' : String(v);
    this._applyTitle();
  }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }

  get inline() { return this.getBoolAttr('inline'); }
  set inline(v) { this.setBoolAttr('inline', v); }

  get label() { return this.getAttribute('label') || ''; }
  set label(v) {
    if (v) this.setAttribute('label', v);
    else this.removeAttribute('label');
  }

  get dismissible() { return this.getBoolAttr('dismissible'); }
  set dismissible(v) { this.setBoolAttr('dismissible', v); }

  get closeLabel() { return this.getAttribute('close-label') || 'Close'; }
  set closeLabel(v) {
    if (v) this.setAttribute('close-label', v);
    else this.removeAttribute('close-label');
  }

  /** "bottom" (default), "start" or "end". */
  get placement() {
    const p = this.getAttribute('placement');
    return PLACEMENTS.includes(p) ? p : 'bottom';
  }
  set placement(v) {
    if (PLACEMENTS.includes(v)) this.setAttribute('placement', v);
    else this.removeAttribute('placement');
  }

  get modeless() { return this.getBoolAttr('modeless'); }
  set modeless(v) { this.setBoolAttr('modeless', v); }
}

customElements.define('glk-sheet', GlkSheet);
export { GlkSheet };
