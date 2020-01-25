/**
 * HTML reporter for https://m.bednarz.dev/test.js
 *
 * See https://m.bednarz.dev/test/
 *
 * (c) 2020 Eric Bednarz
 * License: MIT
 */
export {
  report,
};

/* global window, document */

import { load } from '../test.js';

const { from } = Array;
const PATH_COMPONENT_EXPRESSION = /[^/]+$/;
const QUERY_EXPRESSION = /(?:\?|&)m=([^&]+)(?:&|$)/i;
const TEST_FILE_POSTFIX = '.test.js';
const TEST_REPORT_SELECTOR = 'main[itemscope]';
const TEST_PATH_SELECTOR = ':scope > meta[itemprop="path"]';
const TEST_DATA_SELECTOR = ':scope > meta[itemprop="test"]';
const STATUS_BUSY = 'Running tests...';
const REPORT_LABEL = 'Unit test report';
const PASS = 'passed';
const FAIL = 'failed';

const style = `
body {
  margin: 0;
  padding: 2em;
  color: #000;
  background: #eee;
}

main {
  border: 1px solid #333;
  padding: 1.5em 3em;
  color: #333;
  background: #fff;
  font: 1rem/1.5 sans-serif;
}

main code {
  font: 0.9rem/1.5 Consolas, Inconsolata, Menlo, Monaco, monospace;
}

main h1 {
  margin: 0;
  border-bottom: 1px solid #000;
  padding: 0.75rem 0;
  font-size: 1.5rem;
}

main ol {
  margin: 0.75rem 0;
  padding: 0;
}

main li > ol {
  margin-top: 0;
  margin-left: 2em;
}

main li em {
  color: #090;
  background: transparent;
}

main li li strong {
  color: #f00;
  background: transparent;
}
`;

//== DOM setters ===============================================

/**
 * @param {string} content
 * @returns {string}
 */
const heading = content =>
  `<h1>${content}</h1>`;

/**
 * @param {string} content
 * @returns {string}
 */
const paragraph = content =>
  `<p>${content}</p>`;

/**
 * @param {Array} items
 * @returns {string}
 */
const orderedList = items =>
  `<ol>${items.join('')}</ol>`;

const listItem = content =>
  `<li>${content}</li>`;

/**
 * @param {string} content
 * @returns {string}
 */
const strong = content =>
  `<strong>${content}</strong>`;

/**
 * @param {string} content
 * @returns {string}
 */
const code = content =>
  `<code>${content}</code>`;

const sourceLink = url =>
  `<a target="_blank" href="${url}">${url}</a>`;

/**
 * @param {boolean} result
 * @returns {string}
 */
const prefix = result => (result ? PASS : FAIL);

/**
 * @param {string} label
 * @param {boolean} result
 * @returns {string}
 */
function markResult(label, result) {
  const genericIdentifier = result ? 'em' : 'strong';

  return `<${genericIdentifier}>${label}</${genericIdentifier}>`;
}

/**
 * @param {string[]}
 * @returns {string}
 */
const tupleToItem = ([description, result]) =>
  listItem([
    code(`[${prefix(result)}]`),
    markResult(description, result),
  ].join(' '));

/**
 * @param
 * @return
 */
const parse = ([subject, suite]) => [
  strong(sourceLink(subject)),
  orderedList(suite.map(tupleToItem)),
].join(' ');

function summary([modules, tests, errors]) {
  if (errors) {
    return paragraph([
      `${errors} of ${tests} tests`,
      `failing in ${modules} modules.`,
    ].join(' '));
  }

  return paragraph(`${tests} tests in ${modules} modules.`);
}

/**
 * @param {Object} result
 * @returns {string}
 */
function toHtml(result) {
  const toListItem = part => listItem(parse(part));
  const data = result.map(toListItem);

  return orderedList(data);
}

/**
 * @param {Node} contextNode
 * @param {string} literal
 */
function html(contextNode, literal) {
  contextNode.innerHTML = literal;
}

/**
 * @param {Node} node
 * @returns {function}
 */
function mangle(node) {
  /**
   * @param {Array} result
   */
  function write([result, stats]) {
    html(node, [
      heading(REPORT_LABEL),
      summary(stats),
      toHtml(result),
    ].join(' '));
  }

  html(node, STATUS_BUSY);

  return write;
}

//== Data handlers =========================================

/**
 * @param {string} selector
 * @param {Node} contextNode
 * @returns {Array}
 */
const select = (selector, contextNode = document) =>
  from(contextNode.querySelectorAll(selector));

/**
 * @param {...string} argumentList
 * @returns {string}
 */
const join = (...argumentList) =>
  argumentList.join('');

/**
 *
 * @param {HTMLELement} element
 */
const getMicroDataContent = ({ content }) => content;

/**
 * @returns {string}
 */
function getDocumentPath() {
  const { pathname } = window.location;
  const basePath = pathname.replace(PATH_COMPONENT_EXPRESSION, '');

  return basePath;
}

/**
 *
 * @param {HTMLElement} contextElement
 * @returns {string}
 */
function getBasePath(contextElement) {
  const [element] = select(TEST_PATH_SELECTOR, contextElement);

  if (element) {
    return getMicroDataContent(element);
  }

  return getDocumentPath();
}

/**
 * @param {string} baseName
 * @param {string} basePath
 * @returns {string}
 */
const resolve = (baseName, basePath) =>
  join(basePath, baseName, TEST_FILE_POSTFIX);

/**
 * Get an array of modules.
 * @param {HTMLELement} contextElement
 * @param {string} basePath
 * @returns {string[]}
 */
const parseMicroData = (contextElement, basePath) =>
  select(TEST_DATA_SELECTOR, contextElement)
    .map(getMicroDataContent)
    .map(baseName => resolve(baseName, basePath));

/**
 * @returns {Array|null}
 */
function matchQuery() {
  const { search } = window.location;

  return QUERY_EXPRESSION.exec(search);
}

/**
 * @returns {string}
 */
function getQuery() {
  const match = matchQuery();

  if (match) {
    const [, backReference] = match;

    return backReference;
  }

  return '';
}

/**
 * Get the modules from the query string or micro data.
 * @param {HTMLElement} element
 * @returns {Array}
 */
function prioritize(element) {
  const basePath = getBasePath(element);
  const query = getQuery();

  if (query) {
    return [resolve(query, basePath)];
  }

  return parseMicroData(element, basePath);
}

//== Grand total ===========================================

function setStyle() {
  const styleElement = document.createElement('style');

  styleElement.appendChild(document.createTextNode(style));

  document.head.appendChild(styleElement);
}

/**
 * Write the report HTML into the document's MAIN element.
 * @returns {Promise<undefined>}
 */
function run() {
  const [node] = select(TEST_REPORT_SELECTOR);
  const modules = prioritize(node);
  const write = mangle(node);

  setStyle();

  return load(modules)
    .then(write);
}

const report = run();
