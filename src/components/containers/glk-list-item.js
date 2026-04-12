import { GlkElement } from '../../base.js';

// Module-level override sheet — shared by all instances.
// Suppresses the auto-divider when glk-list marks this item as the
// last-of-type via [data-last]. The default divider is rendered by
// glasskit.css thanks to the sentinel sibling in the shadow tree.
const lastChildOverrideSheet = new CSSStyleSheet();
lastChildOverrideSheet.replaceSync(`
  :host([data-last]) .glass-list__item::after { content: none; }
`);

const VARIANTS = ['danger', 'accent'];

class GlkListItem extends GlkElement {
  static get observedAttributes() {
    return ['title', 'subtitle', 'interactive', 'center', 'leading-lg', 'wrap', 'detail', 'variant', 'data-last'];
  }

  constructor() {
    super();
    this._shadow.adoptedStyleSheets = [
      ...this._shadow.adoptedStyleSheets,
      lastChildOverrideSheet
    ];
  }

  render() {
    // display:contents wrapper — transparent to layout.
    const wrap = this.createElement('div');
    wrap.style.display = 'contents';

    this._item = this.createElement('li', ['glass-list__item']);
    if (this.getBoolAttr('interactive')) this._item.classList.add('glass-list__item--interactive');
    if (this.getBoolAttr('center')) this._item.classList.add('glass-list__item--center');
    const initialVariant = this.getAttribute('variant');
    if (initialVariant && VARIANTS.includes(initialVariant)) {
      this._item.classList.add(`glass-list__item--${initialVariant}`);
    }

    // Leading slot — hidden until a child with slot="leading" appears.
    this._leading = this.createElement('span', ['glass-list__leading']);
    if (this.getBoolAttr('leading-lg')) this._leading.classList.add('glass-list__leading--lg');
    this._leadingSlot = document.createElement('slot');
    this._leadingSlot.setAttribute('name', 'leading');
    this._leading.appendChild(this._leadingSlot);
    this._leading.hidden = true;

    // Content — title + optional subtitle.
    this._content = this.createElement('div', ['glass-list__content']);
    this._titleEl = this.createElement('div', ['glass-list__title']);
    this._titleEl.textContent = this.getAttribute('title') || '';
    this._subtitleEl = this.createElement('div', ['glass-list__subtitle']);
    if (this.getBoolAttr('wrap')) this._subtitleEl.classList.add('glass-list__subtitle--wrap');
    const initialSubtitle = this.getAttribute('subtitle') || '';
    this._subtitleEl.textContent = initialSubtitle;
    this._subtitleEl.hidden = !initialSubtitle;
    this._content.appendChild(this._titleEl);
    this._content.appendChild(this._subtitleEl);

    // Trailing — value span + slot for icons/badges.
    this._trailing = this.createElement('div', ['glass-list__trailing']);
    this._valueEl = this.createElement('span', ['glass-list__value']);
    const initialDetail = this.getAttribute('detail') || '';
    this._valueEl.textContent = initialDetail;
    this._valueEl.hidden = !initialDetail;
    this._trailing.appendChild(this._valueEl);
    this._trailingSlot = document.createElement('slot');
    this._trailingSlot.setAttribute('name', 'trailing');
    this._trailing.appendChild(this._trailingSlot);
    this._trailing.hidden = !initialDetail; // also revealed by slotchange

    this._item.appendChild(this._leading);
    this._item.appendChild(this._content);
    this._item.appendChild(this._trailing);

    // Sentinel sibling so the <li> is never :last-child inside its shadow
    // parent — keeps the glasskit.css ::after divider rule matching.
    const sentinel = this.createElement('span');
    sentinel.hidden = true;
    sentinel.setAttribute('aria-hidden', 'true');

    wrap.appendChild(this._item);
    wrap.appendChild(sentinel);
    this._wrapper.appendChild(wrap);
  }

  setupEvents() {
    // Reveal leading/trailing wrappers only when slotted content exists.
    this._onLeadingSlotChange = () => {
      this._leading.hidden = this._leadingSlot.assignedNodes().length === 0;
    };
    this._onTrailingSlotChange = () => {
      const hasSlotted = this._trailingSlot.assignedNodes().length > 0;
      const hasDetail = !this._valueEl.hidden;
      this._trailing.hidden = !hasSlotted && !hasDetail;
    };
    this._leadingSlot.addEventListener('slotchange', this._onLeadingSlotChange);
    this._trailingSlot.addEventListener('slotchange', this._onTrailingSlotChange);
    this._onLeadingSlotChange();
    this._onTrailingSlotChange();

    // Forward clicks as glk-click — only for interactive items.
    this._onClick = () => {
      if (this.getBoolAttr('interactive')) {
        this.emit('glk-click');
      }
    };
    this._item.addEventListener('click', this._onClick);
  }

  teardownEvents() {
    this._leadingSlot?.removeEventListener('slotchange', this._onLeadingSlotChange);
    this._trailingSlot?.removeEventListener('slotchange', this._onTrailingSlotChange);
    this._item?.removeEventListener('click', this._onClick);
  }

  onAttributeChanged(name) {
    if (!this._item) return;
    switch (name) {
      case 'title':
        this._titleEl.textContent = this.getAttribute('title') || '';
        break;
      case 'subtitle': {
        const value = this.getAttribute('subtitle') || '';
        this._subtitleEl.textContent = value;
        this._subtitleEl.hidden = !value;
        break;
      }
      case 'interactive':
        this._item.classList.toggle('glass-list__item--interactive', this.getBoolAttr('interactive'));
        break;
      case 'center':
        this._item.classList.toggle('glass-list__item--center', this.getBoolAttr('center'));
        break;
      case 'leading-lg':
        this._leading.classList.toggle('glass-list__leading--lg', this.getBoolAttr('leading-lg'));
        break;
      case 'wrap':
        this._subtitleEl.classList.toggle('glass-list__subtitle--wrap', this.getBoolAttr('wrap'));
        break;
      case 'detail': {
        const detail = this.getAttribute('detail') || '';
        this._valueEl.textContent = detail;
        this._valueEl.hidden = !detail;
        // Re-evaluate trailing visibility.
        if (this._onTrailingSlotChange) this._onTrailingSlotChange();
        break;
      }
      case 'variant': {
        // Remove previous variant, add new one.
        VARIANTS.forEach(v => this._item.classList.remove(`glass-list__item--${v}`));
        const variant = this.getAttribute('variant');
        if (variant && VARIANTS.includes(variant)) {
          this._item.classList.add(`glass-list__item--${variant}`);
        }
        break;
      }
      case 'data-last':
        // Handled purely via CSS :host([data-last]) — no JS needed here,
        // but observing it makes sure the shadow re-evaluates the rule.
        break;
    }
  }

  get interactive() { return this.getBoolAttr('interactive'); }
  set interactive(v) { this.setBoolAttr('interactive', v); }

  get center() { return this.getBoolAttr('center'); }
  set center(v) { this.setBoolAttr('center', v); }

  get leadingLg() { return this.getBoolAttr('leading-lg'); }
  set leadingLg(v) { this.setBoolAttr('leading-lg', v); }

  get wrap() { return this.getBoolAttr('wrap'); }
  set wrap(v) { this.setBoolAttr('wrap', v); }

  get detail() { return this.getAttribute('detail') || ''; }
  set detail(v) {
    if (v) this.setAttribute('detail', v);
    else this.removeAttribute('detail');
  }

  get variant() { return this.getAttribute('variant') || ''; }
  set variant(v) {
    if (v && VARIANTS.includes(v)) this.setAttribute('variant', v);
    else this.removeAttribute('variant');
  }
}

customElements.define('glk-list-item', GlkListItem);
export { GlkListItem };
