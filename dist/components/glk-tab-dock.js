import { GlkElement } from './base.js';
import '@jungherz-de/glasskit/glasskit-styles.js';

// The floating bar with its accessory, at the bottom edge — or since 1.32.0
// upright at a side: orientation="vertical" stacks the bar and the accessory
// and docks them at the end edge (dock="start" for the other), clear of
// that edge's safe area and vertically centred. The bar inside takes
// orientation="vertical" as well. accessory-left puts the accessory first:
// left in a row, at the top in a column.

const DOCKS = ['start', 'end'];

class GlkTabDock extends GlkElement {
  static get observedAttributes() {
    return ['accessory-left', 'static', 'orientation', 'dock'];
  }

  render() {
    this._dock = this.createElement('div', ['glass-tab-bar-dock']);
    if (this.getBoolAttr('accessory-left')) {
      this._dock.classList.add('glass-tab-bar-dock--accessory-left');
    }
    this._dock.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._dock);
    this._applyOrientation();

    if (this.getBoolAttr('static')) {
      this._applyStatic();
    }
  }

  onAttributeChanged(name) {
    if (!this._dock) return;
    if (name === 'accessory-left') {
      this._dock.classList.toggle(
        'glass-tab-bar-dock--accessory-left',
        this.getBoolAttr('accessory-left')
      );
    } else if (name === 'static') {
      this._applyStatic();
    } else {
      this._applyOrientation();
      this._applyStatic();
    }
  }

  _applyOrientation() {
    const vertical = this.getAttribute('orientation') === 'vertical';
    this._dock.classList.toggle('glass-tab-bar-dock--vertical', vertical);
    this._dock.classList.toggle('glass-tab-bar-dock--start', vertical && this.getAttribute('dock') === 'start');
    this._dock.classList.toggle('glass-tab-bar-dock--end', vertical && this.getAttribute('dock') !== 'start');
  }

  _applyStatic() {
    if (this.getBoolAttr('static')) {
      this._dock.style.position = 'relative';
      this._dock.style.left = 'auto';
      this._dock.style.right = 'auto';
      this._dock.style.top = 'auto';
      this._dock.style.bottom = 'auto';
      this._dock.style.transform = 'none';
      this._dock.style.justifyContent = 'center';
    } else {
      for (const k of ['position', 'left', 'right', 'top', 'bottom', 'transform', 'justifyContent']) this._dock.style[k] = '';
    }
  }

  get orientation() { return this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'horizontal'; }
  set orientation(v) {
    if (v === 'vertical') this.setAttribute('orientation', 'vertical');
    else this.removeAttribute('orientation');
  }

  get dock() { return this.getAttribute('dock') === 'start' ? 'start' : 'end'; }
  set dock(v) {
    if (DOCKS.includes(v)) this.setAttribute('dock', v);
    else this.removeAttribute('dock');
  }
}

customElements.define('glk-tab-dock', GlkTabDock);

export { GlkTabDock };
