/**
 * Copyright 2019, 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
export {
  create_element,
  namespace,
  use_symbol,
};

/* global document */

const { entries } = Object;
const namespace = 'http://www.w3.org/2000/svg';

function create_element(type, attributes = {}) {
  const element = document.createElementNS(namespace, type);

  for (const [key, value] of entries(attributes)) {
    element.setAttribute(key, String(value));
  }

  return element;
}

function use_symbol(id) {
  const svg_element = create_element('svg');
  const use_element = create_element('use', {
    href: `#${id}`,
  });

  svg_element.appendChild(use_element);

  return svg_element;
}
