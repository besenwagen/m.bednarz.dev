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

//#region DOM setters

const CLASS_SHOW_TESTS = 'show-tests';
const CLASS_SHOW_ASSERTIONS = 'show-assertions';
const ATTRIBUTE_FAIL = 'data-fail';

//#region CSS literal
const style = `
html {
  overflow-y: scroll;
}

body {
  margin: 0;
  padding: 2em;
  color: #000;
  background: #eee;
}

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

main h1 + div {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

main ol {
  margin: 0.75rem 0;
  padding: 0;
}

main li > ol {
  margin-top: 0rem;
  margin-left: 2em;
}

main a em {
  font-weight: bold;
  font-style: normal;
}

main em {
  color: #060;
  background: transparent;
}

main ul em {
  color: #000;
  background: transparent;
  font-style: normal;
}

main strong,
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

label:hover {
  cursor: pointer;
}

input[type="checkbox"] {
  margin: 0;
  vertical-align: middle;
}

input[type="checkbox"]:focus {
  outline: 2px solid var(--color-action);
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

main:not(.${CLASS_SHOW_TESTS}) ol ol {
  display: none;
}

main:not(.${CLASS_SHOW_ASSERTIONS}) ol table {
  display: none;
}

main ol[${ATTRIBUTE_FAIL}] li:not([${ATTRIBUTE_FAIL}]) ol,
main ol[${ATTRIBUTE_FAIL}] ol li:not([${ATTRIBUTE_FAIL}]) {
  display: none;
}

main.${CLASS_SHOW_TESTS} ol ol {
  display: block ! important;
}

main.${CLASS_SHOW_TESTS} li li {
  display: list-item ! important;
}

main ol li[${ATTRIBUTE_FAIL}] ol {
  display: block;
}

main ol li[${ATTRIBUTE_FAIL}] li[${ATTRIBUTE_FAIL}] table {
  display: table;
}
`;

//#endregion

const STATUS_BUSY = 'Running tests...';
const REPORT_LABEL = 'Unit test report';
const PASS = 'passed';
const FAIL = 'failed';

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
  h1, p, ol, li,
  strong, em, a,
  table, tr, th, td,
  div, code, pre,
  label, input,
} = elementFactory([
  'h1', 'p', 'ol', 'li',
  'strong', 'em', 'a',
  'table', 'tr', 'th', 'td',
  'div', 'code', 'pre',
  'label', 'input',
]);

/**
 * @param {Array} tuple
 * @returns {string}
 */
function summary([modules, tests, errors]) {
  if (errors) {
    return [
      strong(`${errors} of ${tests} tests failing`),
      ` in ${modules} modules.`,
    ];
  }

  return [
    em(`${tests} tests`),
    ` in ${modules} modules.`,
  ];
}

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
  li({
    [ATTRIBUTE_FAIL]: !testResult,
  }, [
    code(`[${statePrefix(testResult)}]`),
    ' ',
    markState(testResult, description),
    assertionTable(testResult, assertion),
  ]);

const toSuiteItem = ([href, suite, [, errors]]) =>
  li({
    [ATTRIBUTE_FAIL]: Boolean(errors),
  }, [
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
function main(contextNode, children) {
  purge(contextNode).appendChild(children);
}

/**
 * @param {HTMLElement} element
 * @returns {boolean}
 */
const isCheckbox = ({ nodeName, type }) => (
  (nodeName === 'INPUT')
  && (type === 'checkbox')
);

/**
 * @param {HTMLElement} node
 * @returns {boolean}
 */
function getStatus(node, stats) {
  const [, , errors] = stats;
  const result = Boolean(errors);

  if (!result) {
    node.classList.add(CLASS_SHOW_TESTS);
  }

  return result;
}

/**
 * @param {HTMLElement} node
 */
function setEvent(node) {
  function onClick({
    target,
  }) {
    if (isCheckbox(target)) {
      node.classList.toggle(`show-${target.name}`);
    }
  }

  node.addEventListener('click', onClick);
}

/**
 * @param {HTMLElement} node
 */
function bootstrap(node) {
  setEvent(node);
  main(node, p(STATUS_BUSY));
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
    const status = getStatus(node, stats);

    main(node, createFragment([
      h1(REPORT_LABEL),
      div([
        p(summary(stats)),
        div([
          'Show all: ',
          label([
            input({
              checked: !status,
              name: 'tests',
              type: 'checkbox',
            }),
            ' ',
            'tests',
          ]),
          ' ',
          label([
            input({
              name: 'assertions',
              type: 'checkbox',
            }),
            ' ',
            'assertions',
          ]),
        ]),
      ]),
      ol({
        [ATTRIBUTE_FAIL]: status,
      }, resultList),
    ]));
  }

  bootstrap(node);

  return write;
}

//#endregion

//#region DOM getters

const TEST_REPORT_SELECTOR = 'main[itemscope]';
const TEST_PATH_SELECTOR = ':scope > meta[itemprop="path"]';
const TEST_DATA_SELECTOR = ':scope > meta[itemprop="test"]';
const PATH_COMPONENT_EXPRESSION = /[^/]+$/;
const QUERY_EXPRESSION = /(?:\?|&)m=([^&]+)(?:&|$)/i;
const TEST_FILE_POSTFIX = '.test.js';

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
