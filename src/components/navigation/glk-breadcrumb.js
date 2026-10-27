import { GlkElement } from '../../base.js';

// One level of <glk-breadcrumbs> (since 1.32.0): its text, href (a link) or
// value (a button), current for the level shown. It renders nothing of its
// own; the breadcrumbs draw the path from their crumbs.

const sheet = new CSSStyleSheet();
sheet.replaceSync(`:host { display: none; }`);

class GlkBreadcrumb extends GlkElement {
  static get hostStyles() { return sheet; }

  get label() { return this.textContent.replace(/\s+/g, ' ').trim(); }

  get href() { return this.getAttribute('href') || ''; }
  set href(v) {
    if (v) this.setAttribute('href', v);
    else this.removeAttribute('href');
  }

  get value() { return this.getAttribute('value') ?? this.label; }
  set value(v) { this.setAttribute('value', v); }

  get current() { return this.getBoolAttr('current'); }
  set current(v) { this.setBoolAttr('current', v); }
}

customElements.define('glk-breadcrumb', GlkBreadcrumb);
export { GlkBreadcrumb };
