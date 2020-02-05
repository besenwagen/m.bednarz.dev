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

import { load } from '../test-io.js';
import {
  createElement,
  createFragment,
  elementFactory,
  purge,
} from './dom.js';

/* global window, document */
/* eslint id-length: [error, { exceptions: [a, p] }] */

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
main {
  --color-action: #00f;
  border: 1px solid #333;
  padding: 1.5em 3em;
  color: #333;
  background: #fff;
  font: 1rem/1.5 Georgia, serif;
}

pre,
code {
  font: 1rem/1.5 Consolas, Inconsolata, Menlo, Monaco, monospace;
}

main h1 {
  margin: 0;
  border-bottom: 1px solid #000;
  padding: 0.75rem 0;
  font-weight: normal;
  font-size: 1.5rem;
}

main ol {
  margin: 0.75rem 0;
  padding: 0;
}

main li > ol {
  margin-top: 0rem;
  margin-left: 2em;
}

main ol a em {
  font-weight: bold;
  font-style: normal;
}

main ol em {
  color: #060;
  background: transparent;
}

main ul em {
  color: #000;
  background: transparent;
  font-style: normal;
}

main ol a strong,
main li li strong {
  color: #a00;
  background: transparent;
}

table {

  margin: 0.5rem 0;
  border-collapse: collapse;
}

th {
  text-align: right;
  font-weight: normal;
}

th, td {
  border: 1px solid #000;
  padding: 0.1rem 0.75rem;
  vertical-align: top;
}

td pre {
  margin: 0;
}

a[href] {
  border-bottom: 1px solid #090;
  color: var(--color-action);
  background: transparent;
  text-decoration: none;
}

a[href]:hover {
  border-color: var(--color-action);
  border-width: 2px;
  color: #000;
  background: transparent;
}

a[href]:focus {
  outline: 2px solid var(--color-action);
  outline-offset: 0.2rem;
  border-color: transparent;
  color: #000;
  background: transparent;
}
`;

//#region DOM write

/**
 * @param {Array} tuple
 * @returns {string}
 */
function summary([modules, tests, errors]) {
  if (errors) {
    return [
      `${errors} of ${tests} tests`,
      `failing in ${modules} modules.`,
    ].join(' ');
  }

  return `${tests} tests in ${modules} modules.`;
}

/**
 * @param {boolean} state
 * @returns {string}
 */
const statePrefix = state => (state ? PASS : FAIL);

/**
 * @param {boolean} state
 * @returns {string}
 */
const stateMarker = state => (state ? 'em' : 'strong');

/**
 * @param {string} url
 * @returns {string}
 */
const displayUrl = url =>
  url.replace(/^\//, '');

const {
  h1, p, ol, li, a,
  table, tr, th, td,
  code, pre,
} = elementFactory([
  'h1', 'p', 'ol', 'li',
  'table', 'tr', 'th', 'td',
  'a', 'pre', 'code',
]);

const markState = (state, children) =>
  createElement(stateMarker(state), children);

const assertionTable = (testResult, [actual, expected]) =>
  table([
    tr([
      th({
        scope: 'row',
      }, 'actual'),
      td(code(typeof actual)),
      td(pre(code(markState(testResult, String(actual))))),
    ]),
    tr([
      th({
        scope: 'row',
      }, 'expected'),
      td(code(typeof expected)),
      td(pre(code(String(expected)))),
    ]),
  ]);

const toListItem = ([description, testResult, assertion]) =>
  li([
    code(`[${statePrefix(testResult)}]`),
    ' ',
    markState(testResult, description),
    assertionTable(testResult, assertion),
  ]);

const toSuiteItem = ([href, suite, [, errors]]) =>
  li([
    a({
      href,
      target: '_blank',
    }, markState(!errors, displayUrl(href))),
    ol(suite.map(toListItem)),
  ]);

/**
 * @param {Node} contextNode
 * @param {string} literal
 */
function html(contextNode, children) {
  purge(contextNode).appendChild(children);
}

/**
 * @param {Node} node
 * @param {string} basePath
 * @returns {function}
 */
function writeFactory(node, basePath) {
  /**
   * @param {Array} tuple
   */
  function write([result, stats]) {
    const resultList = result
      .map(([href, ...tail]) => [
        [basePath, href].join(''),
        ...tail,
      ])
      .map(toSuiteItem);

    html(node, createFragment([
      h1(REPORT_LABEL),
      p(summary(stats)),
      ol(resultList),
    ]));
  }

  html(node, p(STATUS_BUSY));

  return write;
}

//#endregion

//#region DOM getters

/**
 * @param {string} selector
 * @param {Node} [contextNode = document]
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
 * @param {string} basePath
 * @returns {Array}
 */
function prioritize(element, basePath) {
  const query = getQuery();

  if (query) {
    return [resolve(query, basePath)];
  }

  return parseMicroData(element, basePath);
}

//#endregion

//#region initialize

function setStyle() {
  const styleElement = createElement('style', style);

  document.head.appendChild(styleElement);
}

/**
 * @param {Node} node
 * @param {string} basePath
 * @returns {Promise}
 */
function overload(node, basePath) {
  const modules = prioritize(node, basePath);
  const write = writeFactory(node, basePath);

  return load(modules)
    .then(write);
}

/**
 * Write the report HTML into the document's MAIN element.
 * @returns {Promise<undefined>}
 */
function run() {
  const [node] = select(TEST_REPORT_SELECTOR);
  const basePath = getBasePath(node);

  setStyle();

  return overload(node, basePath);
}

const report = run();

//#endregion
