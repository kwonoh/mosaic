/**
 * Return the bound datum value on a Plot-generated SVG element.
 * Following D3, bound data is assigned to the `__data__` property.
 * However, the target mark may be wrapped within a hyperlink `a` tag.
 * @param {SVGElement} el An SVG element.
 * @returns {*} The bound datum.
 */
export function getDatum(el) {
  if (el.tagName === 'a') {
    el = el.children[0];
  }
  const data = el.__data__;
  return Array.isArray(data) ? data[0] : data;
}