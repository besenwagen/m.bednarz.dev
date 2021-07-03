/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
import { component } from './component.js';
import {
  append,
  create_element,
  create_fragment,
  create_text_node,
  purge,
  replace_node,
  select,
} from '/browser/dom.js';
import {
  style,
  div, paragraph,
  label, input,
  em, strong,
} from '/browser/html.js';
import { css, min_width } from '/browser/css.js';
import './suite.js';

/* global window */

//#region Style Sheet

const COLOR_ACTION = '#00c';
const COLOR_PASSING = '#060';
const ERROR_FOREGROUND = '#900';
const ERROR_BACKGROUND = '#ffc';
const BREAKPOINT = '768px';
const SCALE = '1.5em';
const TOOLBAR_SELECTOR = ':host > div > div:first-child';

const style_content = css`
:host > div {
  padding: 0 0 0 ${SCALE};
}

${TOOLBAR_SELECTOR} {
  padding-right: ${SCALE};
}

.fatal-error {
  border: 1px solid ${ERROR_FOREGROUND};
  padding: 0 calc(${SCALE} / 2);
  color: ${ERROR_FOREGROUND};
  background: ${ERROR_BACKGROUND};
}

strong {
  color: ${ERROR_FOREGROUND};
  background: transparent;
}

em {
  color: ${COLOR_PASSING};
  background: transparent;
}

input[type="checkbox"] {
  margin: 0;
  vertical-align: middle;
}

input[type="checkbox"]:not([disabled]):hover {
  cursor: pointer;
}

input[type="checkbox"]:focus {
  outline: 2px solid ${COLOR_ACTION};
}

${min_width(BREAKPOINT)} {
  ${TOOLBAR_SELECTOR} {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: ${SCALE} 0;
  }

  ${TOOLBAR_SELECTOR} > p {
    margin: 0 calc(${SCALE} / 2) 0 0;
  }
}
`;

//#endregion

const INCREMENT = 1;
const QUERY_EXPRESSION = /(?:\?|&)m=([^&]+)(?:&|$)/i;

function match_query() {
  const { search } = window.location;

  return QUERY_EXPRESSION.exec(search);
}

function get_query_modules() {
  const match = match_query();

  if (match) {
    const [, backReference] = match;

    return [backReference];
  }

  return '';
}

function as_attributes(value) {
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
      ...as_attributes(attributes),
      type: 'checkbox',
    }),
    ' ',
    title,
  ]);

const is_checkbox = ({ nodeName, type }) => (
  (nodeName === 'INPUT')
  && (type === 'checkbox')
);

const to_node_value = ({
  firstChild: {
    nodeValue,
  },
}) => nodeValue;

const get_declarative_modules = context_node =>
  select('ol li', context_node)
    .map(to_node_value);

const EXCEPTION_PREFIX = 'Fatal error:';
const LOADING = 'Loading';

const SETTLED_SUITES = Symbol('settled suites');
const PASSING_TESTS = Symbol('passing tests');
const FAILING_TESTS = Symbol('failing tests');
const MODULE_LIST = Symbol('module list');
const SUMMARY_NODE = Symbol('summary node');

function toggle_suite_section(root_node, ...argument_list) {
  const suites = select('test-suite', root_node);

  for (const suite of suites) {
    suite.setAttribute(...argument_list);
  }
}

function get_module_list(root_node) {
  return (
    get_query_modules()
    || get_declarative_modules(root_node)
  );
}

function plural(count, word) {
  const base = `${count} ${word}`;
  const singular = 1;

  if (count === singular) {
    return base;
  }

  return `${base}s`;
}

function get_summary(passing, failing) {
  if (failing) {
    const all = (passing + failing);

    return [
      strong(`${failing} of ${all} tests failing`),
      ' in ',
    ];
  }

  return [
    em(`${plural(passing, 'test')} passing`),
    ' in ',
  ];
}

function get_summary_node(instance) {
  const stats = [
    PASSING_TESTS,
    FAILING_TESTS,
  ]
    .map(key => instance.get(key));

  const summary = get_summary(...stats);

  return create_fragment(summary);
}

function done(instance) {
  replace_node(instance.get(SUMMARY_NODE), get_summary_node(instance));

  for (const node of select('[aria-hidden]', instance.root)) {
    node.removeAttribute('aria-hidden');
  }
}

function update_status(instance) {
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
      if (is_checkbox(target)) {
        const { name, checked } = target;
        const { root } = instance;

        toggle_suite_section(root, name, String(checked));
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
      .set(MODULE_LIST, get_module_list())
      .set(SUMMARY_NODE, create_text_node(LOADING));
  },

  render(instance) {
    const module_list = instance.get(MODULE_LIST);
    const { length } = module_list;
    const checked = (length === INCREMENT);

    const to_suite = (name, index) =>
      create_element('test-suite', {
        module: name,
        path: instance.attributes('path'),
        index: (index + INCREMENT),
        tests: (length === INCREMENT) ? 'true' : 'false',
        assertions: 'false',
        sources: 'false',
        on_resolved(passing, failing) {
          instance
            .set(PASSING_TESTS,
              (instance.get(PASSING_TESTS) + passing))
            .set(FAILING_TESTS,
              (instance.get(FAILING_TESTS) + failing));
          update_status(instance);
        },
        on_rejected(reason) {
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
      style(style_content),
      div([
        div([
          paragraph({
            'aria-live': 'polite',
          }, [
            instance.get(SUMMARY_NODE),
            ` ${plural(length, 'test suite')}.`,
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
        }, module_list.map(to_suite)),
      ]),
    ]);
  },
});
