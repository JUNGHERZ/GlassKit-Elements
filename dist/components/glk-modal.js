import { GlkElement } from './base.js';
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

const CLOSE_FALLBACK_MS = 400;

function reducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    // `open` is applied in setupEvents, which also runs when a moved element
    // comes back.
  }

  projectLightDom() {
    const buttons = [...this.querySelectorAll('[slot="actions"] button')];
    const signature = buttons.map(b => b.outerHTML).join('');
    if (signature === this._footerSignature) return;
    this._footerSignature = signature;

    this._footer.innerHTML = '';
    buttons.forEach((btn, i) => {
      const clone = btn.cloneNode(true);
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
      if (this.open) this._dismiss();
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
      // The actions are copies in the shadow root; the originals are not shown.
      (this._footer.querySelector('[autofocus]') || this.querySelector('[autofocus]'))?.focus();
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
    this.removeAttribute('open');
    this.emit('glk-close');
  }

  show() { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }

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
