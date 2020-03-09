/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  createElement,
  namespace,
  useSymbol,
};

/* global document */

const { entries } = Object;
const namespace = 'http://www.w3.org/2000/svg';

function createElement(type, attributes = {}) {
  const element = document.createElementNS(namespace, type);

  for (const [key, value] of entries(attributes)) {
    element.setAttribute(key, String(value));
  }

  return element;
}

function useSymbol(id) {
  const svgElement = createElement('svg');
  const useElement = createElement('use', {
    href: `#${id}`,
  });

  svgElement.appendChild(useElement);

  return svgElement;
}
