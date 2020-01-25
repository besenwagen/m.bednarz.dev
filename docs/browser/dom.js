export {
  select,
  toFragment,
};

/* global document */

const { from } = Array;

/**
 * @param {array} selector
 * @param {Node} [contextNode=document]
 * @returns {array}
 */
const select = (selector, contextNode = document) =>
  from(contextNode.querySelectorAll(selector));

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
