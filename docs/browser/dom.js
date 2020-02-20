export {
  createElement,
  createFragment,
  elementFactory,
  getStyle,
  purge,
  select,
  setStyle,
  toFragment,
};

import { callOrNothingAtAll } from '../utilities.js';

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

/**
 * @param {array} selector
 * @param {Node} [contextNode=document]
 * @returns {Array}
 */
const select = (selector, contextNode = document) =>
  from(contextNode.querySelectorAll(selector));

/**
 * @param {HTMLElement} element
 * @returns {Object}
 */
function getStyle(element) {
  const style = window.getComputedStyle(element);

  return style;
}

//#endregion

//#region set

/**
 * @param {Node} from
 * @param {Node} to
 */
function transfer(source, target) {
  while (source.firstChild) {
    target.appendChild(source.firstChild);
  }
}

/**
 * @param {string} htmlLiteral
 * @returns {DocumentFragment}
 */
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

/**
 *
 * @param {HTMLElement} element
 * @param {Object} style
 */
function setStyle(element, style) {
  element.style.cssText = getCssText(style);

  return element;
}

function setBooleanAttribute(element, name) {
  element.setAttribute(name, '');

  return element;
}

function setAttribute(element, name, value) {
  if (typeof value === 'boolean') {
    callOrNothingAtAll(value, [
      setBooleanAttribute, [
        element,
        name,
      ],
    ]);
  } else if (name.startsWith('on')) {
    element[name] = value;
  } else {
    element.setAttribute(name, value);
  }

  return element;
}

/**
 *
 * @param {HTMLElement} element
 * @param {Object} attributes
 * @returns {HTMLElement}
 */
function setAttributes(element, attributes) {
  for (const [key, value] of entries(attributes)) {
    setAttribute(element, key, value);
  }

  return element;
}

/**
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
function purge(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }

  return element;
}

/**
 * @param {HTMLElement} element
 * @param {string|number|Node} node
 * @returns {HTMLElement}
 */
function appendNode(element, node) {
  if (/^(?:number|string)$/.test(typeof node)) {
    element.appendChild(document.createTextNode(node));
  } else {
    element.appendChild(node);
  }

  return element;
}

/**
 *
 * @param {HTMLElement} element
 * @param {Array} children
 * @returns {HTMLElement}
 */
const appendFragment = (element, children) =>
  children
    .reduce(
      appendNode,
      element
    );

/**
 *
 * @param {HTMLElement} element
 * @param {Array|Node} children
 */
function append(element, children) {
  if (isArray(children)) {
    return appendFragment(element, children);
  }

  return appendNode(element, children);
}

/**
 * @param {Array} nodeArray
 * @returns {DocumentFragment}
 */
const createFragment = nodeArray =>
  nodeArray
    .reduce(
      append,
      document.createDocumentFragment()
    );

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

/**
 * @param {...*} argumentList
 * @returns {HTMLElement}
 */
const createElement = (...argumentList) =>
  arity[argumentList.length](...argumentList);

/**
 * @param {Array} types
 * @returns {Object}
 */
const elementFactory = types =>
  fromEntries(types
    .map(type => [
      type,
      (...argumentList) =>
        createElement(type, ...argumentList),
    ]));

//#endregion
