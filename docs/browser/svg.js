export {
  createElement,
  namespace,
  useSymbol,
};

/* global document */

const { entries } = Object;

const namespace = 'http://www.w3.org/2000/svg';

/**
 * @param {string} type
 * @param {object} attributes
 * @returns {SVGElement}
 */
function createElement(type, attributes = {}) {
  const element = document.createElementNS(namespace, type);

  for (const [key, value] of entries(attributes)) {
    element.setAttribute(key, String(value));
  }

  return element;
}

/**
 * @param {string} id
 * @returns {SVGSVGElement}
 */
function useSymbol(id) {
  const svgElement = createElement('svg');
  const useElement = createElement('use', {
    href: `#${id}`,
  });

  svgElement.appendChild(useElement);

  return svgElement;
}
