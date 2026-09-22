import { GlkElement } from '../../base.js';

// Bottom sheet — the mobile sibling of <glk-modal>. Came back from
// EhrenPfoten in 1.15.0.
//
// Attributes: open, inline (no overlay, always visible), title
// Properties: open, inline · Methods: show(), close()
// Slots:      default (content), actions
// Event:      glk-close — only when the user closes it (scrim click, Escape),
//             like <glk-modal>
// Parts:      overlay, sheet, title, body, actions
//
// Opening and closing are animated by the CSS block: the overlay gets
// .is-active one frame after it is unhidden, and on closing it is hidden
// only after transitionend (safety net 400 ms), so the blurred overlay
// leaves the layout instead of idling at opacity 0. Under
// prefers-reduced-motion it switches at once.

const HIDE_FALLBACK_MS = 400;

function reducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

class GlkSheet extends GlkElement {
  static get observedAttributes() { return ['open', 'inline', 'title']; }

  render() {
    this._overlay = this.createElement('div', [], { part: 'overlay' });
    this._panel = this.createElement('div', ['glass-sheet'], { role: 'dialog', part: 'sheet' });
    this._panel.appendChild(this.createElement('div', ['glass-sheet__grip'], { 'aria-hidden': 'true' }));
    this._titleEl = this.createElement('h2', ['glass-sheet__title'], { part: 'title' });
    const body = this.createElement('div', ['glass-sheet__body'], { part: 'body' });
    body.appendChild(document.createElement('slot'));
    const actions = this.createElement('div', ['glass-sheet__actions'], { part: 'actions' });
    actions.appendChild(this.createElement('slot', [], { name: 'actions' }));
    this._panel.append(this._titleEl, body, actions);
    this._overlay.appendChild(this._panel);
    this._wrapper.appendChild(this._overlay);
    this.takeTitle();
    this._applyTitle();
    this._applyMode();
  }

  _applyTitle() {
    if (!this._titleEl) return;
    const title = this._title || '';
    this._titleEl.textContent = title;
    this._titleEl.hidden = !title;
    if (title) this._panel.setAttribute('aria-label', title);
    else this._panel.removeAttribute('aria-label');
  }

  _applyMode() {
    const inline = this.inline;
    this._overlay.classList.toggle('glass-sheet-overlay', !inline);
    this._panel.classList.toggle('glass-sheet--inline', inline);
    this._panel.setAttribute('aria-modal', String(!inline));
    clearTimeout(this._hideTimer);
    if (inline) {
      this._overlay.classList.remove('is-active');
      this._overlay.hidden = false;
    } else if (this.open) {
      this._show();
    } else {
      this._overlay.classList.remove('is-active');
      this._overlay.hidden = true;
    }
  }

  _show() {
    clearTimeout(this._hideTimer);
    this._panel.removeEventListener('transitionend', this._onHidden);
    this._overlay.hidden = false;
    void this._overlay.offsetHeight; // reflow, so the transition starts from the hidden state
    requestAnimationFrame(() => {
      if (this.open && !this.inline) this._overlay.classList.add('is-active');
    });
  }

  _hide() {
    this._overlay.classList.remove('is-active');
    this._onHidden = () => {
      clearTimeout(this._hideTimer);
      this._panel.removeEventListener('transitionend', this._onHidden);
      if (!this.open && !this.inline) this._overlay.hidden = true;
    };
    if (reducedMotion()) {
      this._onHidden();
      return;
    }
    this._panel.addEventListener('transitionend', this._onHidden);
    this._hideTimer = setTimeout(this._onHidden, HIDE_FALLBACK_MS);
  }

  _dismiss() {
    this.removeAttribute('open');
    this.emit('glk-close');
  }

  setupEvents() {
    this._onOverlayClick = (event) => {
      if (!this.inline && event.target === this._overlay) this._dismiss();
    };
    this._onKeydown = (event) => {
      if (event.key === 'Escape' && this.open && !this.inline) this._dismiss();
    };
    this._overlay.addEventListener('click', this._onOverlayClick);
    document.addEventListener('keydown', this._onKeydown);
  }

  teardownEvents() {
    this._overlay?.removeEventListener('click', this._onOverlayClick);
    document.removeEventListener('keydown', this._onKeydown);
  }

  onAttributeChanged(name, _old, value) {
    if (!this._overlay) return;
    switch (name) {
      case 'open':
        if (this.inline) return;
        if (this.open) this._show();
        else this._hide();
        break;
      case 'inline': this._applyMode(); break;
      case 'title': if (this.takeTitle(value)) this._applyTitle(); break;
    }
  }

  show() { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }

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
