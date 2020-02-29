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

function appendNode(element, node) {
  if (/^(?:number|string)$/.test(typeof node)) {
    element.appendChild(document.createTextNode(node));
  } else {
    element.appendChild(node);
  }

  return element;
}

const appendFragment = (element, children) =>
  children
    .reduce(
      appendNode,
      element
    );

function append(element, children) {
  if (isArray(children)) {
    return appendFragment(element, children);
  }

  return appendNode(element, children);
}

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
