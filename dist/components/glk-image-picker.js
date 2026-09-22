import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// One image with a preview, resized on the client before it goes anywhere.
// Came back from EhrenPfoten in 1.16.0, where it was the photo picker.
//
// Attributes: src (starting image: URL or data URL), label (visible; names
//             the group), hint (small muted line; none by default), round
//             (circular preview, for avatars), max (longest edge after
//             resizing, default 1024), type (output MIME, default
//             image/jpeg; image/webp where the browser encodes it, PNG
//             otherwise), quality (0–1, default 0.82), accept (file dialog
//             filter, default image/*), choose-label, change-label,
//             remove-label (button texts, English by default)
// Property:   src — the current image as a data URL or the given URL; set
//             it to swap the preview. Not reflected to the attribute, so a
//             data URL of megabytes never lands in the DOM.
// Events:     glk-change { dataUrl, width, height, size } — after a pick;
//             on remove with an empty dataUrl and zeros
//             glk-error { message, name } — when the file cannot be decoded
//             (Chrome cannot read HEIC; a corrupt file)
// Parts:      picker, preview, meta, label, hint, actions
//
// Decoding goes through createImageBitmap with imageOrientation 'from-image',
// which applies the EXIF rotation of a phone photo without a library, then
// onto a canvas no larger than max. The file input is hidden and opened from
// a real button — a <label> around a hidden input cannot be reached by
// keyboard — and cleared after every pick, so the same file can be chosen
// again. Not form-associated: the form value would be either the original
// file, which is not what gets uploaded, or a data URL of megabytes. Listen
// to glk-change and upload, or copy the data URL into a hidden field.

const PLACEHOLDER = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 15l-5-4-8 8"/></svg>';

function dataUrlBytes(url) {
  const b64 = url.slice(url.indexOf(',') + 1);
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

class GlkImagePicker extends GlkElement {
  static get observedAttributes() {
    return ['src', 'label', 'hint', 'round', 'max', 'type', 'quality', 'accept', 'choose-label', 'change-label', 'remove-label'];
  }

  constructor() {
    super();
    this._src = '';
  }

  render() {
    this._src = this.getAttribute('src') || '';
    this._root = this.createElement('div', ['glass-image-picker'], { part: 'picker', role: 'group' });
    this._preview = this.createElement('div', ['glass-image-picker__preview'], { part: 'preview' });
    const meta = this.createElement('div', ['glass-image-picker__meta'], { part: 'meta' });
    this._label = this.createElement('span', ['glass-image-picker__label'], { part: 'label', id: 'label' });
    this._hint = this.createElement('span', ['glass-image-picker__hint'], { part: 'hint', id: 'hint' });
    const actions = this.createElement('div', ['glass-image-picker__actions'], { part: 'actions' });
    this._choose = this.createElement('button', ['glass-btn', 'glass-btn--secondary', 'glass-btn--sm', 'glass-btn--auto'], { type: 'button' });
    this._remove = this.createElement('button', ['glass-btn', 'glass-btn--tertiary', 'glass-btn--sm', 'glass-btn--auto'], { type: 'button' });
    this._input = this.createElement('input', [], { type: 'file', tabindex: '-1' });
    this._input.hidden = true;
    actions.append(this._choose, this._remove, this._input);
    meta.append(this._label, this._hint, actions);
    this._root.append(this._preview, meta);
    this._wrapper.appendChild(this._root);
    this._update();
  }

  get _max() { return Math.max(1, Math.floor(Number(this.getAttribute('max'))) || 1024); }
  get _type() { return this.getAttribute('type') || 'image/jpeg'; }
  get _quality() {
    const q = Number(this.getAttribute('quality'));
    return this.hasAttribute('quality') && q >= 0 && q <= 1 ? q : 0.82;
  }

  _update() {
    if (!this._root) return;
    const label = this.getAttribute('label') || '';
    const hint = this.getAttribute('hint') || '';
    this._preview.classList.toggle('glass-image-picker__preview--round', this.getBoolAttr('round'));
    if (!this._src) {
      this._img = null;
      this._preview.innerHTML = PLACEHOLDER;
    } else if (!this._img || this._img.getAttribute('src') !== this._src) {
      this._img = this.createElement('img', [], { alt: '', src: this._src });
      this._preview.replaceChildren(this._img);
    }
    this._label.textContent = label;
    this._label.hidden = !label;
    this._hint.textContent = hint;
    this._hint.hidden = !hint;
    if (label) this._root.setAttribute('aria-labelledby', 'label');
    else this._root.removeAttribute('aria-labelledby');
    if (hint) this._root.setAttribute('aria-describedby', 'hint');
    else this._root.removeAttribute('aria-describedby');
    this._choose.textContent = this._src
      ? (this.getAttribute('change-label') || 'Change')
      : (this.getAttribute('choose-label') || 'Choose');
    this._remove.textContent = this.getAttribute('remove-label') || 'Remove';
    this._remove.hidden = !this._src;
    this._input.accept = this.getAttribute('accept') || 'image/*';
  }

  async _pick(file) {
    if (!file) return;
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const scale = Math.min(1, this._max / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d');
      if (this._type === 'image/jpeg') {
        // JPEG has no alpha; without this a transparent PNG comes out on black.
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const dataUrl = canvas.toDataURL(this._type, this._quality);
      this.src = dataUrl;
      this.emit('glk-change', { dataUrl, width: canvas.width, height: canvas.height, size: dataUrlBytes(dataUrl) });
    } catch (error) {
      this.emit('glk-error', { message: error?.message || String(error), name: file.name });
    }
  }

  setupEvents() {
    this._onChoose = () => this._input.click();
    this._onChange = (event) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      this._pick(file);
    };
    this._onRemove = () => {
      this.src = '';
      this._choose.focus();   // the remove button just went away under the focus
      this.emit('glk-change', { dataUrl: '', width: 0, height: 0, size: 0 });
    };
    this._choose.addEventListener('click', this._onChoose);
    this._input.addEventListener('change', this._onChange);
    this._remove.addEventListener('click', this._onRemove);
  }

  teardownEvents() {
    this._choose?.removeEventListener('click', this._onChoose);
    this._input?.removeEventListener('change', this._onChange);
    this._remove?.removeEventListener('click', this._onRemove);
  }

  onAttributeChanged(name, _old, value) {
    if (name === 'src') this._src = value || '';
    this._update();
  }

  get src() { return this._src; }
  set src(v) {
    this._src = v || '';
    this._update();
  }

  get label() { return this.getAttribute('label') || ''; }
  set label(v) {
    if (v) this.setAttribute('label', v);
    else this.removeAttribute('label');
  }

  get round() { return this.getBoolAttr('round'); }
  set round(v) { this.setBoolAttr('round', v); }
}

customElements.define('glk-image-picker', GlkImagePicker);

export { GlkImagePicker };
