export {
  select,
  setStyle,
  toFragment,
};

/* global document */

const { from } = Array;
const { entries } = Object;

/**
 * @param {array} selector
 * @param {Node} [contextNode=document]
 * @returns {Array}
 */
const select = (selector, contextNode = document) =>
  from(contextNode.querySelectorAll(selector));

/**
 *
 * @param {HTMLElement} element
 * @param {Object} style
 */
function setStyle(element, style) {
  element.style.cssText = entries(style)
    .map(pair => pair.join(':'))
    .join(';');

  return element;
}

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
