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
const CLASS_SHOW_SOURCE_LINKS = 'show-source-links';
const ATTRIBUTE_FAIL = 'data-fail';

//#region CSS literal

const style = `
html {
  overflow-y: scroll;
}

body {
  margin: 0;
  padding: 0;
}

main {
  --color-action: #00c;
  padding: 0 0 1.5rem 0;
  color: #333;
  background: #fff;
  font: 1rem/1.5 Georgia, serif;
}

main > header > div,
main > div,
main > p {
  padding: 0 1rem 0 4rem;
}

main pre,
main code {
  font: 1rem/1.5 Consolas, Inconsolata, Menlo, Monaco, monospace;
}

main h1 {
  margin: 0;
  border-bottom: 1px solid #000;
  padding: 0.75rem 1rem 0.75rem 4rem;
  font-weight: normal;
  font-size: 1.5rem;
}

main input[type="checkbox"] {
  margin: 0;
  vertical-align: middle;
}

main input[type="checkbox"]:not([disabled]):hover {
  cursor: pointer;
}

main input[type="checkbox"]:focus {
  outline: 2px solid var(--color-action);
}

main section {
  margin: 0.75em 0;
}

main section > h2 {
  margin: 0;
  font-weight: normal;
  font-size: 1em;
}

main.${CLASS_SHOW_TESTS} section > h2,
main.${CLASS_SHOW_SOURCE_LINKS} section > h2,
main.${CLASS_SHOW_TESTS} section > h2 > span:first-child,
main.${CLASS_SHOW_SOURCE_LINKS} section > h2 > span:first-child,
main.${CLASS_SHOW_TESTS} section > h2 > code,
main.${CLASS_SHOW_SOURCE_LINKS} section > h2 > code,
main section[${ATTRIBUTE_FAIL}] h2,
main section[${ATTRIBUTE_FAIL}] h2 > code {
  font-weight: bold;
}

main section > ul {
  margin: 0;
  padding: 0;
}

main section h2 a em {
  font-weight: bold;
}

main section ol {
  list-style: none;
  margin: 0;
  padding: 0;
  font-weight: normal;
}

main h2 > span:first-child,
main li > span:first-child {
  display: inline-block;
  box-sizing: border-box;
  width: 3em;
  margin-left: -3em;
  padding: 0 0.5em 0 0;
  text-align: right;
}

main strong {
  color: #900;
}

main em {
  color: #060;
  background: transparent;
}

main table {
  margin: 0.5rem 0;
  border-collapse: collapse;
}

main th {
  text-align: right;
  font-weight: normal;
}

main th,
main td {
  border: 1px solid #999;
  padding: 0.1rem 0.75rem;
  vertical-align: top;
}

main td pre {
  margin: 0;
}

main td pre code {
  background: #eee;
}

main td pre code strong {
  background: #ff9;
}

main a[href] {
  border-bottom: 1px solid #090;
  color: var(--color-action);
  background: transparent;
  text-decoration: none;
}

main a[href]:hover {
  border-color: var(--color-action);
  border-width: 2px;
  color: #000;
  background: transparent;
}

main a[href]:focus {
  outline: 2px solid var(--color-action);
  outline-offset: 0.2rem;
  border-color: transparent;
  color: #000;
  background: transparent;
}

main:not(.${CLASS_SHOW_TESTS})
  ol:not([${ATTRIBUTE_FAIL}]),
main:not(.${CLASS_SHOW_TESTS})
  ol[${ATTRIBUTE_FAIL}] li:not([${ATTRIBUTE_FAIL}]),
main:not(.${CLASS_SHOW_ASSERTIONS})
  li:not([${ATTRIBUTE_FAIL}]) table,
main:not(.${CLASS_SHOW_SOURCE_LINKS})
  section > h2 + ul
{
  display: none;
}

@media only screen and (min-width: 768px) {
  body {
    display: flex;
    justify-content: center;
  }

  main h1 {
    margin: 0 4rem;
    padding: 0.75rem 0;
  }

  main > header > div {
    padding-right: 4rem;
  }

  main h1 + div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  main h1 + div > p {
    margin-right: 0.5rem;
  }
}
`;

//#endregion

const TEST_TAIL_EXPRESSION = /\.test\.js$/;
const STATUS_BUSY = 'Running tests…';
const REPORT_LABEL = 'Unit test report';
const PASS = 'pass';
const FAIL = 'fail';

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
  header, h1, p, div,
  section, h2, ol, ul, li,
  label, input,
  strong, em, a,
  table, tr, th, td,
  code, pre, span,
} = elementFactory([
  'header', 'h1', 'p', 'div',
  'section', 'h2', 'ol', 'ul', 'li',
  'label', 'input',
  'strong', 'em', 'a',
  'table', 'tr', 'th', 'td',
  'code', 'pre', 'span',
]);

/**
 * @param {Array} tuple
 * @returns {string}
 */
function summary([modules, tests, errors]) {
  if (errors) {
    return [
      strong(`${errors} of ${tests} tests failing`),
      ` in ${modules} test suites.`,
    ];
  }

  return [
    em(`${tests} tests passing`),
    ` in ${modules} test suites.`,
  ];
}

const markState = (state, children) =>
  createElement(stateMarker(state), children);

const assertionTable = (testResult, [
  [typeActual, actual],
  [typeExpected, expected],
]) =>
  table({ class: 'assertion' }, [
    tr([
      th({ scope: 'row' }, 'actual'),
      td(code(typeActual)),
      td(pre(code(markState(testResult, String(actual))))),
    ]),
    tr([
      th({ scope: 'row' }, 'expected'),
      td(code(typeExpected)),
      td(pre(code(String(expected)))),
    ]),
  ]);

function getHref(href) {
  const { pathname, search } = window.location;

  if (href === [pathname, search].join('')) {
    return false;
  }

  return href;
}

const moduleLink = ({ name, href }, testResult) =>
  a({
    href: getHref(href),
  }, markState(testResult, name));

const sourceLink = href => a({
  href,
  target: '_blank',
}, displayUrl(href));

const increment = number => number + Number(true);

const marker = counters =>
  span([
    counters.map(increment).join('.'),
    ' ',
  ]);

const toSuiteItem = ([
  moduleData,
  testUrl,
  moduleUrl,
  suite,
  suiteResult,
], sectionIndex) =>
  section({
    [ATTRIBUTE_FAIL]: !suiteResult,
  }, [
    h2([
      marker([sectionIndex]),
      code(`[${statePrefix(suiteResult)}]`),
      ' ',
      moduleLink(moduleData, suiteResult),
      ` test suite (${suite.length} tests)`,
    ]),
    ul([
      li([
        'test module: ',
        sourceLink(testUrl),
      ]),
      li([
        'module under test: ',
        sourceLink(moduleUrl),
      ]),
    ]),
    ol({
      [ATTRIBUTE_FAIL]: !suiteResult,
    }, suite
      .map(function row([
        description,
        testResult,
        assertion,
      ], listIndex) {
        return li({
          [ATTRIBUTE_FAIL]: !testResult,
        }, [
          marker([sectionIndex, listIndex]),
          code(`[${statePrefix(testResult)}]`),
          ' ',
          markState(testResult, description),
          assertionTable(testResult, assertion),
        ]);
      })
    ),
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

const fromTestUrl = (url, substitute = '') =>
  url
    .replace(TEST_TAIL_EXPRESSION, substitute);

/**
 * @param {string} url
 * @returns {string}
 */
const getSourceUrl = url =>
  fromTestUrl(url, '.js');

function getModuleData(url) {
  const { pathname } = window.location;
  const name = fromTestUrl(url);

  return {
    name,
    href: `${pathname}?m=${name}`,
  };
}

/**
 * @param {Array} result
 * @param {string} basePath
 * @returns {Array}
 */
function getResultList(result, basePath) {
  const resolve = relativePath => [
    basePath,
    relativePath,
  ].join('');
  const toItem = ([testUrl, testSuite, [, errorCount]]) => [
    getModuleData(testUrl),
    resolve(testUrl),
    resolve(getSourceUrl(testUrl)),
    testSuite,
    !errorCount,
  ];

  return result.map(toItem);
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
    const resultList = getResultList(result, basePath)
      .map(toSuiteItem);
    const checked = (resultList.length === Number(true));

    if (checked) {
      node.classList.add(CLASS_SHOW_TESTS);
    }

    main(node, createFragment([
      header([
        h1(REPORT_LABEL),
        div([
          p(summary(stats)),
          div([
            'Show all: ',
            label([
              input({
                checked,
                disabled: checked,
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
            ' ',
            label([
              input({
                name: 'source-links',
                type: 'checkbox',
              }),
              ' ',
              'source links',
            ]),
          ]),
        ]),
      ]),
      div({
        [ATTRIBUTE_FAIL]: getStatus(node, stats),
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

function onError(error) {
  main(
    document.body.querySelector(TEST_REPORT_SELECTOR),
    p(`Fatal error: ${error.message}`)
  );
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
    .then(write)
    .catch(onError);
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
