/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { component } from '/browser/component.js';
import {
  append,
  createTextNode,
  replaceNode,
  select,
  setAttribute,
} from '/browser/dom.js';
import {
  link,
  section, h2, ul, ol, li, div, table, tr, th, td,
  em, strong,
  pre, code, span, anchor,
} from '/browser/html.js';

const { sign } = Math;
const { parse } = JSON;
const { assign } = Object;
const INCREMENT = 1;
const EXTENSION = '.js';
const TEST_EXTENSION = `.test${EXTENSION}`;
const ATTRIBUTE_FAIL = 'data-fail';
const statusList = ['passing', 'failing'];

const FAILING = Symbol('failing');
const SECTION_NODE = Symbol('section node');
const STATUS_NODE = Symbol('status node');
const HEADING_NODE = Symbol('heading node');

const stateMarker = state => (state ? em : strong);

const markState = (state, children) =>
  stateMarker(state)(children);

const displayUrl = url =>
  url.replace(/^\//, '');

const sourceLink = href =>
  anchor({
    href,
    target: '_blank',
  }, displayUrl(href));

function isHidden(value) {
  return !parse(value);
}

const increment = number => (number + INCREMENT);

const marker = ([main, sub]) =>
  span([
    [main, increment(sub)].join('.'),
    ' ',
  ]);

const assertionTable = ({
  isAssertionHidden,
  isTestPassing,
  assertion: [
    [actualType, actualValue],
    [expectedType, expectedValue],
  ],
}) =>
  div({
    hidden: (isAssertionHidden && isTestPassing),
  }, table([
    tr([
      th({ scope: 'row' }, 'actual'),
      td(code(actualType)),
      td(pre(code(markState(isTestPassing, String(actualValue))))),
    ]),
    tr([
      th({ scope: 'row' }, 'expected'),
      td(code(expectedType)),
      td(pre(code(String(expectedValue)))),
    ]),
  ]));

function callMethod(instance, name, argumentList) {
  const methods = instance.methods();

  if (methods[name]) {
    methods[name](...argumentList);
  }
}

function delegateError(instance, reason) {
  const [
    index,
    module,
  ] = instance.attributes('index', 'module');

  console.error(index, module, reason);

  callMethod(instance, 'onRejected', [reason]);
}

function renderResult(instance, [, list, [tests, failing]]) {
  updateSection(instance, tests, failing);
  instance.set(FAILING, failing);

  append(instance.get(SECTION_NODE), [
    ul({
      hidden: isHidden(instance.attributes('sources')),
    }, [
      li([
        'test module: ',
        sourceLink(getUrl(instance, TEST_EXTENSION)),
      ]),
      li([
        'module under test: ',
        sourceLink(getUrl(instance, EXTENSION)),
      ]),
    ]),
    createResultList(instance, list, failing),
  ]);

  callMethod(instance, 'onResolved', [(tests - failing), failing]);
}

function updateSection(instance, tests, failingCount) {
  const status = statusList[sign(failingCount)];

  replaceNode(instance.get(STATUS_NODE), createTextNode(status));
  instance.get(HEADING_NODE)
    .appendChild(createTextNode(` (${tests} tests)`));

  if (failingCount) {
    instance.get(SECTION_NODE)
      .setAttribute(ATTRIBUTE_FAIL, '');
  }
}

function createResultList(instance, suite, failing) {
  const toListItem = ([
    description,
    isTestPassing,
    assertion,
  ], testIndex) =>
    li({
      [ATTRIBUTE_FAIL]: !isTestPassing,
    }, [
      marker([instance.attributes('index'), testIndex]),
      code(`[${statusList[Number(!isTestPassing)]}]`),
      ' ',
      markState(isTestPassing, description),
      assertionTable({
        isAssertionHidden: isHidden(instance.attributes('assertions')),
        isTestPassing,
        assertion,
      }),
    ]);
  const isSuiteFailing = Boolean(failing);

  return ol({
    hidden: isHidden(instance.attributes('tests')) && !isSuiteFailing,
    [ATTRIBUTE_FAIL]: isSuiteFailing,
  }, suite.map(toListItem));
}

const getUrl = (instance, extension) => [
  ...instance.attributes('path', 'module'),
  extension,
].join('');

function load(instance) {
  const url = getUrl(instance, TEST_EXTENSION);

  return import(origin + url)
    .then(resolved => resolved.default)
    .then(result => renderResult(instance, result))
    .catch(reason => delegateError(instance, reason));
}

function createHeading(status, module, index) {
  const children = [
    code([
      '[', status, ']',
    ]),
    ' ',
    anchor({
      href: `./?m=${module}`,
    }, module),
    ' test suite ',
  ];

  if (index) {
    children.unshift(span(index));
  }

  return h2(children);
}

function setHeadingNode(instance) {
  const [index, module] = instance.attributes('index', 'module');
  const statusNode = createTextNode('loading');

  instance
    .set(STATUS_NODE, statusNode)
    .set(HEADING_NODE, createHeading(statusNode, module, index));
}

function setup(instance) {
  setHeadingNode(instance);

  const sectionNode = section(instance.get(HEADING_NODE));

  sectionNode.style.visibility = 'hidden';
  instance.set(SECTION_NODE, sectionNode);
}

function overloadSelector(selector, value, failing) {
  const boolean = parse(value);

  if (selector === 'ul') {
    return boolean;
  }

  return (failing || boolean);
}

function toggle(instance, selector, value) {
  const nodeArray = select(selector, instance.root);
  const isVisible = overloadSelector(
    selector,
    value,
    instance.get(FAILING)
  );

  for (const contextNode of nodeArray) {
    setAttribute(contextNode, 'hidden', !isVisible);
  }
}

function setFontWeight(instance) {
  const [tests, sources] = instance.attributes('tests', 'sources');
  const collapsed = (
    isHidden(tests)
    && isHidden(sources)
  );

  assign(instance.get(HEADING_NODE).style, {
    fontWeight: collapsed ? '' : 'bold',
  });
}

component('test-suite', {
  attributes: {
    tests(instance, value) {
      toggle(instance, 'ol', value);
      setFontWeight(instance);
    },

    assertions(instance, value) {
      toggle(instance, 'ol > li > div', value);
    },

    sources(instance, value) {
      toggle(instance, 'ul', value);
      setFontWeight(instance);
    },
  },

  connect(instance) {
    instance.set(FAILING, false);
    setup(instance);
  },

  render(instance) {
    const sectionNode = instance.get(SECTION_NODE);
    const { origin } = new URL(import.meta.url);

    append(instance.root, [
      link({
        href: `${origin}/test/test-suite.css`,
        rel: 'stylesheet',
        onload() {
          sectionNode.style.visibility = '';
        },
      }),
      sectionNode,
    ]);
    setFontWeight(instance);
    load(instance);
  },
});
