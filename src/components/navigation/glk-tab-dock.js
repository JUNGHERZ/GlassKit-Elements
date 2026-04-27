import { GlkElement } from '../../base.js';

class GlkTabDock extends GlkElement {
  static get observedAttributes() {
    return ['accessory-left', 'static'];
  }

  render() {
    this._dock = this.createElement('div', ['glass-tab-bar-dock']);
    if (this.getBoolAttr('accessory-left')) {
      this._dock.classList.add('glass-tab-bar-dock--accessory-left');
    }
    this._dock.appendChild(document.createElement('slot'));
    this._wrapper.appendChild(this._dock);

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
    }
  }

  _applyStatic() {
    if (this.getBoolAttr('static')) {
      this._dock.style.position = 'relative';
      this._dock.style.left = 'auto';
      this._dock.style.bottom = 'auto';
      this._dock.style.transform = 'none';
      this._dock.style.justifyContent = 'center';
    } else {
      this._dock.style.position = '';
      this._dock.style.left = '';
      this._dock.style.bottom = '';
      this._dock.style.transform = '';
      this._dock.style.justifyContent = '';
    }
  }
}

customElements.define('glk-tab-dock', GlkTabDock);
export { GlkTabDock };
