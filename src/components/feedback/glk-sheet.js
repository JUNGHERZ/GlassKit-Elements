import { GlkElement } from '../../base.js';
import { scrollLock } from '../../scroll-lock.js';

// Bottom sheet — the mobile sibling of <glk-modal>. Came back from
// EhrenPfoten in 1.15.0.
//
// Attributes: open, inline (no overlay, always visible), title
// Properties: open, inline · Methods: show(), close() — close() returns a
//             promise that settles with glk-closed (since 1.32.0)
// Slots:      default (content), actions
// Events:     glk-open — whenever it opens: attribute, property or show()
//             (since 1.30.0); glk-close — only when the user closes it
//             (scrim click, Escape), like <glk-modal>; glk-closed — once
//             the sheet has slid out and its dialog closed, however it
//             closed, at once under prefers-reduced-motion (since 1.32.0):
//             a page that renders the sheet from state drops it there, and
//             the slide-out shows
// Parts:      overlay, sheet, title, body, actions
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

function reducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class GlkSheet extends GlkElement {
  static get observedAttributes() { return ['open', 'inline', 'title']; }

  render() {
    this._overlay = this.createElement('dialog', ['glass-sheet-overlay'], { part: 'overlay' });
    this._panel = this.createElement('div', ['glass-sheet'], { part: 'sheet' });
    this._panel.appendChild(this.createElement('div', ['glass-sheet__grip'], { 'aria-hidden': 'true' }));
    this._titleEl = this.createElement('h2', ['glass-sheet__title'], { id: 'title', part: 'title' });
    const body = this.createElement('div', ['glass-sheet__body'], { part: 'body' });
    body.appendChild(document.createElement('slot'));
    const actions = this.createElement('div', ['glass-sheet__actions'], { part: 'actions' });
    actions.appendChild(this.createElement('slot', [], { name: 'actions' }));
    this._panel.append(this._titleEl, body, actions);
    this._wrapper.appendChild(this._overlay);
    this._scrollLock = scrollLock();
    this.takeTitle();
    this._applyMode();
    // `open` is applied in setupEvents, which also runs when a moved element
    // comes back.
  }

  /** The title names the dialog, or the inline panel. */
  _applyTitle() {
    if (!this._titleEl) return;
    const title = this._title || '';
    this._titleEl.textContent = title;
    this._titleEl.hidden = !title;
    const named = this.inline ? this._panel : this._overlay;
    const other = this.inline ? this._overlay : this._panel;
    other.removeAttribute('aria-labelledby');
    if (title) named.setAttribute('aria-labelledby', 'title');
    else named.removeAttribute('aria-labelledby');
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
      dialog.showModal();
      this._scrollLock.hold();
      this.querySelector('[autofocus]')?.focus();
      this.emit('glk-open');
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
    this.emit('glk-close');
  }

  setupEvents() {
    this._onOverlayClick = (event) => {
      if (event.target === this._overlay) this._dismiss();
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
      if (this.open && !this.inline) this._dismiss();
      if (!this.open) this._closed();       // not when it turned inline
    };
    this._overlay.addEventListener('click', this._onOverlayClick);
    this._overlay.addEventListener('cancel', this._onCancel);
    this._overlay.addEventListener('close', this._onClose);
    if (this.open && !this.inline) this._show();
  }

  teardownEvents() {
    this._overlay?.removeEventListener('click', this._onOverlayClick);
    this._overlay?.removeEventListener('cancel', this._onCancel);
    this._overlay?.removeEventListener('close', this._onClose);
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
    this.emit('glk-closed');
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
}

customElements.define('glk-sheet', GlkSheet);
export { GlkSheet };
