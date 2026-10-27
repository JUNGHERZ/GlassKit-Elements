import { GlkElement } from './base.js';
import { s as scrollLock } from './shared/scroll-lock-CPPPbHHK.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// Since 1.20.0 the overlay is a native <dialog>, opened with showModal(). The
// browser then does what a modal needs: the dialog lies in the top layer, the
// page behind it is inert — for the pointer, the keyboard and screen readers
// alike — focus moves in on opening and goes back to where it came from on
// closing, and the content is out of reach while the modal is closed.
// GlassKit (1.20.0) styles dialog.glass-modal-overlay for this.
//
// The element keeps the fade: the dialog opens before .is-active is set and
// closes only after the overlay has faded (safety net 400 ms; at once under
// prefers-reduced-motion). Escape arrives as the dialog's cancel event and
// takes the same path as a click on the dimmed area.
//
// Which element gets the focus on opening, the browsers decide differently:
// Chrome takes the first field of the content, Safari the first action. An
// element marked autofocus — in the content or among the actions — settles
// it in both.
//
// Since 1.30.0 it emits glk-open whenever it opens — attribute, property or
// show() — and the page does not scroll while it is open (glk-close stays
// the user's close only). Since 1.32.0 glk-closed follows once it has faded
// out and its dialog closed, however it closed, and close() returns a
// promise that settles then: a page that renders the modal from state drops
// it there, and the fade shows.

const CLOSE_FALLBACK_MS = 400;

function reducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// The copies carry no inline handlers (onclick="…"): a click on a copy is
// handed to its original, and until 1.28.0 such a handler ran twice.
const isHandler = name => name.startsWith('on');

function copyOf(node) {
  const copy = node.cloneNode(true);
  if (copy.nodeType === Node.ELEMENT_NODE) {
    for (const el of [copy, ...copy.querySelectorAll('*')]) {
      for (const { name } of [...el.attributes]) if (isHandler(name)) el.removeAttribute(name);
    }
  }
  return copy;
}

/** Gives an action's copy the attributes and the content of its original. */
function mirror(copy, original) {
  for (const { name } of [...copy.attributes]) {
    if (!original.hasAttribute(name)) copy.removeAttribute(name);
  }
  for (const { name, value } of original.attributes) {
    if (!isHandler(name) && copy.getAttribute(name) !== value) copy.setAttribute(name, value);
  }
  if (copy.innerHTML !== original.innerHTML) {
    copy.replaceChildren(...[...original.childNodes].map(copyOf));
  }
}

class GlkModal extends GlkElement {
  static get observedAttributes() {
    return ['open', 'title'];
  }

  static get observesLightDom() { return true; }

  render() {
    this._overlay = this.createElement('dialog', ['glass-modal-overlay'], { part: 'overlay' });

    const modal = this.createElement('div', ['glass-modal'], { part: 'modal' });

    // Header — the title names the dialog
    const header = this.createElement('div', ['glass-modal__header'], { part: 'header' });
    this._titleEl = this.createElement('h2', ['glass-modal__title'], { id: 'title' });
    this.takeTitle();
    this._applyTitle();
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
    this._scrollLock = scrollLock();
    // `open` is applied in setupEvents, which also runs when a moved element
    // comes back.
  }

  projectLightDom() {
    const buttons = [...this.querySelectorAll('[slot="actions"] button')];
    const signature = buttons.map(b => b.outerHTML).join('');
    if (signature === this._footerSignature) return;
    this._footerSignature = signature;

    // As many actions as copies: each copy takes its original's attributes
    // and content in place, so the one that has the focus keeps it — a
    // confirm button that the page enables, or relabels while it works.
    const copies = [...this._footer.children];
    if (copies.length === buttons.length) {
      buttons.forEach((btn, i) => mirror(copies[i], btn));
      return;
    }

    this._footer.innerHTML = '';
    buttons.forEach((btn, i) => {
      const clone = copyOf(btn);
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
      if (e.target === this._overlay) this._dismiss();
    };
    this._overlay.addEventListener('click', this._onOverlayClick);

    // Escape: the dialog would close at once; it fades out like a click outside.
    this._onCancel = (e) => {
      e.preventDefault();
      this._dismiss();
    };
    this._overlay.addEventListener('cancel', this._onCancel);

    // The browser may also close the dialog by itself — Chrome does on a
    // second Escape without user activation in between, skipping cancel.
    this._onClose = () => {
      if (this._overlay.open) return;       // a late event from an earlier close
      this._overlay.classList.remove('is-active');
      this._scrollLock.release();
      if (this.open) this._dismiss();
      this._closed();
    };
    this._overlay.addEventListener('close', this._onClose);

    if (this.open) this._show();
  }

  teardownEvents() {
    this._overlay?.removeEventListener('click', this._onOverlayClick);
    this._overlay?.removeEventListener('cancel', this._onCancel);
    this._overlay?.removeEventListener('close', this._onClose);
    // Taken out of the document, the dialog leaves the top layer but stays
    // open — shown in place, not modal. Closed now, it opens as a modal again
    // when the element comes back.
    clearTimeout(this._closeTimer);
    this._overlay?.removeEventListener('transitionend', this._onFaded);
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
        if (!this.isConnected) return;      // setupEvents applies it on connect
        if (this.open) this._show();
        else this._hide();
        break;
      case 'title':
        if (this.takeTitle(value)) this._applyTitle();
        break;
    }
  }

  _show() {
    const dialog = this._overlay;
    clearTimeout(this._closeTimer);
    dialog.removeEventListener('transitionend', this._onFaded);
    if (!dialog.open) {
      dialog.showModal();
      this._scrollLock.hold();
      // The actions are copies in the shadow root; the originals are not shown.
      (this._footer.querySelector('[autofocus]') || this.querySelector('[autofocus]'))?.focus();
      this.emit('glk-open');
    }
    void dialog.offsetHeight; // reflow, so the fade starts from the closed state
    requestAnimationFrame(() => {
      if (this.open) dialog.classList.add('is-active');
    });
  }

  _hide() {
    const dialog = this._overlay;
    dialog.classList.remove('is-active');
    this._onFaded = (event) => {
      if (event && event.target !== dialog) return;   // the panel's own transition
      clearTimeout(this._closeTimer);
      dialog.removeEventListener('transitionend', this._onFaded);
      if (!this.open && dialog.open) dialog.close();
    };
    if (!dialog.open || reducedMotion()) {
      this._onFaded();
      return;
    }
    dialog.addEventListener('transitionend', this._onFaded);
    this._closeTimer = setTimeout(this._onFaded, CLOSE_FALLBACK_MS);
  }

  /** Closed by the user — a click outside, Escape. */
  _dismiss() {
    if (!this.open) return;               // Escape again while it fades out
    this.removeAttribute('open');
    this.emit('glk-close');
  }

  show() { this.setAttribute('open', ''); }

  /** Settles once the modal has faded out — at once when nothing is shown. */
  close() {
    const shown = Boolean(this._overlay?.open) && this.isConnected;
    this.removeAttribute('open');
    if (!shown) return Promise.resolve();
    return new Promise(resolve => (this._closing ??= []).push(resolve));
  }

  _applyTitle() {
    if (!this._titleEl) return;
    this._titleEl.textContent = this._title || '';
    if (this._title) this._overlay.setAttribute('aria-labelledby', 'title');
    else this._overlay.removeAttribute('aria-labelledby');
  }

  // `title` is the heading, never a tooltip — see GlkElement.takeTitle().
  get title() { return this._title ?? ''; }
  set title(v) {
    this._title = v == null ? '' : String(v);
    this._applyTitle();
  }

  get open() { return this.getBoolAttr('open'); }
  set open(v) { this.setBoolAttr('open', v); }
}

customElements.define('glk-modal', GlkModal);

export { GlkModal };
