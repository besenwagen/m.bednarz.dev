/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { component } from '/browser/component.js';
import {
  append,
  createElement,
  createFragment,
  createTextNode,
  purge,
  replaceNode,
  select,
} from '/browser/dom.js';
import {
  style,
  div, paragraph,
  label, input,
  em, strong,
} from '/browser/html.js';
import {
  cssLiteral,
  minWidth,
} from '/browser/css.js';
import './suite.js';

/* global window */

const COLOR_ACTION = '#00c';
const COLOR_PASSING = '#060';
const ERROR_FOREGROUND = '#900';
const ERROR_BACKGROUND = '#ffc';
const BREAKPOINT = '768px';
const SCALE = '1.5em';
const TOOLBAR_SELECTOR = ':host > div > div:first-child';

const styleContent = cssLiteral({
  ':host > div': {
    padding: `0 0 0 ${SCALE}`,
  },
  [TOOLBAR_SELECTOR]: {
    paddingRight: SCALE,
  },
  '.fatal-error': {
    border: `1px solid ${ERROR_FOREGROUND}`,
    padding: `0 calc(${SCALE} / 2)`,
    color: ERROR_FOREGROUND,
    background: ERROR_BACKGROUND,
  },
  strong: {
    color: ERROR_FOREGROUND,
    background: 'transparent',
  },
  em: {
    color: COLOR_PASSING,
    background: 'transparent',
  },
  'input[type="checkbox"]': {
    margin: '0',
    verticalAlign: 'middle',
  },
  'input[type="checkbox"]:not([disabled]):hover': {
    cursor: 'pointer',
  },
  'input[type="checkbox"]:focus': {
    outline: `2px solid ${COLOR_ACTION}`,
  },
  [minWidth(BREAKPOINT)]: {
    [TOOLBAR_SELECTOR]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: `${SCALE} 0`,
    },
    [`${TOOLBAR_SELECTOR} > p`]: {
      margin: `0 calc(${SCALE} / 2) 0 0`,
    },
  },
});

const INCREMENT = 1;
const QUERY_EXPRESSION = /(?:\?|&)m=([^&]+)(?:&|$)/i;

function matchQuery() {
  const { search } = window.location;

  return QUERY_EXPRESSION.exec(search);
}

function getQueryModules() {
  const match = matchQuery();

  if (match) {
    const [, backReference] = match;

    return [backReference];
  }

  return '';
}

function asAttributes(value) {
  if (typeof value === 'string') {
    return {
      name: value,
    };
  }

  return value;
}

const checkbox = (attributes, title) =>
  label([
    input({
      ...asAttributes(attributes),
      type: 'checkbox',
    }),
    ' ',
    title,
  ]);

const isCheckbox = ({ nodeName, type }) => (
  (nodeName === 'INPUT')
  && (type === 'checkbox')
);

const toNodeValue = ({
  firstChild: {
    nodeValue,
  },
}) => nodeValue;

const getDeclarativeModules = contextNode =>
  select('ol li', contextNode)
    .map(toNodeValue);

const EXCEPTION_PREFIX = 'Fatal error:';
const LOADING = 'Loading';

const SETTLED_SUITES = Symbol('settled suites');
const PASSING_TESTS = Symbol('passing tests');
const FAILING_TESTS = Symbol('failing tests');
const MODULE_LIST = Symbol('module list');
const SUMMARY_NODE = Symbol('summary node');

function toggleSuiteSection(rootNode, ...argumentList) {
  const suites = select('test-suite', rootNode);

  for (const suite of suites) {
    suite.setAttribute(...argumentList);
  }
}

function getModuleList(rootNode) {
  return (
    getQueryModules()
    || getDeclarativeModules(rootNode)
  );
}

function getSummary(passing, failing) {
  if (failing) {
    const all = (passing + failing);

    return [
      strong(`${failing} of ${all} tests failing`),
      ' in ',
    ];
  }

  return [
    em(`${passing} tests passing`),
    ' in ',
  ];
}

function getSummaryNode(instance) {
  const stats = [
    PASSING_TESTS,
    FAILING_TESTS,
  ]
    .map(key => instance.get(key));

  const summary = getSummary(...stats);

  return createFragment(summary);
}

function done(instance) {
  replaceNode(instance.get(SUMMARY_NODE), getSummaryNode(instance));

  for (const node of select('[aria-hidden]', instance.root)) {
    node.removeAttribute('aria-hidden');
  }
}

function updateStatus(instance) {
  instance.set(SETTLED_SUITES,
    (instance.get(SETTLED_SUITES) + INCREMENT));

  if (
    instance.get(SETTLED_SUITES)
    === instance.get(MODULE_LIST).length
  ) {
    done(instance);
  }
}

component('test-report', {
  events: {
    click({ target }, instance) {
      if (isCheckbox(target)) {
        const { name, checked } = target;
        const { root } = instance;

        toggleSuiteSection(root, name, String(checked));
      }
    },
  },

  initialize(instance) {
    const index = 0;

    instance
      .set(PASSING_TESTS, index)
      .set(FAILING_TESTS, index)
      .set(SETTLED_SUITES, index);
  },

  connect(instance) {
    instance
      .set(MODULE_LIST, getModuleList())
      .set(SUMMARY_NODE, createTextNode(LOADING));
  },

  render(instance) {
    const moduleList = instance.get(MODULE_LIST);
    const { length } = moduleList;
    const checked = (length === INCREMENT);

    const toSuite = (name, index) =>
      createElement('test-suite', {
        module: name,
        path: instance.attributes('path'),
        index: (index + INCREMENT),
        tests: (length === INCREMENT) ? 'true' : 'false',
        assertions: 'false',
        sources: 'false',
        onResolved(passing, failing) {
          instance
            .set(PASSING_TESTS,
              (instance.get(PASSING_TESTS) + passing))
            .set(FAILING_TESTS,
              (instance.get(FAILING_TESTS) + failing));
          updateStatus(instance);
        },
        onRejected(reason) {
          const [echoArea] = select(
            'div > div:first-child',
            instance.root
          );

          purge(echoArea);
          append(echoArea, paragraph({
            class: 'fatal-error',
          }, [
            strong(EXCEPTION_PREFIX),
            ' ',
            String(reason),
          ]));
        },
      });

    append(instance.root, [
      style(styleContent),
      div([
        div([
          paragraph({
            'aria-live': 'polite',
          }, [
            instance.get(SUMMARY_NODE),
            ` ${length} test suites.`,
          ]),
          div([
            'Show all: ',
            checkbox({
              checked,
              disabled: checked,
              name: 'tests',
            }, 'tests'),
            ' ',
            checkbox('assertions', 'assertions'),
            ' ',
            checkbox('sources', 'sources'),
          ]),
        ]),
        div({
          'aria-hidden': 'true',
        }, moduleList.map(toSuite)),
      ]),
    ]);
  },
});
