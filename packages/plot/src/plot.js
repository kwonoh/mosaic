import { distinct, Synchronizer } from '@uwdata/mosaic-core';
import { plotRenderer } from './plot-renderer.js';

const DEFAULT_ATTRIBUTES = {
  width: 640,
  marginLeft: 40,
  marginRight: 20,
  marginTop: 20,
  marginBottom: 30
};

export class Plot {
  /**
   * @param {HTMLElement} [element]
   */
  constructor(element) {
    /** @type {Record<string, any>} */
    this.attributes = { ...DEFAULT_ATTRIBUTES };
    this.listeners = null;
    this.interactors = [];
    /** @type {{ legend: import('./legend.js').Legend, include: boolean }[]} */
    this.legends = [];
    /** @type {import('./marks/Mark.js').Mark[]} */
    this.marks = [];
    /** @type {Set<import('./marks/Mark.js').Mark> | null} */
    this.markset = null;
    /** @type {Map<import('@uwdata/mosaic-core').Param, import('./marks/Mark.js').Mark[]>} */
    this.params = new Map;
    /** @type {Synchronizer} */
    this.synch = new Synchronizer();

    /** @type {HTMLElement} */
    this.element = element || document.createElement('div');
    this.element.setAttribute('class', 'plot');
    this.element.style.display = 'flex';
    Object.assign(this.element, { value: this });
  }

  margins() {
    return {
      left: this.getAttribute('marginLeft'),
      top: this.getAttribute('marginTop'),
      bottom: this.getAttribute('marginBottom'),
      right: this.getAttribute('marginRight')
    };
  }

  innerWidth() {
    const { left, right } = this.margins();
    return this.getAttribute('width') - left - right;
  }

  innerHeight(defaultValue = 400) {
    const { top, bottom } = this.margins();
    let h = this.getAttribute('height');
    if (h == null) {
      // TODO could apply more nuanced logic here?
      h = maybeAspectRatio(this, top, bottom) || defaultValue;
      this.setAttribute('height', h, { silent: true });
    }
    return h - top - bottom;
  }

  pending(mark) {
    this.synch.pending(mark);
  }

  update(mark) {
    if (this.synch.ready(mark) && !this.pendingRender) {
      this.pendingRender = true;
      requestAnimationFrame(() => this.render());
    }
    return this.synch.promise;
  }

  async render() {
    this.pendingRender = false;
    const svg = await plotRenderer(this);
    const legends = this.legends.flatMap(({ legend, include }) => {
      const el = legend.init(svg);
      return include ? el : [];
    });
    this.element.replaceChildren(svg, ...legends);
    this.synch.resolve();
  }

  /**
   * @param {string} name The attribute to return.
   * @returns {*} The value of the attribute.
   */
  getAttribute(name) {
    return this.attributes[name];
  }

  /**
   * @param {string} name The name of the attribute to set.
   * @param {*} value The value to set.
   * @param {{silent: boolean}} [options] Options for setting the attribute.
   * @returns {boolean} whether the value changed.
   */
  setAttribute(name, value, options) {
    if (distinct(this.attributes[name], value)) {
      if (value === undefined) {
        delete this.attributes[name];
      } else {
        this.attributes[name] = value;
      }
      if (!options?.silent) {
        this.listeners?.get(name)?.forEach(cb => cb(name, value));
      }
      return true;
    }
    return false;
  }

  /**
   * @param {string} name The attribute name.
   * @param {*} callback The function to call when the attribute changes.
   * @returns {this}
   */
  addAttributeListener(name, callback) {
    const map = this.listeners || (this.listeners = new Map);
    if (!map.has(name)) map.set(name, new Set);
    map.get(name).add(callback);
    return this;
  }

  /**
   * @param {string} name The attribute name.
   * @param {*} callback The function to call when the attribute changes.
   * @returns {void}
   */
  removeAttributeListener(name, callback) {
    return this.listeners?.get(name)?.delete(callback);
  }

  addParams(mark, paramSet) {
    const { params } = this;
    for (const param of paramSet) {
      if (params.has(param)) {
        params.get(param).push(mark);
      } else {
        params.set(param, [mark]);
        param.addEventListener('value', () => {
          return Promise.allSettled(
            params.get(param).map(mark => mark.initialize())
          );
        });
      }
    }
  }

  addMark(mark) {
    mark.setPlot(this, this.marks.length);
    this.marks.push(mark);
    this.markset = null;
    return this;
  }

  get markSet() {
    return this.markset || (this.markset = new Set(this.marks));
  }

  addInteractor(sel) {
    this.interactors.push(sel);
    return this;
  }

  addLegend(legend, include = true) {
    legend.setPlot(this);
    this.legends.push({ legend, include });
  }
}

function maybeAspectRatio(plot, top, bottom) {
  const ar = plot.getAttribute('aspectRatio');
  if (ar == null) return;
  const x = plot.getAttribute('xDomain');
  const y = plot.getAttribute('yDomain');
  if (!x || !y) return;
  const dx = Math.abs(x[1] - x[0]);
  const dy = Math.abs(y[1] - y[0]);
  return dy * plot.innerWidth() / (ar * dx) + top + bottom;
}
