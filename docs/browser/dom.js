/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export {
  append,
  createTextNode,
  createElement,
  createFragment,
  elementFactory,
  getStyle,
  prepend,
  purge,
  replaceNode,
  select,
  setAttribute,
  setStyle,
  toFragment,
};

/* global window document */

const { from, isArray } = Array;
const {
  entries,
  fromEntries,
  prototype: {
    toString,
  },
} = Object;

//#region get

const select = (selector, contextNode = document) =>
  from(contextNode.querySelectorAll(selector));

function getStyle(element) {
  const style = window.getComputedStyle(element);

  return style;
}

//#endregion

//#region set

function transfer(source, target) {
  while (source.firstChild) {
    target.appendChild(source.firstChild);
  }
}

function toFragment(htmlLiteral) {
  const clipboard = document.createElement('DIV');
  const fragment = document.createDocumentFragment();

  clipboard.innerHTML = htmlLiteral;
  transfer(clipboard, fragment);

  return fragment;
}

function getCssText(style) {
  if (style) {
    return entries(style)
      .filter(([, value]) => value)
      .map(pair => pair.join(':'))
      .join(';');
  }

  return '';
}

function setStyle(element, style) {
  element.style.cssText = getCssText(style);

  return element;
}

function setBooleanAttribute(element, name, value) {
  if (value) {
    element.setAttribute(name, '');
  } else {
    element.removeAttribute(name);
  }
}

function setAttribute(element, name, value) {
  if (typeof value === 'boolean') {
    setBooleanAttribute(element, name, value);
  } else if (name.startsWith('on')) {
    element[name] = value;
  } else {
    element.setAttribute(name, value);
  }

  return element;
}

function setAttributes(element, attributes) {
  for (const [key, value] of entries(attributes)) {
    setAttribute(element, key, value);
  }

  return element;
}

function purge(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  return element;
}

function asNode(value) {
  if (/^(?:number|string)$/.test(typeof value)) {
    return document.createTextNode(value);
  }

  return value;
}

function appendNode(element, children) {
  element.appendChild(asNode(children));

  return element;
}

function prependNode(element, children) {
  element.insertBefore(asNode(children), element.firstChild);

  return element;
}

function append(element, children) {
  const node = isArray(children) ?
    createFragment(children) :
    children;

  return appendNode(element, node);
}

function prepend(element, children) {
  const node = isArray(children) ?
    createFragment(children) :
    children;

  return prependNode(element, node);
}

const replaceNode = (previous, next) =>
  previous
    .parentNode
    .replaceChild(next, previous);

const createFragment = nodeArray =>
  nodeArray
    .reduce(
      append,
      document.createDocumentFragment()
    );

const createTextNode = stringLiteral =>
  document.createTextNode(stringLiteral);

const getMixedArityIndex = value =>
  Number(toString.call(value) === '[object Object]');

const plainElement = type =>
  document.createElement(type);

const withAttributesOrChildren = (type, value) =>
  mixedArity[getMixedArityIndex(value)](plainElement(type), value);

const withAttributesAndChildren = (type, attributes, children) =>
  append(setAttributes(plainElement(type), attributes), children);

const mixedArity = [
  append,
  setAttributes,
];

const arity = [
  undefined,
  plainElement,
  withAttributesOrChildren,
  withAttributesAndChildren,
];

const createElement = (...argumentList) =>
  arity[argumentList.length](...argumentList);

const elementFactory = types =>
  fromEntries(types
    .map(type => [
      type,
      (...argumentList) =>
        createElement(type, ...argumentList),
    ]));

//#endregion
