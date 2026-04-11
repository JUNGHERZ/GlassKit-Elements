import { GlkElement } from '../../base.js';

// Module-level override sheet — shared by all instances.
// Suppresses the auto-divider when glk-list marks this item as the
// last-of-type via [data-last]. The default divider is rendered by
// glasskit.css thanks to the sentinel sibling in the shadow tree.
const lastChildOverrideSheet = new CSSStyleSheet();
lastChildOverrideSheet.replaceSync(`
  :host([data-last]) .glass-list__item::after { content: none; }
`);

class GlkListItem extends GlkElement {
  static get observedAttributes() {
    return ['title', 'subtitle', 'interactive', 'center', 'data-last'];
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

    // Leading slot — hidden until a child with slot="leading" appears.
    this._leading = this.createElement('span', ['glass-list__leading']);
    this._leadingSlot = document.createElement('slot');
    this._leadingSlot.setAttribute('name', 'leading');
    this._leading.appendChild(this._leadingSlot);
    this._leading.hidden = true;

    // Content — title + optional subtitle.
    this._content = this.createElement('div', ['glass-list__content']);
    this._titleEl = this.createElement('div', ['glass-list__title']);
    this._titleEl.textContent = this.getAttribute('title') || '';
    this._subtitleEl = this.createElement('div', ['glass-list__subtitle']);
    const initialSubtitle = this.getAttribute('subtitle') || '';
    this._subtitleEl.textContent = initialSubtitle;
    this._subtitleEl.hidden = !initialSubtitle;
    this._content.appendChild(this._titleEl);
    this._content.appendChild(this._subtitleEl);

    // Trailing slot — hidden until a child with slot="trailing" appears.
    this._trailing = this.createElement('div', ['glass-list__trailing']);
    this._trailingSlot = document.createElement('slot');
    this._trailingSlot.setAttribute('name', 'trailing');
    this._trailing.appendChild(this._trailingSlot);
    this._trailing.hidden = true;

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
      this._trailing.hidden = this._trailingSlot.assignedNodes().length === 0;
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
}

customElements.define('glk-list-item', GlkListItem);
export { GlkListItem };
